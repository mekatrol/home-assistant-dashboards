from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional
from flask_jwt_extended import create_access_token, create_refresh_token, get_jti
from wireup import Inject, service
from services.base import BaseService
from services.data_service import DataService


@service
@dataclass
class UserTokenService(BaseService):
    data_service: DataService

    jwt_access_token_expiry_mins: Annotated[int, Inject(
        param="jwt_access_token_expiry_mins")]

    jwt_refresh_token_expiry_mins: Annotated[int, Inject(
        param="jwt_refresh_token_expiry_mins")]

    def get(self, user_name: str) -> list[dict]:
        with self.data_service:
            # Try and get by access token JTI
            user_tokens = self.data_service.get_user_tokens_db().getBy(
                {"userName": user_name})

            # Return user
            return user_tokens

    def getByAccessJti(self, jti: str) -> Optional[dict]:
        with self.data_service:
            # Try and get by access token JTI
            user_tokens = self.data_service.get_user_tokens_db().getBy(
                {"accessTokenJti": jti})

            if len(user_tokens) == 0:
                return None

            # Return user
            return user_tokens[0]

    def getByRefreshJti(self, jti: str) -> Optional[dict]:
        with self.data_service:
            # Try and get by refresh token JTI
            user_tokens = self.data_service.get_user_tokens_db().getBy(
                {"refreshTokenJti": jti})

            if len(user_tokens) == 0:
                return None

            # Return user
            return user_tokens[0]

    def create(self, user_name: str) -> dict:
        with self.data_service:
            # Revoke any existing
            self.revoke(user_name)

            # Create access token and metadata
            access_token_expires = timedelta(
                minutes=self.jwt_access_token_expiry_mins)
            access_token_expiry = datetime.now(
                timezone.utc) + access_token_expires
            access_token = create_access_token(
                identity=user_name, expires_delta=access_token_expires)

            # Create refresh token and metadata
            refresh_token_expires = timedelta(
                minutes=self.jwt_refresh_token_expiry_mins)
            refresh_token = create_refresh_token(
                identity=user_name, expires_delta=refresh_token_expires)
            refresh_token_expiry = datetime.now(
                timezone.utc) + refresh_token_expires

            token = {
                "userName": user_name,
                "accessToken": access_token,
                "accessTokenJti": get_jti(access_token),
                "accessTokenExpiry": access_token_expiry.isoformat(),
                "refreshToken": refresh_token,
                "refreshTokenJti": get_jti(refresh_token),
                "refreshTokenExpiry": refresh_token_expiry.isoformat()
            }

            self.data_service.get_user_tokens_db().add(token)

            # We don't want to include some of the properties in the return value
            del token['id']
            del token['accessTokenJti']
            del token['refreshTokenJti']

            return token

    def refresh(self, jti: str) -> Optional[str]:
        # Get existing token
        token = self.getByRefreshJti(jti)

        if token is None:
            # The token has been revoked
            return None

        # Create access token
        access_token_expires = timedelta(
            minutes=self.jwt_access_token_expiry_mins)
        access_token_expiry = datetime.now(
            timezone.utc) + access_token_expires
        access_token = create_access_token(
            identity=token["userName"], expires_delta=access_token_expires)

        token_id = token["id"]

        self.data_service.get_user_tokens_db().updateById(
            token_id, {"accessToken": access_token, "accessTokenJti": get_jti(access_token)})

        return {"accessToken": access_token, "accessTokenExpiry": access_token_expiry}

    def revoke(self, jti: str) -> None:
        with self.data_service:
            # Find existing tokens
            token = self.getByAccessJti(jti)

            if token is None:
                return

            # Get username from token
            user_name = token["userName"]

            # Get all tokens by user name
            tokens = self.get(user_name)

            # Revoke all found tokens
            for token in tokens:
                # Delete token from DB
                self.data_service.get_user_tokens_db().deleteById(token["id"])
