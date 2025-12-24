# Pet Adoption Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing pet adoptions.

## Features

### For Adopters:
- Browse available pets with search and filter functionality
- View detailed pet information
- Submit adoption applications
- Track application status
- User authentication and profile management

### For Admins:
- Add, edit, and delete pets
- Manage adoption applications (approve/reject)
- View all users and applications
- Update pet status

## Tech Stack

- **Frontend**: React.js, React Router, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs

## Project Structure

```
petAdoptionSystem/
├── backend/
│   ├── models/          # MongoDB models (User, Pet, Application)
│   ├── routes/          # API routes
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context (Auth)
│   │   ├── utils/       # Utility functions
│   │   └── App.js
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

> **📚 For detailed database setup instructions, see [DATABASE_SETUP.md](./DATABASE_SETUP.md)**

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/petAdoptionDB
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
```

> **Note:** For MongoDB Atlas setup, see [DATABASE_SETUP.md](./DATABASE_SETUP.md#option-2-mongodb-atlas-cloud---recommended-for-production)

4. Start the backend server:
```bash
npm run dev
```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory (optional):
```
REACT_APP_API_URL=http://localhost:5000
```

4. Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)

### Pets
- `GET /api/pets` - Get all pets (with filters)
- `GET /api/pets/:id` - Get single pet
- `POST /api/pets` - Create pet (Admin only)
- `PUT /api/pets/:id` - Update pet (Admin only)
- `DELETE /api/pets/:id` - Delete pet (Admin only)

### Applications
- `GET /api/applications` - Get applications (filtered by user role)
- `GET /api/applications/:id` - Get single application
- `POST /api/applications` - Create adoption application
- `PUT /api/applications/:id/status` - Update application status (Admin only)
- `DELETE /api/applications/:id` - Delete/withdraw application

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user profile

## Default Admin User

To create an admin user, see detailed instructions in [DATABASE_SETUP.md](./DATABASE_SETUP.md#step-5-create-admin-user)

Quick method:
1. Register a user through the application
2. Update the role in MongoDB:
```javascript
db.users.updateOne({email: "admin@example.com"}, {$set: {role: "admin"}})
```

Or use MongoDB Compass/CLI to update the user document.

## Usage

1. **Register/Login**: Create an account or login as an existing user
2. **Browse Pets**: View available pets on the home page
3. **Filter & Search**: Use filters to find specific pets
4. **View Details**: Click on a pet to see detailed information
5. **Apply for Adoption**: Submit an adoption application (adopters only)
6. **Admin Dashboard**: Access admin features if you're an admin user

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000)

## Security Features

- Password hashing with bcryptjs
- JWT-based authentication
- Protected routes (admin and user)
- Input validation
- CORS enabled

## Future Enhancements

- Image upload functionality
- Email notifications
- Advanced search with pagination
- Pet favorites/wishlist
- Adoption history
- Reviews and ratings
- Payment integration


