# EVC2Bank API Documentation

## Overview

The EVC2Bank API is a secure digital wallet system that enables transfers between EVC (Electronic Value Card) and bank accounts. The API provides JWT-based authentication and comprehensive transaction management.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response Structure
```json
{
  "message": "Operation successful",
  "user": { /* user data */ },
  "data": { /* response data */ }
}
```

### Error Response Structure
```json
{
  "message": "Error description",
  "error": "Detailed error message"
}
```

## HTTP Status Codes

- `200` - OK (Success)
- `201` - Created (Resource created successfully)
- `400` - Bad Request (Invalid input)
- `401` - Unauthorized (Authentication required)
- `403` - Forbidden (Access denied)
- `404` - Not Found (Resource not found)
- `500` - Internal Server Error

---

## 🔐 Authentication Endpoints

### 1. Register User

**Endpoint:** `POST /api/auth/register`

**Description:** Create a new user account in the system

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "password": "securePassword123",
  "role": "user"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `firstName` | string | Yes | User's first name (2-50 characters) |
| `lastName` | string | Yes | User's last name (2-50 characters) |
| `phone` | string | Yes | Unique phone number (8-15 digits) |
| `password` | string | Yes | Password (minimum 8 characters) |
| `role` | string | No | User role: `user`, `admin`, `merchant` (default: `user`) |

**Success Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "role": "user",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - All fields are required / User already exists
- `500` - Server error

---

### 2. Login User

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive access token

**Request Body:**
```json
{
  "phone": "1234567890",
  "password": "securePassword123"
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `phone` | string | Yes | User's registered phone number |
| `password` | string | Yes | User's password |

**Success Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "role": "user",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- `400` - Invalid phone number or password
- `500` - Server error

---

## 💰 Transaction Endpoints

### 3. EVC to Bank Transfer

**Endpoint:** `POST /api/transactions/evc-to-bank`

**Description:** Transfer funds from EVC wallet to bank account

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 100.50
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Transfer amount (must be positive) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "amount": 100.50,
    "type": "evc_to_bank",
    "status": "completed",
    "description": "Transfer from EVC to Bank: $100.5",
    "reference": "EVC2BANK-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "balanceBefore": 500.00,
    "balanceAfter": 399.50,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "newEvcBalance": 399.50,
  "newBankBalance": 1100.50
}
```

**Error Responses:**
- `400` - Invalid amount / Insufficient EVC balance
- `401` - Authentication required
- `404` - Wallet not found
- `500` - Server error

---

### 4. Bank to EVC Transfer

**Endpoint:** `POST /api/transactions/bank-to-evc`

**Description:** Transfer funds from bank account to EVC wallet

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 75.25
}
```

**Request Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Transfer amount (must be positive) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Transfer completed successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439013",
    "userId": "507f1f77bcf86cd799439011",
    "amount": 75.25,
    "type": "bank_to_evc",
    "status": "completed",
    "description": "Transfer from Bank to EVC: $75.25",
    "reference": "BANK2EVC-b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "balanceBefore": 399.50,
    "balanceAfter": 474.75,
    "createdAt": "2024-01-15T11:15:00.000Z",
    "updatedAt": "2024-01-15T11:15:00.000Z"
  },
  "newEvcBalance": 474.75,
  "newBankBalance": 1025.25
}
```

**Error Responses:**
- `400` - Invalid amount / Insufficient bank balance
- `401` - Authentication required
- `404` - Wallet not found
- `500` - Server error

---

### 5. Check Wallet Balance

**Endpoint:** `GET /api/transactions/balance/me`

**Description:** Get current wallet balances for authenticated user

**Authentication:** Required

**Success Response (200):**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "evcBalance": 474.75,
  "bankBalance": 1025.25,
  "currency": "USD",
  "lastUpdated": "2024-01-15T11:15:00.000Z"
}
```

**Error Responses:**
- `401` - Authentication required
- `403` - Access denied
- `404` - Wallet not found
- `500` - Server error

---

### 6. Check User Balance (Admin Only)

**Endpoint:** `GET /api/transactions/balance/{userId}`

**Description:** Get wallet balance for specific user (admin access only)

**Authentication:** Required (Admin role)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | Target user's MongoDB ObjectId |

**Success Response (200):**
```json
{
  "userId": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890"
  },
  "evcBalance": 474.75,
  "bankBalance": 1025.25,
  "currency": "USD",
  "lastUpdated": "2024-01-15T11:15:00.000Z"
}
```

**Error Responses:**
- `401` - Authentication required
- `403` - Admin access required
- `404` - Wallet not found
- `500` - Server error

---

### 7. Get Transaction History

**Endpoint:** `GET /api/transactions/history/me`

**Description:** Retrieve transaction history for authenticated user

**Authentication:** Required

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "1234567890"
    },
    "amount": 75.25,
    "type": "bank_to_evc",
    "status": "completed",
    "description": "Transfer from Bank to EVC: $75.25",
    "reference": "BANK2EVC-b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "balanceBefore": 399.50,
    "balanceAfter": 474.75,
    "createdAt": "2024-01-15T11:15:00.000Z",
    "updatedAt": "2024-01-15T11:15:00.000Z"
  },
  {
    "_id": "507f1f77bcf86cd799439012",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "1234567890"
    },
    "amount": 100.50,
    "type": "evc_to_bank",
    "status": "completed",
    "description": "Transfer from EVC to Bank: $100.5",
    "reference": "EVC2BANK-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "balanceBefore": 500.00,
    "balanceAfter": 399.50,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Authentication required
- `403` - Access denied
- `500` - Server error

---

### 8. Get User Transaction History (Admin Only)

**Endpoint:** `GET /api/transactions/history/{userId}`

**Description:** Get transaction history for specific user (admin access only)

**Authentication:** Required (Admin role)

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | Yes | Target user's MongoDB ObjectId |

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "1234567890"
    },
    "amount": 75.25,
    "type": "bank_to_evc",
    "status": "completed",
    "description": "Transfer from Bank to EVC: $75.25",
    "reference": "BANK2EVC-b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "balanceBefore": 399.50,
    "balanceAfter": 474.75,
    "createdAt": "2024-01-15T11:15:00.000Z",
    "updatedAt": "2024-01-15T11:15:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Authentication required
- `403` - Admin access required
- `500` - Server error

---

### 9. Get All Transactions (Admin Only)

**Endpoint:** `GET /api/transactions/history`

**Description:** Retrieve all transactions in the system (admin access only)

**Authentication:** Required (Admin role)

**Success Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439013",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "firstName": "John",
      "lastName": "Doe",
      "phone": "1234567890"
    },
    "amount": 75.25,
    "type": "bank_to_evc",
    "status": "completed",
    "description": "Transfer from Bank to EVC: $75.25",
    "reference": "BANK2EVC-b2c3d4e5-f6g7-8901-bcde-f23456789012",
    "balanceBefore": 399.50,
    "balanceAfter": 474.75,
    "createdAt": "2024-01-15T11:15:00.000Z",
    "updatedAt": "2024-01-15T11:15:00.000Z"
  }
]
```

