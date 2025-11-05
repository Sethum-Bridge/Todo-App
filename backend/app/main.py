from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.prisma import lifespan
from app.routes import auth, todos
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A Todo App API built with FastAPI, Prisma, and MongoDB",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS
# Default to localhost:3000 if not set
default_origin = "http://localhost:3000"
allowed_origins = []

# Add frontend origin
if settings.FRONTEND_ORIGIN:
    allowed_origins.append(settings.FRONTEND_ORIGIN)
else:
    allowed_origins.append(default_origin)

# Add any additional allowed origins
if settings.ALLOWED_ORIGINS:
    additional_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
    allowed_origins.extend(additional_origins)

# Remove duplicates and ensure we have valid origins
allowed_origins = list(set([origin for origin in allowed_origins if origin]))
if not allowed_origins:
    allowed_origins = [default_origin]

# Log CORS configuration for debugging
logger.info(f"CORS configured for origins: {allowed_origins}")

# Add CORS middleware - MUST be added before routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(todos.router)


@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint - Health check.
    """
    return {
        "message": "Todo App API",
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy"}

