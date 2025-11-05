# Todo App

A full-stack Todo application built with FastAPI (Python) and Next.js (React/TypeScript), featuring user authentication, todo management with due dates, pinning functionality, and a modern UI.

## 🚀 Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **Prisma** - Database ORM
- **MongoDB** - NoSQL database
- **Python JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Uvicorn** - ASGI server

### Frontend
- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Query (TanStack Query)** - Data fetching
- **Radix UI** - UI components
- **Lucide React** - Icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **npm** or **yarn** - Comes with Node.js
- **MongoDB** - Either local installation or MongoDB Atlas account
- **Git** - [Download Git](https://git-scm.com/)

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Todo App"
```

### 2. Backend Setup

#### Step 1: Navigate to Backend Directory

```bash
cd backend
```

#### Step 2: Create Virtual Environment

**Windows:**
```powershell
python -m venv venv
```

**macOS/Linux:**
```bash
python3 -m venv venv
```

#### Step 3: Activate Virtual Environment

**Windows (PowerShell):**
```powershell
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
venv\Scripts\activate.bat
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

#### Step 4: Install Dependencies

```bash
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, install dependencies manually:

```bash
pip install fastapi uvicorn prisma python-dotenv python-jose[cryptography] bcrypt pydantic pymongo
```

#### Step 5: Setup Prisma

Generate Prisma client:

```bash
prisma generate --schema=./prisma/schema.prisma
```

#### Step 6: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Database Configuration
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/todo_app

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS Configuration
FRONTEND_ORIGIN=http://localhost:3000
ALLOWED_ORIGINS=

# Cookie Configuration (for production, set to true)
COOKIE_SECURE=False
COOKIE_SAMESITE=lax

# App Configuration
APP_NAME=Todo App API
APP_VERSION=1.0.0
```

**Important Notes:**
- Replace `DATABASE_URL` with your MongoDB connection string
- Generate a secure `SECRET_KEY` (you can use: `openssl rand -hex 32`)
- Update `FRONTEND_ORIGIN` if your frontend runs on a different port

#### Step 7: Update Prisma Schema (if needed)

If you're using a different MongoDB connection, update `backend/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

### 3. Frontend Setup

#### Step 1: Navigate to Frontend Directory

```bash
cd ../frontend
```

#### Step 2: Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

#### Step 3: Configure API Endpoint (if needed)

The frontend is configured to connect to `http://localhost:8000` by default. If your backend runs on a different port, update the API client configuration in `frontend/app/api/axiosClient.ts`.

## 🚀 Running the Application

### Start Backend Server

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment** (if not already activated):
   ```powershell
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   
   # Windows CMD
   venv\Scripts\activate.bat
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Start the server:**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at:
   - **API:** http://localhost:8000
   - **Swagger UI:** http://localhost:8000/docs
   - **ReDoc:** http://localhost:8000/redoc
   - **Health Check:** http://localhost:8000/health

### Start Frontend Server

1. **Open a new terminal and navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

   or

   ```bash
   yarn dev
   ```

   The frontend will be available at:
   - **Application:** http://localhost:3000

## 📁 Project Structure

```
Todo App/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Application configuration
│   │   │   ├── dependencies.py    # Dependency injection
│   │   │   └── security.py        # Security utilities
│   │   ├── database/
│   │   │   └── prisma.py          # Prisma client setup
│   │   ├── models/                # Database models
│   │   ├── routes/
│   │   │   ├── auth.py            # Authentication routes
│   │   │   └── todos.py           # Todo routes
│   │   ├── schemas/
│   │   │   ├── user.py            # User schemas
│   │   │   └── todo.py            # Todo schemas
│   │   ├── utils/
│   │   │   ├── jwt_handler.py     # JWT token handling
│   │   │   └── password.py        # Password hashing
│   │   └── main.py                # FastAPI application entry
│   ├── prisma/
│   │   └── schema.prisma          # Prisma schema
│   ├── venv/                      # Virtual environment
│   └── .env                       # Environment variables
│
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   └── axiosClient.ts     # API client configuration
│   │   ├── dashboard/
│   │   │   └── page.tsx           # Dashboard page
│   │   ├── login/
│   │   │   └── page.tsx           # Login page
│   │   ├── register/
│   │   │   └── page.tsx           # Registration page
│   │   ├── layout.tsx             # Root layout
│   │   ├── middleware.ts          # Auth middleware
│   │   └── providers.tsx          # React Query provider
│   ├── components/
│   │   ├── Navbar.tsx             # Navigation component
│   │   ├── TodoItem.tsx           # Todo item component
│   │   ├── TodoModal.tsx          # Todo modal component
│   │   └── ui/                    # UI components
│   ├── hooks/
│   │   └── useTodos.ts            # Todo hooks
│   ├── store/
│   │   ├── useAuthStore.ts        # Auth state management
│   │   └── useTodoStore.bak.ts    # Backup store
│   └── lib/                       # Utility functions
│
└── README.md                      # This file
```

## 📡 API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Todos

- `GET /todos` - Get all todos for authenticated user
- `POST /todos` - Create a new todo
- `GET /todos/{id}` - Get a specific todo
- `PUT /todos/{id}` - Update a todo
- `PATCH /todos/{id}` - Partially update a todo
- `DELETE /todos/{id}` - Delete a todo

### Health

- `GET /` - Root endpoint
- `GET /health` - Health check

For detailed API documentation, visit http://localhost:8000/docs when the backend is running.

## 🔐 Environment Variables

### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | MongoDB connection string | Required |
| `SECRET_KEY` | JWT secret key | Required |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token expiration | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | Refresh token expiration | `7` |
| `FRONTEND_ORIGIN` | Frontend URL for CORS | `http://localhost:3000` |
| `COOKIE_SECURE` | Secure cookie flag | `False` |
| `COOKIE_SAMESITE` | SameSite cookie attribute | `lax` |

## 🐛 Troubleshooting

### Backend Issues

**Problem: Module not found errors**
- Solution: Make sure virtual environment is activated and dependencies are installed
- Run: `pip install -r requirements.txt`

**Problem: Prisma client not found**
- Solution: Generate Prisma client
- Run: `prisma generate --schema=./prisma/schema.prisma`

**Problem: MongoDB connection error**
- Solution: Check `DATABASE_URL` in `.env` file
- Ensure MongoDB is running or MongoDB Atlas connection is correct

**Problem: Port 8000 already in use**
- Solution: Change port in uvicorn command
- Run: `uvicorn app.main:app --reload --port 8001`

### Frontend Issues

**Problem: Cannot connect to backend**
- Solution: Ensure backend is running on http://localhost:8000
- Check CORS configuration in backend `config.py`

**Problem: Dependencies installation fails**
- Solution: Clear cache and reinstall
- Run: `rm -rf node_modules package-lock.json && npm install`

**Problem: Build errors**
- Solution: Check Node.js version (should be 18+)
- Run: `node --version`

## 🧪 Development

### Backend Development

The backend uses `--reload` flag for auto-reload on code changes. No need to restart the server manually.

### Frontend Development

Next.js has hot module replacement enabled by default. Changes will reflect immediately in the browser.

## 📝 Features

- ✅ User authentication (register, login, logout)
- ✅ JWT-based authentication with refresh tokens
- ✅ Create, read, update, delete todos
- ✅ Mark todos as complete/incomplete
- ✅ Set due dates for todos
- ✅ Pin/unpin todos
- ✅ Filter todos (all, active, completed)
- ✅ Responsive design
- ✅ Modern UI with Tailwind CSS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Created with ❤️ for managing todos efficiently.

---

**Happy Coding! 🚀**

