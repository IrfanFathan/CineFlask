# 📡 CineFlask API Documentation

Complete REST API reference for CineFlask v2.0 with production enhancements.

---

## 🔐 Authentication

All API requests (except registration and login) require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 📚 Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Upload Management](#upload-management)
3. [Admin - Quota Management](#admin---quota-management)
4. [Admin - System Monitoring](#admin---system-monitoring)
5. [Response Codes](#response-codes)
6. [Error Handling](#error-handling)

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!",
  "email": "john@example.com"  // Optional
}
```

**Validation Rules:**
- Username: 3-20 characters, alphanumeric + underscore/hyphen only
- Password: Minimum 8 characters, cannot be common weak password
- Email: Valid email format (optional)

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  }
}
```

**Error Responses:**
- `400` - Validation error (username taken, weak password, etc.)
- `429` - Too many registration attempts

---

### POST /api/auth/login

Login to existing account.

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

**Error Responses:**
- `401` - Invalid credentials
- `403` - Account deactivated
- `429` - Too many failed login attempts (5 attempts = 30 min lockout)

---

### GET /api/auth/verify

Verify if current token is still valid.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "john_doe"
  }
}
```

---

## Upload Management

### GET /api/upload/quota

Get current user's upload quota and usage statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "quota": {
    "userId": 1,
    "quota": {
      "totalGB": 100,
      "usedGB": 23.45,
      "remainingGB": 76.55,
      "percentageUsed": "23.5"
    },
    "daily": {
      "limit": 10,
      "uploadedToday": 3,
      "remainingToday": 7
    },
    "totals": {
      "allTimeUploads": 45,
      "allTimeBytes": 25173819392
    }
  }
}
```

---

### POST /api/upload/init

Initialize a chunked file upload.

**Request Body:**
```json
{
  "filename": "Movie.Name.2024.1080p.mp4",
  "fileSize": 5368709120,
  "totalChunks": 1024
}
```

**Success Response (200):**
```json
{
  "success": true,
  "uploadId": "a1b2c3d4e5f6...",
  "message": "Upload initialized",
  "quota": {
    // Current quota status after this upload
  }
}
```

**Error Responses:**
- `400` - Invalid file type or missing fields
- `403` - Quota exceeded or daily limit reached

**Quota Exceeded Response (403):**
```json
{
  "success": false,
  "message": "Daily upload limit reached (10 uploads per day)",
  "reason": "daily_limit",
  "quota": {
    // Current quota status
  }
}
```

---

### POST /api/upload/chunk

Upload a single chunk of the file.

**Form Data:**
- `uploadId`: Upload session ID from init
- `chunkIndex`: Current chunk number (0-indexed)
- `totalChunks`: Total number of chunks
- `chunk`: File blob (multipart/form-data)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Chunk 5/1024 uploaded",
  "chunkIndex": 4
}
```

---

### POST /api/upload/complete

Complete the upload and merge chunks.

**Request Body:**
```json
{
  "uploadId": "a1b2c3d4e5f6...",
  "filename": "Movie.Name.2024.1080p.mp4",
  "totalChunks": 1024,
  "title": "Movie Name",  // Optional
  "imdbId": "tt1234567"   // Optional
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Upload completed successfully",
  "movie": {
    "id": 42,
    "title": "Movie Name",
    "year": "2024",
    "poster_url": "https://...",
    "imdb_rating": "8.5",
    // ... other metadata
  },
  "quota": {
    // Updated quota after upload
  }
}
```

**Error Responses:**
- `400` - Missing chunks or invalid data
- `403` - Quota exceeded (double-check before finalization)

---

## Admin - Quota Management

**Note:** All admin endpoints require admin privileges (is_admin flag or first user).

### GET /api/admin/quota/users

Get quota status for all users.

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "users": [
    {
      "userId": 1,
      "username": "john_doe",
      "quotaGB": 100,
      "usedGB": "23.45",
      "percentageUsed": "23.5",
      "totalUploads": 45
    },
    {
      "userId": 2,
      "username": "jane_smith",
      "quotaGB": 200,
      "usedGB": "156.78",
      "percentageUsed": "78.4",
      "totalUploads": 120
    }
  ]
}
```

---

### PUT /api/admin/quota/user/:userId

Update a user's quota settings.

**URL Parameters:**
- `userId`: User ID to update

**Request Body:**
```json
{
  "quotaGB": 200,
  "dailyLimit": 20
}
```

**Validation:**
- `quotaGB`: 1-10000 GB
- `dailyLimit`: 1-1000 uploads per day

**Success Response (200):**
```json
{
  "success": true,
  "message": "Quota updated successfully"
}
```

**Error Responses:**
- `400` - Invalid quota values
- `404` - User not found
- `403` - Not authorized (requires admin)

---

### GET /api/admin/quota/activity

Get upload activity logs.

**Query Parameters:**
- `userId` (optional): Filter by specific user
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Example: All Users Today**
```
GET /api/admin/quota/activity
```

**Response:**
```json
{
  "success": true,
  "date": "2024-03-29",
  "activity": [
    {
      "id": 1,
      "username": "john_doe",
      "upload_count": 5,
      "total_size_bytes": 10737418240,
      "last_upload": "2024-03-29T14:30:00Z"
    }
  ]
}
```

**Example: Specific User History**
```
GET /api/admin/quota/activity?userId=1&startDate=2024-03-01&endDate=2024-03-31
```

**Response:**
```json
{
  "success": true,
  "userId": 1,
  "startDate": "2024-03-01",
  "endDate": "2024-03-31",
  "activity": [
    {
      "upload_date": "2024-03-29",
      "upload_count": 5,
      "total_size_bytes": 10737418240,
      "last_upload": "2024-03-29T14:30:00Z"
    }
  ]
}
```

---

### GET /api/admin/quota/stats

Get system-wide quota statistics.

**Success Response (200):**
```json
{
  "success": true,
  "quotas": {
    "totalUsers": 25,
    "totalQuotaGB": 2500,
    "avgQuotaGB": "100.00",
    "totalDailyLimit": 250,
    "avgDailyLimit": "10.00"
  },
  "usage": {
    "totalMovies": 342,
    "totalGB": "1234.56",
    "percentageUsed": "49.4"
  },
  "today": {
    "uploads": 15,
    "sizeGB": "67.89"
  }
}
```

---

### POST /api/admin/quota/user/:userId/reset

Reset a user's upload activity (emergency use).

**Success Response (200):**
```json
{
  "success": true,
  "message": "Reset upload activity for user 1",
  "recordsDeleted": 30
}
```

---

### PUT /api/admin/quota/user/:userId/status

Activate or deactivate a user account.

**Request Body:**
```json
{
  "isActive": false
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deactivated successfully"
}
```

**Note:** Deactivated users cannot log in until reactivated.

---

## Admin - System Monitoring

### GET /api/admin/quota/api-health

Get API health and circuit breaker status.

**Success Response (200):**
```json
{
  "success": true,
  "circuitBreaker": {
    "state": "CLOSED",
    "failures": 0,
    "lastFailureTime": null,
    "threshold": 5
  },
  "recentActivity": [
    {
      "apiName": "OMDB",
      "totalCalls": 45,
      "successfulCalls": 44,
      "successRate": "97.8%",
      "avgResponseTime": "234ms",
      "lastCall": "2024-03-29T14:45:00Z"
    }
  ]
}
```

**Circuit Breaker States:**
- `CLOSED`: Normal operation
- `OPEN`: Too many failures, API calls blocked
- `HALF_OPEN`: Testing if API recovered

---

### GET /api/admin/quota/login-attempts

Monitor login attempts for security.

**Query Parameters:**
- `limit` (optional): Number of records (default: 50)

**Success Response (200):**
```json
{
  "success": true,
  "recentAttempts": [
    {
      "username": "john_doe",
      "ip_address": "192.168.1.100",
      "success": 1,
      "attempted_at": "2024-03-29T14:30:00Z"
    }
  ],
  "suspiciousIPs": [
    {
      "ip_address": "192.168.1.200",
      "failed_count": 5,
      "last_attempt": "2024-03-29T14:25:00Z"
    }
  ]
}
```

**Suspicious IPs:** 3+ failed attempts in the last hour.

---

## Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created (e.g., registration) |
| 400 | Bad Request | Validation error or invalid data |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions or account deactivated |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "reason": "error_code"  // Optional
}
```

**Common Error Codes:**
- `daily_limit` - Daily upload limit reached
- `quota_exceeded` - Storage quota exceeded
- `invalid_token` - JWT token invalid or expired
- `validation_error` - Input validation failed

---

## Rate Limits

| Endpoint Category | Limit | Window |
|------------------|-------|--------|
| General API | 1000 requests | 15 minutes |
| Authentication | 10 attempts | 15 minutes |
| Uploads | 50 uploads | 1 hour |
| Metadata API | 30 requests | 1 minute |

**Rate Limit Headers:**
```
RateLimit-Limit: 1000
RateLimit-Remaining: 999
RateLimit-Reset: 1711728000
```

---

## Quota Error Examples

### Daily Limit Reached
```json
{
  "success": false,
  "message": "Daily upload limit reached (10 uploads per day)",
  "reason": "daily_limit",
  "quota": {
    "daily": {
      "limit": 10,
      "uploadedToday": 10,
      "remainingToday": 0
    }
  }
}
```

### Storage Quota Exceeded
```json
{
  "success": false,
  "message": "Upload quota exceeded. Remaining: 5.23GB, File size: 10.50GB",
  "reason": "quota_exceeded",
  "quota": {
    "quota": {
      "totalGB": 100,
      "usedGB": 94.77,
      "remainingGB": 5.23
    }
  }
}
```

---

## Best Practices

1. **Always check quota** before initiating large uploads
2. **Handle rate limits** with exponential backoff
3. **Validate inputs** on client-side before API calls
4. **Store tokens securely** (localStorage or secure cookies)
5. **Monitor API health** before critical operations
6. **Log errors** for debugging and monitoring

---

**🎬 Happy coding with CineFlask API!**
