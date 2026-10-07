# Jack Papa

Jack Papa is a personal photo-sharing application. Users can create an account, sign in, publish photos with captions, and browse their own photo feed.

## Features

- Register with a name, email address, and password.
- Sign in with an existing account.
- Create a post by uploading an image and adding a caption.
- View the posts associated with the signed-in account.
- Keep uploaded image files in ImageKit and post records in MongoDB.
- Use a responsive React interface with loading, error, and upload feedback states.

The current application focuses on a personal photo feed. It does not currently implement likes, comments, follows, or a public discovery feed.

## Technology

- **Frontend:** React 19, Vite, Tailwind CSS, and Lucide icons
- **Backend:** Node.js, Express 5, and Mongoose
- **Database:** MongoDB
- **Image hosting:** ImageKit
- **Authentication:** JSON Web Tokens in a browser cookie, with passwords hashed using bcryptjs

## Project structure

```text
Project--1/
├── Another Frontend/       # React/Vite client
│   └── src/
│       ├── api.js           # Requests to the backend API
│       └── Stillroom.jsx    # Main application and screens
└── Backend/                 # Express API
	├── server.js            # Loads environment and starts the server
	└── src/
		├── controllers/     # Authentication and post handlers
		├── db/              # MongoDB connection
		├── middleware/      # Token verification
		├── models/          # User and post schemas
		├── routes/          # API route definitions
		└── services/        # ImageKit upload service
```

## Requirements

- Node.js and npm
- A MongoDB database, either local or hosted (for example, MongoDB Atlas)
- An ImageKit account and its private API key

## Configuration

Create a `.env` file inside `Backend/` with the following values:

```env
DATABASE=mongodb+srv://<username>:<password>@<cluster>/<database>
JWT=replace-with-a-long-random-secret
PRIVATE_KEY=your-imagekit-private-key
```

`DATABASE` is the MongoDB connection URI, `JWT` is used to sign authentication tokens, and `PRIVATE_KEY` authorizes image uploads to ImageKit. Keep these values private and do not commit the `.env` file. For MongoDB Atlas, ensure the database user and network access rules allow the backend to connect.

## Run locally

Install dependencies and start the backend from the project root:

```bash
cd Backend
npm install
node server.js
```

The API listens on `http://localhost:3000`. Keep this terminal running. In a second terminal, install and start the frontend:

```bash
cd "Another Frontend"
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`. The Vite development server proxies `/api` requests to the backend on port `3000`.

## API

All routes use the `/api/auth` prefix. Protected routes require the authentication cookie set during registration or login.

| Method | Endpoint             | Authentication | Description                                                                            |
| ------ | -------------------- | -------------- | -------------------------------------------------------------------------------------- |
| `POST` | `/api/auth/register` | No             | Create an account. JSON body: `name`, `email`, `password`.                             |
| `POST` | `/api/auth/login`    | No             | Sign in. JSON body: `email`, `password`.                                               |
| `GET`  | `/api/auth/feed`     | Yes            | Return the signed-in user's posts.                                                     |
| `POST` | `/api/auth/post`     | Yes            | Create a post using `multipart/form-data`: image field `img` and text field `caption`. |

The frontend sends requests with credentials enabled so the browser includes the authentication cookie. The feed response contains a `posts` array; creating a post returns the saved `userPost`.

## Data and image flow

1. Registration stores the user's name, email, and a bcrypt-hashed password in MongoDB.
2. Registration and login issue a JWT cookie used by protected API routes.
3. When a post is created, the backend uploads the image to ImageKit.
4. MongoDB stores the ImageKit image URL, caption, and owning user ID. The feed query only returns posts belonging to the authenticated user.
