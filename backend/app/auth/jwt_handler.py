import os

from jose import jwt, JWTError
from datetime import datetime, timedelta

# Secret key used to sign JWT tokens
SECRET_KEY = os.getenv("JWT_SECRET_KEY")

# JWT encryption algorithm
ALGORITHM = "HS256"

# Token validity time (in minutes)
ACCESS_TOKEN_EXPIRE_MINUTES = 60


def create_access_token(data: dict):
    """
    Generate JWT Access Token
    """

    # Copy user data
    to_encode = data.copy()

    # Calculate token expiry time
    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    # Add expiry time to token payload
    to_encode.update(
        {
            "exp": expire
        }
    )

    # Generate JWT token
    token = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )
    print("SECRET_KEY while creating:", SECRET_KEY)

    return token


def verify_access_token(token: str):
    """
    Verify JWT Access Token
    """

    try:

        # Print received token (Debug)
        print("Received Token:", token)
        print("SECRET_KEY while verifying:", SECRET_KEY)

        # Decode and verify JWT token
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        # Print payload (Debug)
        print("Payload:", payload)

        # Extract username from token
        username = payload.get("sub")

        # Username not found
        if username is None:
            print("Username not found in token")
            return None

        # Return username
        return username

    except JWTError as e:

        # Print exact JWT error
        print("JWT Error:", str(e))

        return None