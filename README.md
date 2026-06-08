# Gym Management Backend API Documentation

This repository contains a Node.js/Express/MongoDB backend for a gym management system plus a Next.js frontend. This document focuses on the backend API surface, especially users, authentication, roles, and permissions.

## Backend Runtime

- Backend entry point: `backend/index.js`
- Default port: `7000`
- Base URL locally: `http://localhost:7000`
- API base path: `http://localhost:7000/api`
- Database: MongoDB via Mongoose
- Module system: CommonJS

## Environment Variables

Create `backend/.env` or root `.env` with:

```env
PORT=7000
MONGO_URI=mongodb://127.0.0.1:27017/gym-management
JWT_SECRET=replace-with-a-strong-secret
TOKEN_SECRET=replace-with-a-strong-secret
JWT_SECRET_FOR_VERIFY=replace-with-a-strong-secret
CORS_ORIGIN=http://localhost:3000
```

If `MONGO_URI` is not set, the backend falls back to `mongodb://127.0.0.1:27017/gym-management`.

## Authentication and Roles

JWT authentication is supported with either:

```http
Authorization: Bearer <token>
```

or the `token` HTTP-only cookie set by `POST /api/auth/login`.

Supported user roles in the `User` model include the existing application roles used by MongoDB-backed authentication:

- `Admin` / `admin`
- `Member` / `member` / `user`
- `Trainer` / `trainer`
- `Reception` / `reception`
- `CafeManager` / `cafe`

The application does not create demo users for login. Authentication reads only existing MongoDB users and returns role-aware redirects from `POST /api/auth/login`.

## Health Endpoint

### `GET /`

Authentication: not required.

Response example:

```text
Server is running successfully
```

## Authentication APIs

### `POST /api/auth/login`

Authentication: not required.

Logs in by `employeeCode`, `email`, or `username` plus password. Returns a JWT in the response body and sets an HTTP-only cookie named `token`.

Request body example:

```json
{
  "loginIdentifier": "<employeeCode-or-email-or-username>",
  "password": "<password>"
}
```

Success response example:

```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "_id": "<mongo-user-id>",
    "name": "<user-name>",
    "username": "<username>",
    "employeeCode": "<employee-code>",
    "role": "<normalized-role>",
    "email": "<email>",
    "profileImage": null,
    "status": "active"
  },
  "redirectTo": "<role-dashboard-path>"
}
```

Error response examples:

```json
{ "success": false, "message": "employeeCode, email, or username and password are required" }
```

```json
{ "success": false, "message": "کاربر یافت نشد" }
```

```json
{ "success": false, "message": "رمز عبور اشتباه است" }
```

### `POST /api/auth/register`

Authentication: not required.

Creates a user account through the auth API. This is a minimal registration endpoint and does not remove or replace the existing `/api/users` create endpoint.

Request body example:

```json
{
  "name": "New Member",
  "employeeCode": "MEM001",
  "username": "newmember",
  "email": "newmember@example.com",
  "password": "Password@123",
  "role": "user",
  "contactNumber": "09120000000",
  "address": "Tehran",
  "birthday": "1375/01/01"
}
```

Success response example:

```json
{
  "success": true,
  "token": "<jwt>",
  "user": {
    "_id": "665f1f000000000000000002",
    "name": "New Member",
    "username": "newmember",
    "employeeCode": "MEM001",
    "role": "user",
    "email": "newmember@example.com",
    "status": "active"
  }
}
```

### `GET /api/auth/me`

Authentication: required.

Returns the current authenticated user.

Request header example:

```http
Authorization: Bearer <jwt>
```

Success response example:

```json
{
  "success": true,
  "user": {
    "_id": "<mongo-user-id>",
    "name": "<user-name>",
    "username": "<username>",
    "employeeCode": "<employee-code>",
    "role": "<normalized-role>",
    "email": "<email>",
    "status": "active"
  }
}
```

### `GET /api/auth/admin-only`

Authentication: required. Role: `Admin` or `admin`.

Success response example:

```json
{ "success": true, "message": "Welcome Admin!" }
```

## User APIs

Routes are mounted under `/api/users`. Existing route-level auth placeholders are preserved for compatibility, so check individual production auth requirements before exposing these endpoints publicly.

### `POST /api/users`

Authentication: currently not enforced by the route placeholder.

Creates a user. Supports `multipart/form-data` with optional `profileImage` file.

JSON request body example:

```json
{
  "name": "Gym Member",
  "employeeCode": "MEM002",
  "username": "gymmember",
  "password": "Password@123",
  "email": "gymmember@example.com",
  "role": "Member",
  "contactNumber": "09120000001",
  "address": "Tehran",
  "status": "active",
  "birthday": "1375/01/01"
}
```

