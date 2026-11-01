# Url Redirect

Firefox extension that redirects URLs based on user-defined wildcard rules.

## Configuration
Click the toolbar icon to open the rules page. Each rule has a "From"
pattern and a "To" template, and can be enabled, edited or deleted.

- `*` in "From" matches any text and captures it.
- `$1`, `$2`, ... in "To" insert the captures in order.
- "From" must match the whole URL.

Example: `https://example.com/*` → `https://example-mirror.com/$1`

## Behavior
- Rules are checked in list order; the first match wins.
- Applies to all requests (`webRequest.onBeforeRequest`), not just top-level
  navigation.
- Rules are stored in `storage.sync`.
