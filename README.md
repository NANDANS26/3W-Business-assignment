# Mini Social Post Application

A full-stack social media application where users can create accounts, post text or images, view posts from others, like, and comment.

## Features

- **Account Creation**: Sign up and login with email and password
- **Create Post**: Post text, images, or both (at least one required)
- **Feed**: Public feed showing all posts from all users
- **Like & Comment**: Like and comment on posts with real-time updates
- **Responsive Design**: Works on desktop and mobile devices
- **Pagination**: Efficient infinite scroll pagination

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (file uploads)
- Cloudinary (image storage)

### Frontend
- React.js
- Material UI (MUI)
- React Router
- Axios
- Date-fns

## Project Structure

```
mini-social-app/
├── backend/
│   ├── models/         # Mongoose models (User, Post)
│   ├── routes/         # Express routes (auth, posts)
│   ├── middleware/     # Authentication middleware
│   ├── utils/          # Utility functions (Cloudinary)
│   ├── server.js       # Main server file
│   └── .env            # Environment variables
│
└── frontend/
    ├── src/
    │   ├── components/ # React components (Navbar, PostCard)
    │   ├── pages/      # Page components (Feed, Login, Register, CreatePost)
    │   ├── context/    # React context (AuthContext)
    │   ├── utils/      # Utility functions (API)
    │   ├── App.jsx     # Main App component
    │   └── main.jsx    # Entry point
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/socialapp
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Posts
- `GET /api/posts?page=1&limit=10` - Get all posts (with pagination)
- `POST /api/posts` - Create new post (requires auth)
- `POST /api/posts/:postId/like` - Like/unlike post (requires auth)
- `POST /api/posts/:postId/comment` - Add comment (requires auth)
- `GET /api/posts/:postId/comments` - Get comments for a post

## Database Schema

### Users Collection
- username (String, unique, required)
- email (String, unique, required)
- password (String, required)
- createdAt (Date)

### Posts Collection
- userId (ObjectId, ref: 'User')
- username (String)
- text (String)
- image (String)
- likes (Array of ObjectIds)
- likedBy (Array of {userId, username})
- comments (Array of {userId, username, text, createdAt})
- createdAt (Date)

## Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables in Render dashboard
4. Deploy

### Frontend (Vercel/Netlify)
1. Build the app: `npm run build`
2. Deploy the `dist` folder to Vercel or Netlify
3. Set environment variable for API URL

### Database (MongoDB Atlas)
1. Create a free cluster on MongoDB Atlas
2. Get connection string
3. Update `MONGODB_URI` in environment variables

## Future Improvements

- [ ] User profiles with avatars
- [ ] Edit/delete posts
- [ ] Delete comments
- [ ] Real-time notifications
- [ ] Follow/unfollow users
- [ ] Private messaging
- [ ] Search functionality
- [ ] Dark mode

## License

MIT License
