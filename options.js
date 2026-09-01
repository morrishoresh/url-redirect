const rulesBody = document.getElementById("rulesBody");
const form = document.getElementById("ruleForm");
const ruleIdInput = document.getElementById("ruleId");
const fromInput = document.getElementById("fromInput");
const toInput = document.getElementById("toInput");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");

function getRules() {
  return browser.storage.sync.get("rules").then((res) => res.rules || []);
}

function setRules(rules) {
  return browser.storage.sync.set({ rules });
}

function render(rules) {
  rulesBody.innerHTML = "";

  if (rules.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="4" class="empty">No rules yet.</td>`;
    rulesBody.appendChild(tr);
    return;
  }

  for (const rule of rules) {
    const tr = document.createElement("tr");

    const onTd = document.createElement("td");
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = rule.enabled !== false;
    checkbox.addEventListener("change", async () => {
      const all = await getRules();
      const target = all.find((r) => r.id === rule.id);
      if (target) {
        target.enabled = checkbox.checked;
        await setRules(all);
      }
    });
    onTd.appendChild(checkbox);

    const fromTd = document.createElement("td");
    fromTd.textContent = rule.from;

    const toTd = document.createElement("td");
    toTd.textContent = rule.to;

    const actionsTd = document.createElement("td");
    actionsTd.className = "actions";

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(rule));

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "danger";
    delBtn.addEventListener("click", async () => {
      const all = await getRules();
      await setRules(all.filter((r) => r.id !== rule.id));
      refresh();
    });

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(delBtn);

    tr.appendChild(onTd);
    tr.appendChild(fromTd);
    tr.appendChild(toTd);
    tr.appendChild(actionsTd);
    rulesBody.appendChild(tr);
  }
}

function startEdit(rule) {
  ruleIdInput.value = rule.id;
  fromInput.value = rule.from;
  toInput.value = rule.to;
  saveBtn.textContent = "Update rule";
  cancelBtn.style.display = "inline-block";
  formTitle.textContent = "Edit rule";
  fromInput.focus();
}

function resetForm() {
  form.reset();
  ruleIdInput.value = "";
  saveBtn.textContent = "Save rule";
  cancelBtn.style.display = "none";
  formTitle.textContent = "Add rule";
}

cancelBtn.addEventListener("click", resetForm);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const from = fromInput.value.trim();
  const to = toInput.value.trim();
  if (!from || !to) return;

  const all = await getRules();
  const editId = ruleIdInput.value;

  if (editId) {
    const target = all.find((r) => r.id === editId);
    if (target) {
      target.from = from;
      target.to = to;
    }
  } else {
    all.push({
      id: crypto.randomUUID(),
      enabled: true,
      from,
      to,
    });
  }

  await setRules(all);
  resetForm();
  refresh();
});

async function refresh() {
  const rules = await getRules();
  render(rules);
}

browser.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.rules) {
    render(changes.rules.newValue || []);
  }
});

refresh();
