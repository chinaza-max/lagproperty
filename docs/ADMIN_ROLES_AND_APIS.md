# LagProperty Admin APIs & Role-Based Access Control (RBAC) Documentation

This document provides complete technical specifications for the **Admin Role-Based Access Control (RBAC) system** and all **Admin Backend APIs** in LagProperty platform.

---

## 1. Admin Roles & Privilege Matrix

The system implements fine-grained Role-Based Access Control (RBAC) enforced via `rbac.middleware.js`.

### Available Admin Roles

| Role | Label | Purpose & Access Scope |
| :--- | :--- | :--- |
| `super_admin` | Super Administrator | **Full Administrative Access** (`*`). Can manage admin accounts, change roles, blacklist agents, view financial analytics, access user directories, and configure settings. |
| `finance_admin` | Finance Administrator | **Financial & Revenue Access**. Can view user transaction histories by NIN, income statements, escrow balances, and financial analytics. |
| `compliance_admin` | Compliance & Verification | **User Audit & Fraud Control**. Can verify user NINs, audit verification documents, blacklist fraudulent agents with recorded reasons, and unblacklist agents. |
| `property_admin` | Property Administrator | **Housing & Directory Management**. Can view property listings, location housing metrics, landlord/agent directories, and building details. |
| `support_admin` | Support Administrator | **Read-Only Customer Support**. Can view tenant profiles, landlord details, building listings, and basic admin user lists for support tasks. |

---

## 2. Authentication & Headers

All Admin endpoints require Bearer JWT authentication:

```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
Content-Type: application/json
```

---

## 3. Admin APIs Reference

### Section A: Admin Account & Role Management

#### 1. Create Admin Account
- **Method / Path**: `POST /api/v1/admin/create`
- **Required Role**: `super_admin`
- **Request Body**:
```json
{
  "emailAddress": "finance.admin@lagproperty.com",
  "password": "SecurePassword123!",
  "firstName": "Financial",
  "lastName": "Manager",
  "role": "finance_admin",
  "privilege": "financial_analytics,transactions,escrow"
}
```
- **Response `201 Created`**:
```json
{
  "status": 201,
  "message": "Admin account created successfully.",
  "data": {
    "id": 2,
    "emailAddress": "finance.admin@lagproperty.com",
    "firstName": "Financial",
    "lastName": "Manager",
    "role": "finance_admin",
    "privilege": "financial_analytics,transactions,escrow",
    "disableAccount": false,
    "createdAt": "2026-07-21T23:00:00.000Z"
  }
}
```

#### 2. Get All Admins (Paginated)
- **Method / Path**: `GET /api/v1/admin/list`
- **Required Role**: `super_admin`, `support_admin`
- **Query Params**: `page` (default 1), `limit` (default 10)
- **Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Admin list fetched successfully.",
  "data": [
    {
      "id": 1,
      "emailAddress": "super.admin@lagproperty.com",
      "firstName": "Super",
      "lastName": "Admin",
      "role": "super_admin",
      "privilege": "all",
      "disableAccount": false
    }
  ],
  "pagination": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### 3. Update Admin Role & Privileges
- **Method / Path**: `PATCH /api/v1/admin/:id/role`
- **Required Role**: `super_admin`
- **Request Body**:
```json
{
  "role": "compliance_admin",
  "privilege": "agent_blacklist,nin_lookup"
}
```

#### 4. Enable / Disable Admin Account
- **Method / Path**: `PATCH /api/v1/admin/:id/status`
- **Required Role**: `super_admin`
- **Request Body**:
```json
{
  "disableAccount": true
}
```

---

### Section B: Analytics & Financial Dashboard

#### 1. User Transactions & Financial Breakdown by NIN
- **Method / Path**: `GET /api/v1/analytics/nin-transactions`
- **Required Role**: Admin
- **Query Parameters**:
  - `nin` (required): User's 11-digit NIN string
  - `userType` (optional): `tenant`, `landlord`, or `agent`
  - `page` (default 1), `limit` (default 10)
