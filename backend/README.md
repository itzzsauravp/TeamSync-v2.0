# API Documentation

## Base URL

```
http://localhost:3000/api/v1/
```

## Authentication Middleware

> The middleware (`middleware/authenticate.js`) protects routes by validating the authorization token.

⚠️ **Token Format in Authorization Header:**

```json
{
  "token": "Bearer ${AuthTokenGoesHere}"
}
```

🚨 **Important Note:** After middleware validation, all requests will have `req.user` property containing the user's information from the database.

## API Endpoints

### Auth Routes

#### 1. Register

- **Endpoint**: `/auth/register`
- **Method**: `POST`
- **Description**: Register a new user
- **Request Body**:
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "username": "string",
    "email": "string",
    "address": "string",
    "phone_number": "string",
    "password": "string"
  }
  ```

#### 2. Login

- **Endpoint**: `/auth/login`
- **Method**: `POST`
- **Description**: Authenticate user and receive auth token
- **Request Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

#### 3. Validate Token

- **Endpoint**: `/auth/validate-token`
- **Method**: `GET`
- **Description**: Verify JWT token validity
- **Authentication**: Required (token is sent from the Authorization header) <-> was updated

  ```
  > **Note:** Token validation could be handled by the authentication middleware instead. Check `/src/api/axiosInstance.js` in frontend for request interceptor implementation.
  ```

### User Routes

#### 1. Get Profile

- **Endpoint**: `/user/profile`
- **Method**: `GET`
- **Description**: Retrieve user profile information
- **Authentication**: Required

#### 2. Update Profile

- **Endpoint**: `/user/profile`
- **Method**: `PUT`
- **Description**: Update user profile information
- **Authentication**: Required
- **Request Body**:
  ```json
  {
    "first_name": "string",
    "last_name": "string",
    "username": "string",
    "phone_number": "string",
    "address": "string"
  }
  ```

#### 2. Delete Profile

- **Endpoint**: `/user/delete`
- **Method**: `DELETE`
- **Description**: DELETE user profile information
- **Authentication**: Required (token is sent from the Authorization header)

### Message Routes

#### 1. Send Message

- **Endpoint**: `/send/:groupID`
- **Method**: `POST`
- **Description**: Send message to a specific group
- **Authentication**: Required (token is sent from the Authorization header)
- **Request Body**:
  ```json
  {
    "messageContent": "string/TEXT"
  }
  ```

#### 2. Get All Messages (for specific group)

- **Endpoint**: `/all/:groupID`
- **Method**: `GET`
- **Description**: Get all messages for a specific group
- **Authentication**: Required (token is sent from the Authorization header)

#### 3. Update Message

- **Endpoint**: `/update/:msgID`
- **Method**: `PUT`
- **Description**: Update a message in a specific group sent by current user
- **Authentication**: Required (token is sent from the Authorization header)
- **Request Body**:
  ```json
  {
    "newMessageContent": "string/TEXT"
  }
  ```

#### 4. Delete Message

- **Endpoint**: `/delete/:msgID`
- **Method**: `DELETE`
- **Description**: Delete a message in a specific group sent by the current user
- **Authentication**: Required (token is sent from the Authorization header)

## Notes on Authentication

1. Protected routes require a valid JWT token in the Authorization header
2. The token should be included in the format: `Bearer ${token}`
3. Request interceptor in frontend handles token attachment to requests
4. After authentication middleware, `req.user` contains full user information
