from dataclasses import dataclass
import bcrypt
from typing import Optional, Union
from wireup import service
from flask_jwt_extended import current_user
from constants.messages import INVALID_USER_NAME_OR_PASSWORD
from constants.user_security_roles import SECURITY_ROLE_ADMIN, SECURITY_ROLE_USER
from exceptions.permission_exceptions import ForbiddenException
from services.base import BaseService
from services.data_service import DataService
from services.user_mapper_service import UserMapperService
from services.user_token_service import UserTokenService


@service
@dataclass
class DashboardService(BaseService):
    data_service: DataService
    user_mapper_service: UserMapperService
    user_token_service: UserTokenService

    def get_all_dashboards(self, include_roles: bool = False) -> list[dict]:
        # Does this user have permissions to access?
        if current_user is None or current_user["roles"] is None or "admin" not in current_user["roles"]:
            raise ForbiddenException()

        with self.data_service:
            # Default to no roles
            user_security_roles = None

            # If the caller wants roles included then fetch all user security roles
            if include_roles:
                user_security_roles = self.get_all_user_security_roles()

            # Get all users (as dictionary objects)
            users_list = self.data_service.get_users_db().getAll()

            user_models = []

            # Iterate each entity
            for user_entity in users_list:
                # Convert to user model (including user roles if roles list populated)
                user_model = self.user_mapper_service.map_to_model(
                    user_entity, user_security_roles)

                user_models.append(user_model)

            # Return list of user models
            return user_models