- **Response `200 OK`**:
```json
{
  "status": 200,
  "message": "User NIN transaction data fetched successfully.",
  "user": {
    "id": 10,
    "firstName": "Oluwaseun",
    "lastName": "Adeyemi",
    "emailAddress": "tenant@example.com",
    "tel": "08012345678",
    "nin": "12345678901",
    "isNINValid": true,
    "role": "tenant",
    "disableAccount": false
  },
  "summary": {
    "totalSpent": 1500000,
    "totalReceived": 0,
    "transactionCount": 3
  },
  "data": [
    {
      "id": 101,
      "amount": 500000,
      "transactionType": "firstRent",
      "paymentStatus": "successful",
      "paymentReference": "REF-998877",
      "createdAt": "2026-06-01T12:00:00.000Z",
      "Building": {
        "id": 5,
        "propertyPreference": "flat",
        "city": "Ikeja",
        "address": "15 Allen Avenue"
      }
    }
  ],
  "pagination": {
    "totalItems": 3,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

#### 2. Location Housing & Entity Analytics
- **Method / Path**: `GET /api/v1/analytics/housing-by-location`
- **Required Role**: Admin
- **Query Parameters**: `city`, `state`, `page`, `limit`
- **Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Housing location analytics fetched successfully.",
  "data": [
    {
      "city": "Lekki",
      "state": "Lagos",
      "totalBuildings": 24,
      "vacantCount": 10,
      "occupiedCount": 12,
      "bookedCount": 2,
      "totalPropertyManagers": 8,
      "agentCount": 5,
      "landlordCount": 3
    }
  ],
  "pagination": {
    "totalItems": 1,
    "totalPages": 1,
    "currentPage": 1,
    "pageSize": 10
  }
}
```

#### 3. System Dashboard Overview KPIs
- **Method / Path**: `GET /api/v1/analytics/dashboard-overview`
- **Required Role**: Admin
- **Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Dashboard overview metrics retrieved successfully.",
  "data": {
    "users": {
      "totalTenants": 1420,
      "totalLandlords": 210,
      "totalAgents": 85,
      "totalBlacklistedAgents": 3
    },
    "properties": {
      "totalBuildings": 350,
      "vacantBuildings": 120,
      "occupiedBuildings": 210,
      "bookedBuildings": 20
    },
    "financials": {
      "totalTransactions": 2840,
      "totalTransactionVolume": 450000000
    }
  }
}
```

#### 4. Property Preference Distribution
- **Method / Path**: `GET /api/v1/analytics/property-distribution`
- **Required Role**: Admin
- **Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Property distribution analytics retrieved successfully.",
  "data": [
    {
      "propertyType": "flat",
      "count": 180,
      "averagePrice": 1200000,
      "minPrice": 500000,
      "maxPrice": 3500000
    },
    {
      "propertyType": "self-contain",
      "count": 110,
      "averagePrice": 450000,
      "minPrice": 250000,
      "maxPrice": 800000
    }
  ]
}
```

---

### Section C: User Directory (Tenants, Landlords, Agents)

#### 1. List All Tenants & Prospective Tenants
- **Method / Path**: `GET /api/v1/admin/users/tenants`
- **Required Role**: `super_admin`, `support_admin`, `compliance_admin`, `property_admin`
- **Query Parameters**: `search` (name, email, tel, NIN), `role`, `page`, `limit`
- **Response `200 OK`**: Returns tenant details with active/past rental history.

#### 2. List All Landlords & Agents
- **Method / Path**: `GET /api/v1/admin/users/landlords-agents`
- **Required Role**: `super_admin`, `support_admin`, `compliance_admin`, `property_admin`
- **Query Parameters**: `type` (`landLord`, `agent`, `unset`), `isBlacklisted`, `search`, `page`, `limit`
- **Response `200 OK`**: Returns landlord/agent details with property counts (`totalPropertiesListed`, `vacantPropertiesCount`, `occupiedPropertiesCount`).

#### 3. Single Tenant Full Detail View
- **Method / Path**: `GET /api/v1/admin/users/tenant-details/:id`
- **Required Role**: Admin
- **Response `200 OK`**: Complete profile, houses rented, inspection requests, reviews, and transaction history.

#### 4. Single Landlord / Agent Full Detail View
- **Method / Path**: `GET /api/v1/admin/users/manager-details/:id`
- **Required Role**: Admin
- **Response `200 OK`**: Complete profile, all listed houses/buildings (vacant/occupied), active tenants in their houses, and tenant reviews.