Success response example:

```json
{
  "success": true,
  "user": {
    "_id": "665f1f000000000000000003",
    "name": "Gym Member",
    "employeeCode": "MEM002",
    "username": "gymmember",
    "email": "gymmember@example.com",
    "role": "Member",
    "status": "active",
    "profileImage": "/images/users/file.jpg"
  }
}
```

### `GET /api/users`

Authentication: currently placeholder; intended Admin access.

Query parameters:

- `status`: `active`, `inactive`, `blocked`
- `role`: any supported role

Example:

```http
GET /api/users?status=active&role=Member
```

Success response example:

```json
{
  "success": true,
  "users": [
    {
      "_id": "665f1f000000000000000003",
      "name": "Gym Member",
      "employeeCode": "MEM002",
      "role": "Member",
      "status": "active"
    }
  ]
}
```

### `GET /api/users/employee/:code`

Authentication: currently placeholder.

Success response example:

```json
{
  "success": true,
  "user": {
    "_id": "665f1f000000000000000003",
    "name": "Gym Member",
    "employeeCode": "MEM002",
    "role": "Member"
  }
}
```

### `GET /api/users/:id`

Authentication: currently placeholder.

Success response example:

```json
{
  "success": true,
  "user": {
    "_id": "665f1f000000000000000003",
    "name": "Gym Member",
    "employeeCode": "MEM002",
    "role": "Member"
  }
}
```

### `PUT /api/users/:id`

Authentication: currently placeholder; intended Admin access.

Updates a user. Supports `multipart/form-data` with optional `profileImage` file.

Request body example:

```json
{
  "name": "Updated Member",
  "email": "updated@example.com",
  "role": "Trainer",
  "contactNumber": "09120000002",
  "status": "active",
  "birthday": "1375/01/01"
}
```

Success response example:

```json
{
  "success": true,
  "user": {
    "_id": "665f1f000000000000000003",
    "name": "Updated Member",
    "email": "updated@example.com",
    "role": "Trainer"
  }
}
```

### `DELETE /api/users/:id`

Authentication: currently placeholder; intended Admin access.

Success response example:

```json
{ "success": true, "message": "User deleted" }
```

### `POST /api/users/:id/verify-password`

Authentication: currently placeholder.

Request body example:

```json
{ "password": "Password@123" }
```

Success response example:

```json
{ "success": true, "valid": true }
```

### `POST /api/users/:id/reset-token`

Authentication: currently placeholder.

Generates a password reset token for a user.

Success response example:

```json
{ "success": true, "token": "<reset-token>" }
```

### `POST /api/users/reset-password`

Authentication: not required.

Request body example:

```json
{
  "token": "<reset-token>",
  "newPassword": "NewPassword@123"
}
```

Success response example:

```json
{ "success": true, "message": "Password reset successful" }
```

### `PATCH /api/users/:id/status`

Authentication: currently placeholder; intended Admin access.

Request body example:

```json
{ "status": "blocked" }
```

Success response example:

```json
{
  "success": true,
  "user": {
    "_id": "665f1f000000000000000003",
    "status": "blocked"
  }
}
```

## Admin / Staff Authentication and Role APIs

Routes are mounted under `/api/admin`. These are legacy staff/admin APIs backed by the `Admin` model.

### `POST /api/admin/register`

Authentication: not required by route.

Request body example:

```json
{
  "name": "Staff Admin",
  "email": "staff-admin@example.com",
  "password": "Password@123",
  "role": "Admin"
}
```

Success response example:

```json
{
  "token": "<jwt>",
  "_id": "665f1f000000000000000010",
  "name": "Staff Admin",
  "email": "staff-admin@example.com",
  "role": "Admin",
  "joiningData": 1717510000000
}
```

### `POST /api/admin/login`

Authentication: not required.

Request body example:

```json
{
  "email": "staff-admin@example.com",
  "password": "Password@123"
}
```

Success response example:

```json
{
  "token": "<jwt>",
  "_id": "665f1f000000000000000010",
  "name": "Staff Admin",
  "phone": "09120000003",
  "email": "staff-admin@example.com",
  "image": "",
  "role": "Admin"
}
```

### `PATCH /api/admin/change-password`

Authentication: not required by route.

Request body example:

```json
{
  "email": "staff-admin@example.com",
  "oldPass": "Password@123",
  "newPass": "NewPassword@123"
}
```

Success response example:

```json
{ "message": "Password changed successfully" }
```

### `POST /api/admin/add`

Authentication: not required by route.

Request body example:

```json
{
  "name": "Reception Staff",
  "email": "reception@example.com",
  "password": "Password@123",
  "phone": "09120000004",
  "joiningDate": "2026/06/07",
  "role": "Reception",
  "image": ""
}
```

