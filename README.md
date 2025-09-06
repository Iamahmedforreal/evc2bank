# EVC2Bank - Digital Wallet Transfer System

A secure Node.js application for handling EVC (Electronic Value Card) to Bank transfers with JWT authentication and comprehensive transaction management.

## 🚀 Features

### Core Banking Features
- ✅ User authentication with JWT tokens
- ✅ Role-based access control (User, Admin, Merchant)
- ✅ EVC to Bank transfers
- ✅ Bank to EVC transfers
- ✅ Wallet balance management
- ✅ Transaction history tracking
- ✅ Secure password hashing

### Security Features
- ✅ JWT token authentication
- ✅ Password hashing with bcrypt
- ✅ Phone number validation
- ✅ Role-based route protection
- ✅ Account lockout after failed login attempts
- ✅ Input validation and error handling

## 🏗️ Project Structure

```
evc2bank/
├── config/
│   └── env.js                 # Environment configuration
├── controllers/
│   ├── authcontroller.js      # Authentication logic
│   ├── transactionController.js # Transaction operations
│   ├── userController.js      # User management
│   └── walletController.js    # Wallet operations
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   ├── authEnhanced.js       # Enhanced auth features
│   ├── authorize.js          # Role-based authorization
│   ├── errorHandling.js      # Global error handler
│   ├── logger.js             # Request logging
│   ├── security.js           # Security middleware
│   └── validation.js         # Input validation
├── models/
│   ├── transaction.js        # Transaction schema
│   ├── userModel.js          # User schema
│   └── wallet.js             # Wallet schema
├── routes/
│   ├── authRouter.js         # Authentication routes
│   ├── transactionRouter.js  # Transaction routes
│   ├── userRouter.js         # User management routes
│   └── walletRouter.js       # Wallet routes
├── utils/
│   ├── fixOldUsers.js        # User migration utility
│   ├── mongodb.js            # Database connection
│   └── token.js              # JWT token utilities
├── logs/                     # Application logs
├── server.js                 # Main application entry point
└── test-api.js              # API testing script
```

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Validation**: Custom middleware
- **Logging**: File-based logging

## 📋 Prerequisites

