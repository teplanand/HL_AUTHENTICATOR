# HL Tech Authenticator Shell

Aa project have `central auth shell` tarike kaam kari shake che:

- `signin` common rahe che
- login pachi user ne je apps no access hoy e `/apps` par dekhay che
- koi app ni remote URL env ma configured hoy to shell te deployed module par redirect kare che
- remote URL na hoy to current internal route fallback tarike use thay che

## Remote module deployment

`.env.example` ma aapela vars ma darek module ni deployed URL muki shakay:

```env
VITE_BARCODE_APP_URL=https://barcode.example.com
VITE_EVIDANCE_APP_URL=https://evidence.example.com
VITE_WAREHOUSE_APP_URL=https://warehouse.example.com
```

Pachhi login success thay ane user app tile par click kare tyare:

1. authenticator thi app permission fetch thay
2. permission payload local storage ma save thay
3. jo remote URL configured hoy to shell te module URL open kare
4. jo remote URL configured na hoy to internal route open thay

## Important note

Cross-domain deployment mate shared auth/SSO strategy joiye. Aa shell external launch support aape che, pan alag domain par deployed modules ne same user session trust karavva mate backend/cookie/token integration alag thi align karvi padse.
