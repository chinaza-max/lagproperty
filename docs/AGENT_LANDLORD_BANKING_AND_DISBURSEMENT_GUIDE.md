# Agent & Landlord Banking, Multi-Landlord Management, and Rent Disbursement Guide

This document details the architecture, database schema, API contracts, and fund disbursement workflow for **Agents**, **Landlords**, and **Building Bank Accounts** in the LagProperty platform.

---

## 1. Business Logic Overview

### The Problem
Previously, bank accounts were stored only on the `PropertyManager` profile. An agent working with multiple independent property owners (landlords) could not route rent disbursements to the specific owner of each building.

### The Solution
1. **Agents (`type: 'agent'`)**:
   - Work on behalf of multiple landlords.
   - **Profile Level**: Stores the **Agent's own bank account** (`agentBankCode`, `agentBankAccount`, `agentBankName`, `agentAccountName`) to receive their **10% commission**.
   - **Building Upload (`/user/listBuilding`)**: When uploading a building, the agent **must supply the Landlord's bank details** (`landlordBankCode`, `landlordBankAccount`, optional `landlordBankName`, `landlordAccountName`). Each building holds its own landlord bank destination.
   - Agents **cannot** set landlord bank accounts on their personal profile.

2. **Landlords (`type: 'landLord'`)**:
   - Own their own properties directly.
   - **Profile Level**: Stores their personal bank account (`landlordBankCode`, `landlordBankAccount`, `landlordBankName`, `landlordAccountName`).
   - **Building Upload (`/user/listBuilding`)**: Landlords do **not** need to re-enter bank details on every upload. The system automatically reads their profile bank details and copies them onto the building record.
   - Landlords **cannot** set agent bank accounts on their personal profile.

3. **Standalone Building Bank Account Management**:
   - `POST /user/updateBuildingBankDetails` allows updating or assigning landlord bank details to any existing building.
   - `GET /user/getBuildingBankDetails` retrieves the currently attached landlord bank details for a building.

---

## 2. Commission Split & Disbursement Matrix

Rent disbursement calculation is preserved with zero alteration to the revenue split:

| Listing Type | Landlord Share | Agent Share | App Platform Fee | Destination Accounts |
| :--- | :--- | :--- | :--- | :--- |
| **Agent Listing** | **85%** | **10%** | **5%** | • Landlord 85% → `Building.landlordBankAccount` / `landlordBankCode`<br>• Agent 10% → `PropertyManager.agentBankAccount` / `agentBankCode` |
| **Direct Landlord Listing** | **95%** | **0%** | **5%** | • Landlord 95% → `Building.landlordBankAccount` (fallback to `PropertyManager.landlordBankAccount`) |

### Disbursement Resolution Fallback:
To ensure backwards compatibility with older buildings created before this update:
```javascript
const landlordBankCode = building?.landlordBankCode || propertyManager.landlordBankCode;
const landlordBankAccount = building?.landlordBankAccount || propertyManager.landlordBankAccount;
```

---

## 3. Database Schema Changes

### `buildings` Table
The following columns were added:
- `landlordBankCode` (`VARCHAR(255)`, `allowNull: true`)
- `landlordBankAccount` (`VARCHAR(255)`, `allowNull: true`)
- `landlordBankName` (`VARCHAR(255)`, `allowNull: true`)
- `landlordAccountName` (`VARCHAR(255)`, `allowNull: true`)

### `property_managers` Table
The following columns were added:
- `agentBankName` (`VARCHAR(255)`, `allowNull: true`)
- `agentAccountName` (`VARCHAR(255)`, `allowNull: true`)
- `landlordBankName` (`VARCHAR(255)`, `allowNull: true`)
- `landlordAccountName` (`VARCHAR(255)`, `allowNull: true`)

*Note: Database columns are automatically and safely added on server startup via `safeAddColumn` in `src/db/models/index.js`.*

---

## 4. API Endpoints Reference

### 1. Update Profile: `POST /user/updateProfile`
Updates the user's personal profile information and bank account.

**Headers**:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data or application/json
```

#### For Agents (`type: "agent"`):
Requires the agent's commission bank account. **Landlord bank fields are strictly rejected**.
```json
{
  "firstName": "John",
  "lastName": "Agent",
  "type": "agent",
  "agentBankCode": "058",
  "agentBankAccount": "0123456789",
  "agentBankName": "Guaranty Trust Bank",
  "agentAccountName": "John Agent Ent.",
  "agentRegistrationNO": "AG-12345"
}
```

#### For Landlords (`type: "landLord"`):
Requires the landlord's receiving bank account. **Agent bank fields are strictly rejected**.
```json
{
  "firstName": "Chief",
  "lastName": "Adeleke",
  "type": "landLord",
  "landlordBankCode": "058",
  "landlordBankAccount": "9876543210",
  "landlordBankName": "Guaranty Trust Bank",
  "landlordAccountName": "Chief Adeleke"
}
```

---

### 2. List / Upload Building: `POST /user/listBuilding`
Uploads a new building/property to the platform.

**Headers**:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: multipart/form-data
```

#### Agent Upload Requirements:
When an agent uploads a property, they **must** include the Landlord's bank details:
- `landlordBankCode` (Required for agents)
- `landlordBankAccount` (Required for agents)
- `landlordBankName` (Optional)
- `landlordAccountName` (Optional)

If omitted by an agent, the API returns `400 Bad Request`:
```json
{
  "status": 400,
  "message": "As an agent, you must provide the landlord's bankCode and bankAccount for each building you list."
}
```

#### Landlord Direct Upload:
Landlords do **not** need to supply bank details. The system automatically fetches `landlordBankCode`, `landlordBankAccount`, `landlordBankName`, and `landlordAccountName` from their profile and attaches them to the new building record.

---

### 3. Update Building Landlord Bank Details: `POST /user/updateBuildingBankDetails`
Attaches or updates the landlord bank details on an existing building. Only the property manager who created the building can update it.

**Headers**:
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "buildingId": "0a5b8221-17ef-4e47-aefb-b8df9b15518b",
  "landlordBankCode": "058",
  "landlordBankAccount": "0123456789",
  "landlordBankName": "Guaranty Trust Bank",
  "landlordAccountName": "Jane Adeleke"
}
```

**Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Building bank details updated successfully",
  "data": {
    "buildingId": "0a5b8221-17ef-4e47-aefb-b8df9b15518b",
    "landlordBankCode": "058",
    "landlordBankAccount": "0123456789",
    "landlordBankName": "Guaranty Trust Bank",
    "landlordAccountName": "Jane Adeleke"
  }
}
```

---

### 4. Get Building Landlord Bank Details: `GET /user/getBuildingBankDetails`
Retrieves the landlord bank details associated with a specific building. Only accessible by the building owner/creator.

**Headers**:
```http
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters**:
- `buildingId`: ID of the building

**Request Example**:
```http
GET /user/getBuildingBankDetails?buildingId=0a5b8221-17ef-4e47-aefb-b8df9b15518b
```

**Response `200 OK`**:
```json
{
  "status": 200,
  "message": "Building bank details retrieved successfully",
  "data": {
    "id": "0a5b8221-17ef-4e47-aefb-b8df9b15518b",
    "landlordBankCode": "058",
    "landlordBankAccount": "0123456789",
    "landlordBankName": "Guaranty Trust Bank",
    "landlordAccountName": "Jane Adeleke"
  }
}
```
