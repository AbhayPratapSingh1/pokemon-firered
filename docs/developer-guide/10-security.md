# Security

## Current State

Minimal security considerations — this is a client-side-only game with no server, no authentication, and no user data beyond localStorage.

## Observations

| Area | Status |
|------|--------|
| Input validation | None — editor accepts any numeric values |
| XSS | Low risk — no user-supplied HTML rendered; `prompt()`/`alert()` used for input |
| localStorage | Unencrypted, same-origin only; stores model data only |
| External CDN | Three.js loaded from unpkg.com (supply chain risk) |
| Secrets | None — no API keys, no server credentials |
| Model import | `JSON.parse()` on imported files — no sanitization of parsed data |

## Recommendations (if expanding)

- Sanitize imported model JSON before processing
- Consider CSP headers if serving from a web server
- Validate model part sizes/ranges in the editor
- Be aware that localStorage is shared across all pages on the same origin
