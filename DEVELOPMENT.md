# Development Guide

This guide provides detailed information for developers working on the EVC2Bank project.

## 🛠️ Development Setup

### Prerequisites
- Node.js 14+ 
- MongoDB 4.0+
- Git
- Code editor (VS Code recommended)

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd evc2bank
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 mongo:latest
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📁 Project Architecture

### Directory Structure

```
evc2bank/
├── config/           # Configuration files
├── controllers/      # Business logic controllers
├── middleware/       # Express middleware functions
├── models/          # MongoDB/Mongoose models
├── routes/          # API route definitions
├── utils/           # Utility functions and helpers
├── logs/            # Application logs (auto-generated)
├── server.js        # Main application entry point
└── test-api.js      # API testing script
```

### Architecture Patterns

The project follows these architectural patterns:

1. **MVC Pattern**: Separation of concerns with Models, Views (API responses), and Controllers
2. **Middleware Pattern**: Reusable middleware for authentication, validation, logging
3. **Repository Pattern**: Data access abstraction through Mongoose models
4. **Service Layer**: Business logic in controllers with utility functions

## 🧩 Code Organization

### Controllers
Controllers handle HTTP requests and responses. They should:
- Validate input data
- Call appropriate business logic
- Return consistent response formats
- Handle errors gracefully

**Example controller structure:**
```javascript
const controllerName = {};

controllerName.methodName = async (req, res) => {
    try {
        // Input validation
        const { param1, param2 } = req.body;
        
        // Business logic
        const result = await someService(param1, param2);
        
        // Response
        res.status(200).json({
            success: true,
            message: 'Operation successful',
            data: result
        });
    } catch (error) {
        res.status(500).json({ 
            message: error.message 
        });
    }
};

export default controllerName;
```

### Models
Models define the data structure and business rules:
- Use Mongoose schemas
- Include validation rules
- Add indexes for performance
- Implement useful methods

**Example model structure:**
```javascript
import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
    field1: {
        type: String,
        required: [true, 'Field1 is required'],
        trim: true,
        maxlength: [50, 'Field1 too long']
    },
    field2: {
        type: Number,
        default: 0,
        min: [0, 'Field2 must be positive']
    }
}, { 
    timestamps: true 
});

// Add indexes
modelSchema.index({ field1: 1 });

// Add methods
modelSchema.methods.customMethod = function() {
    // Custom logic
};

export default mongoose.model('ModelName', modelSchema);
```

### Middleware
Middleware functions should be:
- Reusable across routes
- Well-documented
- Error-safe
- Performance-conscious

**Example middleware:**
```javascript
export const middlewareName = (req, res, next) => {
    try {
        // Middleware logic
        if (condition) {
            return res.status(400).json({ 
                message: 'Validation failed' 
            });
        }
        
        // Add data to request object
        req.customData = processedData;
        
        next();
    } catch (error) {
        next(error);
    }
};
```

### Routes
Routes should be:
- RESTful when possible
- Grouped by functionality
- Protected by appropriate middleware
- Well-documented

**Example route structure:**
```javascript
import express from 'express';
import controller from '../controllers/controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/public-endpoint', controller.publicMethod);

// Protected routes
router.use(authMiddleware); // Apply to all routes below
router.get('/protected-endpoint', controller.protectedMethod);
router.post('/protected-endpoint', controller.createMethod);

export default router;
```

## 🔒 Security Guidelines

### Authentication & Authorization
- Always validate JWT tokens in protected routes
- Use role-based access control where needed
- Implement proper session management
- Hash all passwords with bcrypt

### Input Validation
- Validate all user inputs
- Sanitize data before database operations
- Use parameterized queries (Mongoose handles this)
- Implement rate limiting

### Error Handling
- Never expose sensitive information in errors
- Log detailed errors for debugging
- Return user-friendly error messages
- Use consistent error response format

### Data Protection
- Hash sensitive data
- Use HTTPS in production
- Implement proper CORS policies
- Validate file uploads if implemented

## 🧪 Testing Guidelines

### Manual Testing
Use the provided `test-api.js` script:
```bash
node test-api.js
```

### Testing with Postman
1. Import the API collection
2. Set up environment variables
3. Test authentication flow
4. Test business logic endpoints
5. Test error scenarios

### Unit Testing Best Practices
- Test business logic in controllers
- Mock external dependencies
- Test error conditions
- Maintain good test coverage

## 📝 Coding Standards

