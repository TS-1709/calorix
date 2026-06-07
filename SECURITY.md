# Security

If you find a security issue, email `security@schrdl.de` instead of opening a public issue.

Calorix is a fully client-side PWA. There is no server. The threat model is mostly local:

- **XSS** in food/coach content (we render plain text via React; never `dangerouslySetInnerHTML`)
- **Storage tampering** — users can edit their own `localStorage`. That's their data, not a vulnerability
- **Service Worker** cache poisoning — see `public/service-worker.js`. We only cache same-origin GET responses
- **No backend** means no SQL injection, no auth bypass, no token leakage

## Reporting

Use GitHub private security advisories or email. Please do not open a public issue.