**Error Responses:**
- `401` - Authentication required
- `403` - Admin access required
- `500` - Server error

---

## 📊 Data Models

### User Model
```json
{
  "_id": "ObjectId",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "passwordHash": "string",
  "role": "user|admin|merchant",
  "status": "active|suspended|pending",
  "passwordChangedAt": "Date",
  "loginAttempts": "number",
  "lockUntil": "Date",
  "lastLogin": "Date",
  "emailVerified": "boolean",
  "twoFactorEnabled": "boolean",
  "deviceTokens": "array",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Wallet Model
```json
{
  "_id": "ObjectId",
  "userid": "ObjectId",
  "evcBalance": "number",
  "bankbalance": "number",
  "currancy": "string",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### Transaction Model
```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "amount": "number",
  "type": "evc_to_bank|bank_to_evc|wallet_adjustment",
  "status": "pending|completed|failed",
  "description": "string",
  "reference": "string",
  "balanceBefore": "number",
  "balanceAfter": "number",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

## 🔒 Security Features

### JWT Authentication
- **Token Expiration:** 7 days (configurable)
- **Algorithm:** HS256
- **Claims:** User ID, role, issued at time

### Account Security
- **Password Hashing:** bcrypt with salt rounds
- **Account Lockout:** After 5 failed login attempts (2 hours)
- **Role-based Access:** User, Admin, Merchant roles
- **Phone Validation:** 8-15 digit phone numbers

### Transaction Security
- **Unique References:** UUID-based transaction references
- **Balance Tracking:** Before/after balance recording
- **Audit Trail:** Complete transaction history
- **Input Validation:** Amount and user validation

---

## 🧪 Testing Examples

### Using cURL

#### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "9876543210",
    "password": "mySecurePass123"
  }'
```

#### Login User
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "password": "mySecurePass123"
  }'
```

#### Check Wallet Balance
```bash
curl -X GET http://localhost:3000/api/transactions/balance/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Transfer EVC to Bank
```bash
curl -X POST http://localhost:3000/api/transactions/evc-to-bank \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "amount": 50.00
  }'
```

#### Get Transaction History
```bash
curl -X GET http://localhost:3000/api/transactions/history/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

### Using JavaScript (fetch)

```javascript
// Login and get token
const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone: '9876543210',
    password: 'mySecurePass123'
  })
});

const loginData = await loginResponse.json();
const token = loginData.user.token;

// Make authenticated request
const balanceResponse = await fetch('http://localhost:3000/api/transactions/balance/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const balanceData = await balanceResponse.json();
console.log('Current balance:', balanceData);
```

---

## ⚠️ Error Handling

### Common Error Scenarios

#### Authentication Errors
```json
{
  "message": "No token provided, authorization denied"
}
```

#### Validation Errors
```json
{
  "message": "All fields are required"
}
```

#### Business Logic Errors
```json
{
  "message": "Insufficient EVC balance"
}
```

#### Server Errors
```json
{
  "message": "Server error",
  "error": "Database connection failed"
}
```

---

## 📋 API Testing Checklist

- [ ] User registration with valid data
- [ ] User registration with duplicate phone number
- [ ] User login with correct credentials
- [ ] User login with incorrect credentials
- [ ] Access protected endpoints without token
- [ ] Access protected endpoints with valid token
- [ ] EVC to Bank transfer with sufficient balance
- [ ] EVC to Bank transfer with insufficient balance
- [ ] Bank to EVC transfer with sufficient balance
- [ ] Wallet balance check
- [ ] Transaction history retrieval
- [ ] Admin-only endpoints with user role (should fail)
- [ ] Admin-only endpoints with admin role (should succeed)

---

## 🔄 Version History

### Version 1.0.0 (Current)
- ✅ User registration and authentication
- ✅ JWT token-based security
- ✅ EVC to Bank transfers
- ✅ Bank to EVC transfers
- ✅ Wallet balance management
- ✅ Transaction history tracking
- ✅ Role-based access control
- ✅ Account security features

---

## 📞 Support

For API support and questions:
- Test your integration using the provided `test-api.js` script
- Check server logs for detailed error information
- Verify authentication tokens and request format
- Ensure MongoDB is running and accessible

---

**Note:** This API is designed for development and testing. For production deployment, ensure proper security measures, SSL/TLS encryption, and environment-specific configuration.