#### 5. List Properties Listed by Specific Landlord / Agent (Paginated)
- **Method / Path**: `GET /api/v1/admin/users/manager-properties/:managerId`
- **Required Role**: `super_admin`, `support_admin`, `compliance_admin`, `property_admin`
- **Query Parameters**: `availability` (`vacant`, `occupied`, `booked`), `city`, `search`, `page` (default 1), `limit` (default 10)
- **Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Landlord/Agent listed properties retrieved successfully.",
  "manager": {
    "id": 4,
    "firstName": "Babalola",
    "lastName": "Properties",
    "companyName": "Babalola & Co",
    "emailAddress": "landlord@example.com",
    "tel": "08099887766",
    "type": "landLord"
  },
  "summary": {
    "totalListed": 12,
    "vacantCount": 5,
    "occupiedCount": 6,
    "bookedCount": 1
  },
  "data": [
    {
      "id": 10,
      "propertyPreference": "flat",
      "city": "Ikeja",
      "address": "12 Allen Avenue",
      "price": 1500000,
      "availability": "vacant",
      "furnishingStatus": "furnished",
      "propertyTerms": "Standard tenancy agreement apply..."
    }
  ],
  "pagination": {
    "totalItems": 12,
    "totalPages": 2,
    "currentPage": 1,
    "pageSize": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

### Section D: Listed Buildings & Reviews Directory

#### 1. All Listed Buildings Directory
- **Method / Path**: `GET /api/v1/admin/buildings/all`
- **Required Role**: `super_admin`, `support_admin`, `property_admin`
- **Query Parameters**: `availability` (`vacant`, `occupied`, `booked`), `city`, `propertyPreference`, `search`, `page`, `limit`

#### 2. Building Full Details & Reviews
- **Method / Path**: `GET /api/v1/admin/buildings/:id/details`
- **Required Role**: `super_admin`, `support_admin`, `property_admin`
- **Response `200 OK`**: Building specifications, property manager owner details, current occupants/tenants, inspection logs, quit notices, and tenant reviews.

#### 3. View Uploaded Building Terms & Conditions
- **Method / Path**: `GET /api/v1/admin/buildings/:id/terms`
- **Required Role**: `super_admin`, `support_admin`, `property_admin`
- **Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Building uploaded terms and conditions fetched successfully.",
  "data": {
    "buildingId": 10,
    "propertyPreference": "flat",
    "city": "Ikeja",
    "address": "12 Allen Avenue",
    "price": 1500000,
    "availability": "vacant",
    "termsAndConditions": "1. Rent is non-refundable. 2. No pets allowed. 3. Subletting strictly prohibited.",
    "uploadedAt": "2026-07-24T18:00:00.000Z",
    "propertyManager": {
      "id": 4,
      "firstName": "Babalola",
      "lastName": "Properties",
      "companyName": "Babalola & Co",
      "emailAddress": "landlord@example.com"
    }
  }
}
```

---

### Section E: Admin Export Reports (Excel .xlsx)

#### 1. Export Excel Report
- **Method / Path**: `GET /api/v1/admin/reports/export`
- **Required Role**: `super_admin`, `finance_admin`, `compliance_admin`, `property_admin`
- **Query Parameters**:
  - `type` (required): `buildings`, `landlords-agents`, `tenants`, `transactions`, `blacklisted-agents`
- **Response**: Binary Excel file stream (`.xlsx`) with `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.

---

### Section F: Targeted Push Notifications

#### 1. Send Push Notification to Targeted Groups
- **Method / Path**: `POST /api/v1/admin/notifications/send`
- **Required Role**: `super_admin`, `support_admin`, `compliance_admin`
- **Request Body**:
```json
{
  "targetGroup": ["agent", "landLord"],
  "title": "Platform Policy Update",
  "message": "Please review the updated rental verification guidelines for 2026.",
  "buildingId": null
}
```
- *Note*: `targetGroup` accepts string or array: `"agent"`, `"landLord"`, `"tenant"`, `"prospective_tenant"`, `"all"`, or arrays like `["agent", "landLord"]`.
- **Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Targeted push notifications dispatched successfully.",
  "data": {
    "targetedGroups": ["agent", "landLord"],
    "title": "Platform Policy Update",
    "message": "Please review the updated rental verification guidelines for 2026.",
    "summary": {
      "totalRecipients": 45,
      "landlordsAndAgentsCount": 45,
      "tenantsCount": 0,
      "notificationsDispatched": 45
    }
  }
}
```

---

### Section G: Agent Blacklisting & Reason Tracking

#### 1. Blacklist Agent with Reason
- **Method / Path**: `POST /api/v1/admin/agents/:id/blacklist`
- **Required Role**: `super_admin`, `compliance_admin`
- **Request Body**:
```json
{
  "reason": "Fraudulent property listing and submission of invalid verification documents."
}
```
- **Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Agent has been blacklisted successfully.",
  "data": {
    "id": 5,
    "firstName": "Bad",
    "lastName": "Agent",
    "companyName": "Fake Properties Ltd",
    "emailAddress": "bad.agent@example.com",
    "isBlacklisted": true,
    "blacklistReason": "Fraudulent property listing and submission of invalid verification documents.",
    "blacklistedAt": "2026-07-21T23:30:00.000Z",
    "blacklistedBy": 1,
    "disableAccount": true
  }
}
```

#### 2. Unblacklist Agent
- **Method / Path**: `POST /api/v1/admin/agents/:id/unblacklist`
- **Required Role**: `super_admin`, `compliance_admin`

#### 3. List All Blacklisted Agents
- **Method / Path**: `GET /api/v1/admin/agents/blacklisted`
- **Required Role**: `super_admin`, `compliance_admin`, `support_admin`
- **Query Parameters**: `page`, `limit`
