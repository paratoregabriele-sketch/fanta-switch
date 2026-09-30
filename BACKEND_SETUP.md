# Fanta Switch backend

Backend serverless pronto per Vercel.

Variabile segreta richiesta: `API_FOOTBALL_KEY`.
Non inserire mai la chiave nel repository o nel frontend.

Endpoint:
- `/api/status` verifica API-Football
- `/api/league` individua Serie A stagione 2026

Dopo il deploy, il frontend GitHub Pages potrà interrogare questi endpoint senza esporre la chiave.
