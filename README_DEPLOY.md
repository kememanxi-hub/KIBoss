# BOSS KEYZO — Vercel deployment

1. Import this project into Vercel.
2. In Settings → Environment Variables create:
   `LICENSE_KEYS_JSON`
3. Example value:
```json
[
  {
    "key": "KEYZO-DEMO-2026",
    "status": "active",
    "expires_at": "2027-12-31T23:59:59Z",
    "device_id": null
  }
]
```
4. Select Production (and Preview if desired), Save.
5. Redeploy.
6. Test:
   GET `/` -> BOSS KEYZO server page
   GET `/api/health` -> JSON health response
   POST `/api/license/validate` with JSON:
   {"key":"KEYZO-DEMO-2026","device_id":"test-device","app_version":"1.0.0"}
