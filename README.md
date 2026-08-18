# HL Tech Authenticator Shell

This project works as a `central auth shell` in the following way:

- `signin` is common across all apps
- after login, users see the apps they have access to on the `/apps` page
- if an app has a remote URL configured in the environment, the shell redirects to the deployed module
- if no remote URL is configured, it falls back to using the current internal route

## Remote module deployment

In `.env.example`, you can define the deployed URLs for each module in your environment variables:

```env
VITE_BARCODE_APP_URL=https://barcode.example.com
VITE_EVIDANCE_APP_URL=https://evidence.example.com
VITE_WAREHOUSE_APP_URL=https://warehouse.example.com
```

When login is successful and the user clicks on an app tile:

1. app permissions are fetched from the authenticator
2. the permission payload is saved to local storage
3. if a remote URL is configured, the shell opens the module URL
4. if no remote URL is configured, the internal route is opened

## Important note

For cross-domain deployment, a shared auth/SSO strategy is required. While this shell supports external launches, modules deployed on different domains will need backend/cookie/token integration to be aligned separately to trust the same user session.
