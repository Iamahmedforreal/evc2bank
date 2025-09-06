# EVC2Bank Setup Guide

This guide will help you set up the EVC2Bank application on your local machine or server.

## 🚀 Quick Start

### 1. Prerequisites Check

Before starting, ensure you have the following installed:

```bash
# Check Node.js version (should be 14+)
node --version

# Check npm version
npm --version

# Check if MongoDB is installed
mongod --version
```

If any of these are missing, follow the installation links below:
- [Node.js](https://nodejs.org/en/download/)
- [MongoDB](https://docs.mongodb.com/manual/installation/)

### 2. Download and Install

```bash
# Clone or download the project
git clone <repository-url>
cd evc2bank

# Install dependencies
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root:

```bash
# Copy example environment file
cp .env.example .env
```

Edit the `.env` file with your settings:
```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
MONGO_URL=mongodb://localhost:27017/evc2bank

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
```

**Important**: Change `JWT_SECRET` to a strong, unique secret key!

### 4. Start MongoDB

#### Option A: Local MongoDB Service
```bash
# On Ubuntu/Debian
sudo systemctl start mongod

# On macOS (with Homebrew)
brew services start mongodb-community

# On Windows
net start MongoDB
```

#### Option B: Docker (if you have Docker installed)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start the Application

```bash
# Development mode (with auto-restart)
npm run dev

# Or production mode
npm start
```

You should see:
```
Server is running on port 3000 in development mode
MongoDB connected successfully
```

### 6. Test the Installation

Open a new terminal and run the test script:
```bash
node test-api.js
```

This will:
- Register a test user
- Login and get a token
- Check wallet balance
- Attempt transfers
- Show transaction history

## 🔧 Detailed Setup Instructions

### MongoDB Setup

#### Local Installation
1. **Download MongoDB** from [official website](https://www.mongodb.com/try/download/community)
2. **Install** following the platform-specific instructions
3. **Start the service**:
   - Windows: MongoDB should start automatically
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

#### Database Configuration
The application will automatically:
- Connect to MongoDB
- Create the `evc2bank` database
- Set up required collections and indexes

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `development`, `production` |
| `PORT` | Server port number | `3000` |
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017/evc2bank` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration time | `7d`, `24h`, `3600` |

### JWT Secret Key

Generate a strong JWT secret:

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 64

# Option 3: Manual (minimum 32 characters)
# Use a combination of letters, numbers, and symbols
```

## 🧪 Testing Your Setup

### 1. Manual API Testing

Test each endpoint manually:

#### Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "1234567890",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "1234567890",
    "password": "password123"
  }'
```

Save the token from the response for the next requests.

#### Check Balance
```bash
curl -X GET http://localhost:3000/api/transactions/balance/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 2. Using the Test Script

The included `test-api.js` script will automatically test:
- User registration
- User login
- Balance checking
- Transfer attempts
- Transaction history

```bash
node test-api.js
```

### 3. Database Verification

Check if data is being stored correctly:

```bash
# Connect to MongoDB
mongo evc2bank

# Show collections
show collections

# Check users
db.users.find().pretty()

# Check wallets
db.wallets.find().pretty()

# Check transactions
db.transactions.find().pretty()
```

## 🚨 Troubleshooting

### Common Issues and Solutions

#### 1. "ECONNREFUSED" MongoDB Error
**Problem**: Cannot connect to MongoDB
**Solutions**:
- Ensure MongoDB is running: `sudo systemctl status mongod`
- Check the connection string in `.env`
- Try connecting manually: `mongo`

#### 2. "Port 3000 already in use"
**Problem**: Another application is using port 3000
**Solutions**:
- Change the port in `.env`: `PORT=3001`
- Kill the process using port 3000: `npx kill-port 3000`
- Find and stop the conflicting application

#### 3. "JWT Secret not defined"
**Problem**: Missing or invalid JWT secret
**Solutions**:
- Check if `.env` file exists
- Ensure `JWT_SECRET` is set in `.env`
- Restart the application after changing `.env`

#### 4. "Cannot find module" errors
**Problem**: Dependencies not installed
**Solution**:
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install
```

#### 5. Permission errors on Linux/macOS
**Problem**: Permission denied errors
**Solutions**:
- Don't use `sudo` with npm
- Fix npm permissions: `npm config set prefix ~/.npm-global`
- Use Node Version Manager (nvm)

### Logs and Debugging

Check application logs for detailed error information:
```bash
# View error logs
cat logs/error-$(date +%Y-%m-%d).log

# View combined logs
cat logs/combined-$(date +%Y-%m-%d).log

# Follow logs in real-time
tail -f logs/combined-$(date +%Y-%m-%d).log
```

## 🔄 Different Installation Methods

### Method 1: Direct Download
1. Download the project as ZIP
2. Extract to desired folder
3. Follow steps 3-6 from Quick Start

### Method 2: Git Clone
```bash
git clone <repository-url>
cd evc2bank
# Follow steps 2-6 from Quick Start
```

### Method 3: Fork and Clone (for development)
1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/evc2bank.git
   cd evc2bank
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream <original-repository-url>
   ```
4. Follow steps 2-6 from Quick Start

## 🌐 Production Setup

For production deployment:

### 1. Environment Configuration
```env
NODE_ENV=production
PORT=3000
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/evc2bank
JWT_SECRET=extremely-long-and-secure-secret-key
JWT_EXPIRES_IN=1h
```

### 2. Security Considerations
- Use HTTPS
- Set up firewall rules
- Use environment-specific database
- Enable MongoDB authentication
- Regular security updates

### 3. Process Management
```bash
# Using PM2 (recommended)
npm install -g pm2
pm2 start server.js --name evc2bank
pm2 startup
pm2 save

# Using forever
npm install -g forever
forever start server.js
```

## ✅ Setup Verification Checklist

- [ ] Node.js 14+ installed
- [ ] MongoDB running and accessible
- [ ] Project dependencies installed (`npm install`)
- [ ] `.env` file created with all required variables
- [ ] JWT_SECRET is strong and unique
- [ ] Application starts without errors
- [ ] Test script runs successfully
- [ ] Can register and login users
- [ ] Database collections are created
- [ ] Logs are being generated

## 📞 Getting Help

If you encounter issues not covered in this guide:

1. **Check the logs** in the `logs/` directory
2. **Review the error messages** carefully
3. **Verify your environment configuration**
4. **Test with the provided test script**
5. **Check the DEVELOPMENT.md** for detailed troubleshooting

## 🎉 You're Ready!

Once setup is complete, you can:
- Start developing new features
- Test the API endpoints
- Integrate with frontend applications
- Deploy to production

Refer to the main `README.md` for API documentation and `DEVELOPMENT.md` for development guidelines.

