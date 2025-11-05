from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

"""
OAuth2 password bearer scheme for token authentication.
"""
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login",
    scheme_name="JWT"
)

