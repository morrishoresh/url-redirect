let rules = [];

function loadRules() {
  return browser.storage.sync.get("rules").then((res) => {
    rules = res.rules || [];
  });
}

// Convert a wildcard pattern ("*" = capture group) into a RegExp.
// All other regex-special characters are escaped literally.
function compileFrom(pattern) {
  const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  const withGroups = escaped.split("\\*").join("(.*)");
  return new RegExp("^" + withGroups + "$");
}

// Substitute $1, $2, ... in the target template with captured groups.
function buildTarget(template, match) {
  let result = template;
  for (let i = match.length - 1; i >= 1; i--) {
    result = result.split("$" + i).join(match[i] !== undefined ? match[i] : "");
  }
  return result;
}

browser.webRequest.onBeforeRequest.addListener(
  function (details) {
    for (const rule of rules) {
      if (rule.enabled === false) continue;
      if (!rule.from || !rule.to) continue;

      let regex;
      try {
        regex = compileFrom(rule.from);
      } catch (e) {
        continue;
      }

      const match = details.url.match(regex);
      if (match) {
        const target = buildTarget(rule.to, match);
        if (target && target !== details.url) {
          return { redirectUrl: target };
        }
      }
    }
    return {};
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.rules) {
    rules = changes.rules.newValue || [];
  }
});

loadRules();

browser.browserAction.onClicked.addListener(() => {
  browser.runtime.openOptionsPage();
});
