# SecureUser Auth API

A production-ready RESTful API for user management built with Node.js, Express, and MySQL.  
Implements secure authentication using JWT access and refresh tokens, role-based access control (RBAC), rate limiting, account lockout protection, and full integration testing.

---

## 🚀 Overview

SecureUser Auth API is designed to demonstrate backend engineering best practices including layered architecture, secure authentication flows, token rotation, protected routes, and automated testing.

This project simulates a real-world authentication and user management system suitable for scalable applications.

---

## ✨ Features

- JWT Access & Refresh Token Authentication
- Refresh Token Rotation
- Secure Logout (Token Invalidation)
- Role-Based Access Control (RBAC)
- Strong Password Policy Enforcement
- Account Lockout After Failed Login Attempts
- Rate Limiting (Brute Force Protection)
- Swagger (OpenAPI) Documentation
- Integration Testing (Jest + Supertest)
- Clean Layered Architecture
- MySQL Relational Data Modeling

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js  
- **Database:** MySQL (mysql2)  
- **Authentication:** JSON Web Tokens (JWT)  
- **Security:** bcrypt, helmet, express-rate-limit  
- **Validation:** express-validator  
- **Testing:** Jest, Supertest  
- **API Docs:** Swagger (swagger-jsdoc, swagger-ui-express)

---

## 🏗 Architecture

The project follows a clean layered structure:


src/
│
├── controllers/ # Request handling logic
├── services/ # Business logic & database interaction
├── routes/ # API route definitions
├── middleware/ # Auth, role checks, error handling
├── models/ # Data models
├── config/ # Database & environment configs
├── app.js # Express app configuration
server.js # Server entry point


This separation ensures maintainability, scalability, and testability.

---

## 🔐 Authentication Flow

1. User registers → password hashed using bcrypt.
2. User logs in → receives:
   - Short-lived Access Token
   - Long-lived Refresh Token
3. Access Token required for protected routes.
4. Refresh Token used to generate new Access Tokens.
5. Logout invalidates stored Refresh Token.

---

## 📦 Installation & Setup

### 1️⃣ Clone the Repository


git clone https://github.com/your-username/secureuser-auth-api.git

cd secureuser-auth-api


### 2️⃣ Install Dependencies


npm install


### 3️⃣ Configure Environment Variables

Create a `.env` file:


PORT=8084
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=yourdatabase

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret


### 4️⃣ Run the Server


npm start


Server runs at:


http://localhost:8084


---

## 📖 API Documentation

Swagger documentation available at:


http://localhost:8084/api-docs


---

## 🧪 Running Tests

Integration tests are implemented using Jest and Supertest.

To run tests:


npm test


Tests cover:

- User registration
- Login authentication
- Protected route access
- Token-based authorization

---

## 🔒 Security Implementations

- Password hashing with bcrypt
- JWT token rotation
- Secure logout
- Rate limiting against brute-force attacks
- Account lockout after multiple failed login attempts
- Helmet for HTTP security headers
- Input validation with express-validator

---

## 📊 Database Design

Relational schema includes:

- Users
- Address
- Geo
- Company

Structured with proper foreign key relationships.

---

## 🚀 Future Enhancements

- Docker containerization
- CI/CD pipeline (GitHub Actions)
- Production deployment (AWS / Render / Railway)
- Centralized logging (Winston)
- Unit test coverage reporting
- Environment-based configuration

---