- Node.js 14.0.0 or higher
- MongoDB 4.0 or higher
- npm or yarn package manager

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd evc2bank
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
MONGO_URL=mongodb://localhost:27017/evc2bank

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=7d
```

### 4. Start MongoDB
Make sure MongoDB is running on your system.

### 5. Start the Application
```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "1234567890",
  "password": "securePassword123",
  "role": "user"  // Optional: user (default), admin, merchant
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "role": "user",
    "token": "jwt_token_here"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "phone": "1234567890",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "role": "user",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "token": "jwt_token_here"
  }
}
```

### Transaction Endpoints

All transaction endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

#### EVC to Bank Transfer
```http
POST /api/transactions/evc-to-bank
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 100.00
}
```

#### Bank to EVC Transfer
```http
POST /api/transactions/bank-to-evc
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 50.00
}
```

#### Check Wallet Balance
```http
GET /api/transactions/balance/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "userId": "user_id",
  "evcBalance": 500.00,
  "bankBalance": 1000.00,
  "currency": "USD",
  "lastUpdated": "2024-01-01T12:00:00.000Z"
}
```

#### Get Transaction History
```http
GET /api/transactions/history/me
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "transaction_id",
    "userId": "user_id",
    "amount": 100,
    "type": "evc_to_bank",
    "status": "completed",
    "description": "Transfer from EVC to Bank: $100",
    "reference": "EVC2BANK-uuid",
    "balanceBefore": 600,
    "balanceAfter": 500,
    "createdAt": "2024-01-01T12:00:00.000Z",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
]
```

## 🗄️ Database Models

### User Model
```javascript
{
  firstName: String (required, max 50 chars)
  lastName: String (required, max 50 chars)
  phone: String (required, unique, 8-15 digits)
  passwordHash: String (required, hidden from queries)
  role: String (enum: 'user', 'admin', 'merchant', default: 'user')
  status: String (enum: 'active', 'suspended', 'pending', default: 'active')
  passwordChangedAt: Date
  loginAttempts: Number (default: 0)
  lockUntil: Date
  lastLogin: Date
  emailVerified: Boolean (default: false)
  twoFactorEnabled: Boolean (default: false)
  deviceTokens: Array
  timestamps: true
}
```

### Wallet Model
```javascript
{
  userid: ObjectId (ref: 'User', required)
  evcBalance: Number (default: 0)
  bankbalance: Number (default: 0)
  currancy: String (default: 'USD')
  timestamps: true
}
```

### Transaction Model
```javascript
{
  userId: ObjectId (ref: 'User', required)
  amount: Number (required)
  type: String (enum: 'evc_to_bank', 'bank_to_evc', 'wallet_adjustment')
  status: String (enum: 'pending', 'completed', 'failed', default: 'pending')
  description: String (required)
  reference: String (unique, required)
  balanceBefore: Number (required)
  balanceAfter: Number (required)
  timestamps: true
}
```

## 🔒 Security Features

### Authentication
- JWT tokens with configurable expiration
- Secure password hashing with bcrypt (salt rounds: 10)
- Phone number-based authentication
- Role-based access control

### Account Security
- Account lockout after 5 failed login attempts (2 hours)
- Password change tracking
- Device token management for multi-device support
- Two-factor authentication support (framework ready)

### Data Protection
- Sensitive fields excluded from JSON responses
- Input validation and sanitization
- Error handling without sensitive data exposure
- Secure database connection practices

## 🧪 Testing

### Manual API Testing
Use the included `test-api.js` script:
```bash
node test-api.js
```

This script will:
1. Register a test user
2. Login and get authentication token
3. Check wallet balance
4. Attempt transfers (will fail with insufficient funds initially)
5. Display transaction history

### API Testing with Postman/Thunder Client

Import the following requests:

1. **Register**: POST `http://localhost:3000/api/auth/register`
2. **Login**: POST `http://localhost:3000/api/auth/login`
3. **Balance Check**: GET `http://localhost:3000/api/transactions/balance/me`
4. **EVC Transfer**: POST `http://localhost:3000/api/transactions/evc-to-bank`
5. **Transaction History**: GET `http://localhost:3000/api/transactions/history/me`

## 🔧 Configuration

### Environment Variables
```env
# Required
NODE_ENV=development|production
PORT=3000
MONGO_URL=mongodb://localhost:27017/evc2bank
JWT_SECRET=your_very_secure_secret_key

# Optional
JWT_EXPIRES_IN=7d  # Token expiration time
```

### Database Configuration
The application automatically creates necessary indexes and handles connection management.

## 📝 Logging

Application logs are stored in the `logs/` directory:
- `combined-YYYY-MM-DD.log` - All application logs
- `error-YYYY-MM-DD.log` - Error logs only

## 🚨 Error Handling

The application includes comprehensive error handling:
- Global error middleware
- Consistent error response format
- Detailed error logging
- Client-friendly error messages

## 🔄 Development

### Available Scripts
```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
```

### Adding New Features
1. **Models**: Add new schemas in `models/`
2. **Controllers**: Add business logic in `controllers/`
3. **Routes**: Define API endpoints in `routes/`
4. **Middleware**: Add common functionality in `middleware/`

## 📋 Production Checklist

Before deploying to production:

- [ ] Set strong JWT_SECRET
- [ ] Configure production MongoDB connection
- [ ] Set NODE_ENV=production
- [ ] Configure proper logging
- [ ] Set up HTTPS/SSL
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting
- [ ] Regular database backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the logs in `logs/` directory
- Review the API documentation above
- Test with the included `test-api.js` script

---

**Note**: This is a development/demonstration banking application. For production use, ensure proper security audits, compliance with banking regulations, and integration with real banking systems.
