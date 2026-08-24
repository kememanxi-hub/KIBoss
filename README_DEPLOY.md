# BOSS KEYZO — Vercel deployment

1. Import this project into Vercel.
2. In Settings → Environment Variables create:
   - `LICENSE_KEYS_JSON`
   - `ADMIN_USERNAME`
   - `ADMIN_PASSWORD`
3. Example `LICENSE_KEYS_JSON` value:
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
4. Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to the credentials you want for the web login. Do not put these credentials in the APK or frontend source.
5. Select Production (and Preview if desired), Save.
6. Redeploy after changing environment variables.
7. Test:
   GET `/` -> BOSS KEYZO server page
   GET `/api/health` -> JSON health response
   POST `/api/login` with JSON:
   `{"username":"YOUR_USERNAME","password":"YOUR_PASSWORD"}`
   POST `/api/license/validate` with JSON:
   `{"key":"KEYZO-DEMO-2026","device_id":"test-device","app_version":"1.0.0"}`

Important: the current Android APK sends `POST /api/login` using a relative URL. A Capacitor APK does not automatically use the Vercel server as its API origin. After the backend is deployed, the APK frontend must be configured to call the deployed HTTPS API URL, then the APK must be rebuilt.
