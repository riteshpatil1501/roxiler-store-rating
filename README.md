# Roxiler Store Rating

A full-stack store rating application built as part of the Roxiler Systems Full-Stack Developer assignment.

The application provides a single authentication system with role-based access for:

* System Administrators
* Normal Users
* Store Owners

## Tech Stack

### Frontend

* React.js
* Vite
* React Router
* Axios
* CSS

### Backend

* Node.js
* Express.js
* Prisma ORM
* JWT Authentication
* bcryptjs

### Database

* MariaDB / MySQL

## Features

### System Administrator

* Secure admin login
* Dashboard with:

  * Total Users
  * Total Stores
  * Total Ratings
* Create users with roles:

  * Admin
  * Normal User
  * Store Owner
* Create stores
* View and filter users
* Sort users by key fields
* View store listings
* Filter and sort stores
* View store ratings
* View individual user details
* View store-owner average rating
* Change password
* Logout

### Normal User

* Sign up
* Login
* View available stores
* Search stores by name or address
* Sort stores
* View overall store rating
* View personal submitted rating
* Submit a rating from 1 to 5
* Modify an existing rating
* Change password
* Logout

### Store Owner

* Login
* View store information
* View average store rating
* View total ratings
* View customers who rated the store
* Sort customer ratings by name, email, or rating
* Change password
* Logout

## Validation

The application implements the required validation rules:

* Name: 20–60 characters
* Address: maximum 400 characters
* Password: 8–16 characters
* Password must contain at least one uppercase letter
* Password must contain at least one special character
* Email must follow a valid email format
* Store ratings must be integers from 1 to 5
* A user can have only one rating per store

## Project Structure

```text
roxiler-assignment/
│
├── backend/
│   ├── prisma/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   └── utils/
│   ├── .env
│   ├── package.json
│   └── seedAdmin.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md
```

## Local Setup

### Prerequisites

Install:

* Node.js
* npm
* XAMPP or another MySQL/MariaDB server

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd roxiler-assignment
```

### 2. Create the database

Create a MariaDB/MySQL database named:

```text
roxiler_store_rating
```

Make sure the database server is running.

### 3. Configure the backend

Navigate to:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create a `.env` file:

```env
DATABASE_URL="mysql://root@localhost:3306/roxiler_store_rating"

DB_HOST="localhost"
DB_USER="root"
DB_PASSWORD=""
DB_NAME="roxiler_store_rating"
DB_PORT="3306"

JWT_SECRET="YOUR_SECRET_KEY"
```

Run Prisma migrations:

```bash
npx prisma migrate deploy
```

Generate the Prisma client:

```bash
npx prisma generate
```

### 4. Create the admin account

Run:

```bash
node seedAdmin.js
```

The seed script creates the initial administrator account if it does not already exist.

### 5. Start the backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

## API Overview

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
PUT  /api/auth/change-password
```

### Administrator

```text
GET  /api/admin/dashboard
POST /api/admin/users
GET  /api/admin/users
GET  /api/admin/users/:id
```

### Stores

```text
POST /api/stores
GET  /api/stores
GET  /api/stores/user
```

### Ratings

```text
POST /api/ratings
```

### Store Owner

```text
GET /api/owner/dashboard
```

## Authentication

The application uses JWT-based authentication.

Authenticated requests send the token using:

```text
Authorization: Bearer <token>
```

Passwords are securely hashed using bcrypt.

## Role-Based Access

| Role        | Access                                  |
| ----------- | --------------------------------------- |
| Admin       | Admin dashboard, users, stores, ratings |
| Normal User | Store browsing and rating               |
| Store Owner | Store rating dashboard                  |

Backend authorization middleware prevents users from accessing routes belonging to other roles.

## Sorting

Sorting is supported across the application's relevant tables and listings.

Examples include:

* User name
* User email
* User address
* User role
* Store name
* Store email
* Store address
* Store rating
* Overall rating
* Store-owner customer name
* Store-owner customer email
* Submitted rating

Both ascending and descending sorting are supported.

## Security Notes

Sensitive environment variables are stored in `.env` and excluded from Git using `.gitignore`.

Do not commit:

```text
.env
node_modules/
dist/
```

## Testing

The application has been manually tested for:

* Admin authentication
* Normal user authentication
* Store owner authentication
* User signup
* Password validation
* Email validation
* Name validation
* Store creation
* User creation
* Store search
* Store sorting
* Rating submission
* Rating modification
* Admin dashboard
* Store owner dashboard
* Role-based authorization
* Logout
* Production frontend build

## Live Demo

The live deployment URL will be added here after deployment.

```text
Frontend: <LIVE_FRONTEND_URL>
Backend: <LIVE_BACKEND_URL>
```

## Repository

GitHub repository:

```text
<YOUR_GITHUB_REPOSITORY_URL>
```

## Author

Ritesh Patil
    