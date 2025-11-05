from fastapi import Depends, HTTPException, status, Request
from app.utils.jwt_handler import verify_token
from app.database.prisma import get_prisma_client
from prisma import Prisma


async def get_token_from_cookie_or_header(request: Request) -> str:
    """
    Extract JWT token from HTTP-only cookie or Authorization header.
    Checks cookie first, then falls back to Authorization header.
    
    Args:
        request: FastAPI request object
        
    Returns:
        JWT token string
        
    Raises:
        HTTPException: If no token is found
    """
    # First, try to get token from cookie (HTTP-only cookie set by backend)
    token = request.cookies.get("access_token")
    
    # If not in cookie, try Authorization header
    if not token:
        authorization = request.headers.get("Authorization")
        if authorization:
            try:
                scheme, token = authorization.split()
                if scheme.lower() != "bearer":
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="Invalid authentication scheme",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authorization header",
                    headers={"WWW-Authenticate": "Bearer"},
                )
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return token


async def get_current_user_id(
    token: str = Depends(get_token_from_cookie_or_header),
    prisma: Prisma = Depends(get_prisma_client)
) -> str:
    """
    Dependency to get the current authenticated user ID from JWT token.
    
    Args:
        token: JWT access token from cookie or header (injected by get_token_from_cookie_or_header)
        prisma: Prisma client instance
        
    Returns:
        User ID string
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token, token_type="access")
    if payload is None:
        raise credentials_exception
    
    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    
    # Verify user still exists
    user = await prisma.user.find_unique(where={"id": user_id})
    if user is None:
        raise credentials_exception
    
    return user_id


async def get_current_user(
    user_id: str = Depends(get_current_user_id),
    prisma: Prisma = Depends(get_prisma_client)
):
    """
    Dependency to get the current authenticated user object.
    
    Args:
        user_id: Current user ID from get_current_user_id
        prisma: Prisma client instance
        
    Returns:
        User object
    """
    user = await prisma.user.find_unique(where={"id": user_id})
    return user

