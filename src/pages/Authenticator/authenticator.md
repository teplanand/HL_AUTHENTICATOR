---
title: Default module
language_tabs:
  - shell: Shell
  - http: HTTP
  - javascript: JavaScript
  - ruby: Ruby
  - python: Python
  - php: PHP
  - java: Java
  - go: Go
toc_footers: []
includes: []
search: true
code_clipboard: true
highlight_theme: darkula
headingLevel: 2
generator: "@tarslib/widdershins v4.0.30"

---

# Default module

Base URLs:

* <a href="https://authenticator.techelecon.in/">Prod Env: https://authenticator.techelecon.in/</a>

# Authentication

- HTTP Authentication, scheme: bearer

# Default

## POST Login

POST /api/auth/login

> Body Parameters

 
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| yes |none|

> Response Examples

> 200 Response

```json
{"response":true,"message":"Success","data":{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YjIwZTdjZi0yNzg4LTQzYzEtYmM0MS1mOGE2OTQ1YWExYzUiLCJpYXQiOjE3Nzc4ODg0MDUsImV4cCI6MTc3Nzg4OTMwNX0._CkpNLECUvDxLK3JFNzDplQN5x9LXg818vpDA1vXwQQ","roles":["SUPERADMIN"]}}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST DashboardApi

POST /api/dashboard

> Body Parameters

```json
{}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| yes |none|

> Response Examples

> 200 Response

```json
{"response":true,"message":"success","data":[{"appId":"57da4534-8269-455a-a741-98710709fa60","appDesc":"Test","appTitle":"Test App"},{"appId":"63c89c7f-8afb-4132-97ff-ae2d18baa520","appDesc":"Authenticator","appTitle":"Authenticator"}]}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST GetUsersListByOrganizationAndDivision

POST /api/users/getUsers

> Body Parameters

```json
{
    "orgId":"e8ec88d1-d1f7-4f4e-a507-b47ba6a84b7f",
    "divId":"3daf92a4-b133-43b7-8e50-40222529234e"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| yes |none|

> Response Examples

> 200 Response

 

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## POST Add New Role

POST /api/roles/createRole

> Body Parameters

```json
{
    "appId":"57da4534-8269-455a-a741-98710709fa60",
    "roleName":"Test Role",
    "roleDesc":"Test"
}
```

### Params

|Name|Location|Type|Required|Description|
|---|---|---|---|---|
|body|body|object| yes |none|

> Response Examples

> 200 Response

```json
{"response":true,"message":"Role created Successfully","data":null}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## GET GetRoleByApp

GET /api/roles/getRoles/57da4534-8269-455a-a741-98710709fa60

> Response Examples

> 200 Response

```json
{"response":true,"message":"Success","data":[{"roleName":"Test Role","roleId":6}]}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## GET GetDivisions

GET /api/organizations/getDivision/3b2b7ef7-3e4c-483a-9dea-f75a45a65320

> Response Examples

> 200 Response

```json
{"response":true,"message":"Success","data":[{"divName":"Helical","divId":"2e1ce9c6-b4fb-4817-9a65-515f88b1c54b"}]}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

## GET GetOrganizations

GET /api/organizations/getOrganizations

> Response Examples

> 200 Response

```json
{"response":true,"message":"Success","data":[{"orgTitle":"Gear Test","orgId":"3b2b7ef7-3e4c-483a-9dea-f75a45a65320"},{"orgTitle":"TEPL","orgId":"e8ec88d1-d1f7-4f4e-a507-b47ba6a84b7f"}]}
```

### Responses

|HTTP Status Code |Meaning|Description|Data schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|none|Inline|

### Responses Data Schema

# Data Schema

