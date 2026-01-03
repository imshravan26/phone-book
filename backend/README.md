# Contact SaaS Backend API

A comprehensive Contact Management System backend built with Node.js, Express, MongoDB, and JWT authentication.

## Features

- **User Authentication**: JWT-based authentication with access and refresh tokens
- **Contact Management**: Full CRUD operations for contacts
- **Security**: Password hashing, input validation, and protected routes
- **Search & Filtering**: Search contacts by name, email, phone, company
- **Pagination**: Paginated responses for better performance
- **Favorites**: Mark contacts as favorites
- **Data Validation**: Comprehensive input validation and error handling

## API Endpoints

### Authentication Endpoints

#### Register User

```
POST /api/v1/users/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Login User

```
POST /api/v1/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "Password123"
}
```

#### Logout User

```
POST /api/v1/users/logout
Authorization: Bearer <access_token>
```

#### Get Current User

```
GET /api/v1/users/profile
Authorization: Bearer <access_token>
```

#### Refresh Access Token

```
POST /api/v1/users/refresh-token
Content-Type: application/json

{
  "refreshToken": "<refresh_token>"
}
```

### Contact Endpoints

#### Get All Contacts

```
GET /api/v1/contacts?page=1&limit=10&search=john&sortBy=createdAt&sortOrder=desc&favorite=true
Authorization: Bearer <access_token>
```

Query Parameters:

- `page`: Page number (default: 1)
- `limit`: Number of contacts per page (default: 10)
- `search`: Search term for firstName, lastName, email, phone, company, jobTitle
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: Sort order 'asc' or 'desc' (default: desc)
- `favorite`: Filter favorites 'true' or 'false'

#### Create Contact

```
POST /api/v1/contacts
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Tech Corp",
  "jobTitle": "Software Engineer",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "notes": "Important client contact",
  "tags": ["client", "important"],
  "isFavorite": false
}
```

#### Get Contact by ID

```
GET /api/v1/contacts/:id
Authorization: Bearer <access_token>
```

#### Update Contact

```
PUT /api/v1/contacts/:id
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "jobTitle": "Senior Engineer"
}
```

#### Delete Contact

```
DELETE /api/v1/contacts/:id
Authorization: Bearer <access_token>
```

#### Toggle Favorite

```
PATCH /api/v1/contacts/:id/favorite
Authorization: Bearer <access_token>
```

## Data Models

### User Model

```javascript
{
  _id: ObjectId,
  fullName: String (required, max: 100),
  email: String (required, unique, lowercase),
  password: String (required, hashed),
  refreshToken: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Contact Model

```javascript
{
  _id: ObjectId,
  firstName: String (required, max: 50),
  lastName: String (required, max: 50),
  email: String (required, unique per user),
  phone: String (required),
  company: String (optional, max: 100),
  jobTitle: String (optional, max: 100),
  address: {
    street: String (optional, max: 200),
    city: String (optional, max: 100),
    state: String (optional, max: 100),
    zipCode: String (optional, max: 20),
    country: String (optional, max: 100)
  },
  notes: String (optional, max: 500),
  tags: [String] (optional, each max: 50),
  isFavorite: Boolean (default: false),
  owner: ObjectId (ref: User, required),
  createdAt: Date,
  updatedAt: Date,
  fullName: String (virtual field)
}
```

## Environment Variables

Create a `.env` file in the backend root directory:

```env
# Server Configuration
PORT=8000
NODE_ENV=development

# Database Configuration
MONGODB_URL=mongodb://localhost:27017
# Or for MongoDB Atlas:
# MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net

# JWT Configuration
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
ACCESS_TOKEN_EXPIRY=1h
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
REFRESH_TOKEN_EXPIRY=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Security
BCRYPT_SALT_ROUNDS=10
```

## Installation & Setup

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables in `.env` file

3. Start MongoDB (if running locally)

4. Run the development server:

```bash
npm run dev
```

The server will start on `http://localhost:8000`

## API Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    "user": {...},
    "contacts": [...],
    "pagination": {...}
  },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message",
  "errors": [...] // Validation errors if any
}
```

## Security Features

- **Password Hashing**: Passwords are hashed using bcrypt
- **JWT Authentication**: Access and refresh token-based authentication
- **Input Validation**: Comprehensive validation using express-validator
- **CORS Protection**: Configurable CORS origins
- **Rate Limiting**: Consider adding rate limiting in production
- **Data Sanitization**: Email normalization and input sanitization

## Health Check

```
GET /health
```

Returns server status and timestamp.

## Error Handling

The API includes comprehensive error handling for:

- Validation errors
- Authentication errors
- Database errors
- Not found errors
- Server errors

All errors follow a consistent response format with appropriate HTTP status codes.
