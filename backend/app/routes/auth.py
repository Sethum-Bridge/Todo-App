from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from app.schemas.user import UserCreate, UserLogin, UserResponse, TokenResponse
from app.database.prisma import get_prisma_client
from app.utils.password import hash_password, verify_password
from app.utils.jwt_handler import create_access_token, create_refresh_token, verify_token
from app.core.config import settings
from prisma import Prisma

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    prisma: Prisma = Depends(get_prisma_client)
):
    """
    Register a new user.
    
    - **email**: User's email address (must be unique)
    - **password**: User's password (will be hashed)
    
    Returns the created user object without the password.
    """
    # Check if user already exists
    existing_user = await prisma.user.find_unique(where={"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    user = await prisma.user.create(
        data={
            "email": user_data.email,
            "password": hashed_password
        }
    )
    
    return UserResponse(
        id=user.id,
        email=user.email,
        createdAt=user.createdAt
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    user_data: UserLogin,
    prisma: Prisma = Depends(get_prisma_client)
):
    """
    Authenticate user and issue access + refresh tokens.
    
    Tokens are set as HTTP-only cookies for security.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns access and refresh tokens.
    """
    # Find user by email
    user = await prisma.user.find_unique(where={"email": user_data.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(user_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    # Set HTTP-only cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE.lower(),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE.lower(),
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/"
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    prisma: Prisma = Depends(get_prisma_client)
):
    """
    Refresh access token using refresh token.
    
    Gets refresh token from HTTP-only cookie.
    Issues a new access token.
    """
    # Get refresh token from cookie
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not provided"
        )
    
    # Verify refresh token
    payload = verify_token(refresh_token, token_type="refresh")
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Verify user still exists
    user = await prisma.user.find_unique(where={"id": user_id})
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Create new access token
    new_access_token = create_access_token(data={"sub": user.id})
    
    # Update access token cookie
    response.set_cookie(
        key="access_token",
        value=new_access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE.lower(),
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/"
    )
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=refresh_token
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(response: Response):
    """
    Logout user by clearing authentication cookies.
    
    Clears both access and refresh token cookies.
    """
    response.delete_cookie(
        key="access_token", 
        httponly=True, 
        samesite=settings.COOKIE_SAMESITE.lower(),
        secure=settings.COOKIE_SECURE,
        path="/"
    )
    response.delete_cookie(
        key="refresh_token", 
        httponly=True, 
        samesite=settings.COOKIE_SAMESITE.lower(),
        secure=settings.COOKIE_SECURE,
        path="/"
    )
    
    return {"message": "Successfully logged out"}