### JavaScript/ES6+ Guidelines
- Use ES6+ features (arrow functions, destructuring, etc.)
- Use `const` and `let` instead of `var`
- Use template literals for string interpolation
- Implement proper error handling with try/catch

### Naming Conventions
- **Files**: camelCase (e.g., `userController.js`)
- **Variables/Functions**: camelCase (e.g., `getUserById`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `JWT_SECRET`)
- **Classes**: PascalCase (e.g., `UserService`)
- **Database Collections**: lowercase plural (e.g., `users`)

### Code Formatting
- Use 4 spaces for indentation
- Use semicolons
- Keep line length under 100 characters
- Use meaningful variable names
- Add comments for complex logic

### File Organization
- One main export per file
- Group imports by type (external, internal)
- Use consistent import/export syntax
- Keep files focused on single responsibility

## 🗄️ Database Guidelines

### Schema Design
- Use appropriate data types
- Add validation rules
- Create necessary indexes
- Consider query patterns

### Performance Optimization
- Use indexes for frequently queried fields
- Avoid N+1 query problems
- Use aggregation pipelines for complex queries
- Monitor query performance

### Migration Strategy
- Keep migrations in version control
- Test migrations on staging first
- Have rollback plans
- Document schema changes

## 🚀 Deployment Guidelines

### Environment Configuration
- Use environment variables for config
- Never commit secrets to version control
- Have separate configs for dev/staging/prod
- Validate required environment variables on startup

### Production Checklist
- [ ] Environment variables configured
- [ ] Database connection secured
- [ ] JWT secret is strong and unique
- [ ] Logging configured
- [ ] Error monitoring set up
- [ ] Performance monitoring enabled
- [ ] Backup strategy implemented

### Monitoring
- Monitor application performance
- Track error rates
- Monitor database performance
- Set up alerting for critical issues

## 🔄 Git Workflow

### Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch
- `feature/feature-name` - Feature development
- `hotfix/fix-name` - Critical fixes

### Commit Messages
Use conventional commit format:
```
type(scope): description

feat(auth): add password reset functionality
fix(transactions): handle insufficient balance error
docs(api): update authentication documentation
```

### Pull Request Process
1. Create feature branch from `develop`
2. Implement feature with tests
3. Update documentation if needed
4. Create pull request to `develop`
5. Code review and approval
6. Merge and delete feature branch

## 🐛 Debugging

### Common Issues

1. **MongoDB Connection Failed**
   - Check if MongoDB is running
   - Verify connection string
   - Check network connectivity

2. **JWT Token Issues**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Validate token format

3. **Authentication Failures**
   - Check password hashing
   - Verify user exists
   - Check account status

### Debugging Tools
- Use `console.log()` for quick debugging
- Check application logs in `logs/` directory
- Use MongoDB Compass for database inspection
- Use Postman for API testing

### Logging
- Error logs: `logs/error-YYYY-MM-DD.log`
- Combined logs: `logs/combined-YYYY-MM-DD.log`
- Console output in development mode

## 📋 TODO Templates

### Feature Implementation Checklist
- [ ] Create/update model schema
- [ ] Implement controller logic
- [ ] Add route definitions
- [ ] Add input validation
- [ ] Add error handling
- [ ] Update API documentation
- [ ] Add tests
- [ ] Test manually

### Bug Fix Checklist
- [ ] Reproduce the bug
- [ ] Identify root cause
- [ ] Implement fix
- [ ] Add tests to prevent regression
- [ ] Update documentation if needed
- [ ] Test fix thoroughly

## 🤝 Contributing

### Getting Started
1. Fork the repository
2. Create feature branch
3. Make changes following these guidelines
4. Test your changes
5. Submit pull request

### Code Review Guidelines
- Review for functionality
- Check security implications
- Verify performance impact
- Ensure documentation is updated
- Test the changes

## 📚 Resources

### Documentation
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT.io](https://jwt.io/)
- [MongoDB Manual](https://docs.mongodb.com/manual/)

### Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [VS Code](https://code.visualstudio.com/) - Code editor

## ❓ FAQ

**Q: How do I reset the database?**
A: Drop the database in MongoDB and restart the application. It will recreate the schema.

**Q: How do I add a new API endpoint?**
A: Create controller method, add route, update documentation, and test.

**Q: How do I change the JWT expiration time?**
A: Update `JWT_EXPIRES_IN` in your `.env` file.

**Q: How do I add a new user role?**
A: Update the enum in the User model and add authorization logic where needed.

---

For additional questions or support, please check the main README.md or create an issue in the repository.