Success response example:

```json
{ "message": "Staff Added Successfully!" }
```

### `GET /api/admin/all`

Authentication: not required by route.

Success response example:

```json
{
  "status": true,
  "message": "Staff get successfully",
  "data": []
}
```

### `GET /api/admin/get/:id`

Authentication: not required by route.

Success response example:

```json
{
  "_id": "665f1f000000000000000010",
  "name": "Staff Admin",
  "email": "staff-admin@example.com",
  "role": "Admin"
}
```

### `PATCH /api/admin/update-stuff/:id`

Authentication: not required by route.

Request body example:

```json
{
  "name": "Updated Staff",
  "email": "staff-admin@example.com",
  "phone": "09120000005",
  "role": "Manager",
  "joiningDate": "2026/06/07",
  "image": ""
}
```

Success response example:

```json
{
  "token": "<jwt>",
  "_id": "665f1f000000000000000010",
  "name": "Updated Staff",
  "email": "staff-admin@example.com",
  "role": "Manager",
  "image": "",
  "phone": "09120000005"
}
```

### `DELETE /api/admin/:id`

Authentication: not required by route.

Success response example:

```json
{ "message": "Admin Deleted Successfully" }
```

### `PATCH /api/admin/forget-password`

Authentication: not required.

Request body example:

```json
{ "email": "staff-admin@example.com" }
```

Success response example:

```json
{ "message": "Please check your email to reset password!" }
```

### `PATCH /api/admin/confirm-forget-password`

Authentication: not required.

Request body example:

```json
{
  "token": "<reset-token>",
  "password": "NewPassword@123"
}
```

Success response example:

```json
{ "message": "Password reset successfully" }
```

## Equipment APIs

Routes are mounted under `/api/equipment`.

### `POST /api/equipment`

Request body example:

```json
{
  "equipmentCode": "EQ-401",
  "name": "Treadmill",
  "brand": "Technogym",
  "model": "Run 1000",
  "healthIndex": 95,
  "lastServiceDate": "1404/03/17",
  "operationalStatus": "Operational",
  "location": "Cardio Hall",
  "purchaseDate": "1403/01/01",
  "warrantyEndDate": "1405/01/01",
  "notes": "New unit"
}
```

### `GET /api/equipment`

Returns all equipment.

### `GET /api/equipment/:id`

Returns one equipment item by MongoDB id.

### `PUT /api/equipment/:id`

Updates equipment fields.

### `DELETE /api/equipment/:id`

Deletes equipment.

### `POST /api/equipment/:id/maintenance`

Request body example:

```json
{
  "date": "1404/03/17",
  "action": "Monthly service",
  "performedBy": "Maintenance Team",
  "healthIndex": 98
}
```

## Training Request APIs

Routes are mounted under `/api/training-requests`.

- `POST /api/training-requests` — create a training request; supports multipart `photos` upload.
- `GET /api/training-requests` — list all requests.
- `GET /api/training-requests/user/:userId` — list requests for a user.
- `GET /api/training-requests/trainer/:trainerId` — list requests for a trainer.
- `GET /api/training-requests/:id` — get a request by id.
- `PUT /api/training-requests/:id` — update a request; supports multipart `photos` upload.
- `DELETE /api/training-requests/:id` — delete a request.

Create request body example:

```json
{
  "user": "665f1f000000000000000003",
  "trainer": "665f1f000000000000000004",
  "goal": "Hypertrophy",
  "notes": "Beginner program"
}
```

## Cafe Menu APIs

Routes are mounted under `/api/menu` and legacy `/menu`.

- `POST /api/menu` — create menu item; requires multipart `img` file.
- `GET /api/menu` — list menu items.
- `GET /api/menu/:id` — get menu item by id.
- `PUT /api/menu/:id` — update menu item; optional multipart `img` file.
- `DELETE /api/menu/:id` — delete menu item.

Create menu multipart fields:

```json
{
  "name": "Protein Shake",
  "category": "Drink",
  "price": 150000,
  "kcal": 220
}
```

## Upload APIs

### `POST /api/upload/upload-document`

Authentication: not required by route.

Multipart form field: `documentFile`.

Success response example:

```json
{
  "success": true,
  "filePath": "/documents/property-documents/document.pdf"
}
```

## Static File Routes

- `GET /uploads/<path>`
- `GET /images/<path>`
- `GET /documents/<path>`

These serve files produced by the upload middleware.

## Local Development Commands

```bash
cd backend
npm install
npm run dev
```

Run syntax checks:

```bash
cd backend
npm run build
```

Login users must already exist in MongoDB; no seed command is provided for authentication.
