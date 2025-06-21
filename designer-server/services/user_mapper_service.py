from typing import Optional
from wireup import service
from services.base import BaseService


@service
class UserMapperService(BaseService):

    def map_to_model(self, user: dict, roles: Optional[list[dict]]) -> dict:
        # Het the user ID as the key for the user identity
        user_id = user["id"]

        user_model = {
            "id": user_id,
            "userName": user["userName"],
            "roles": []
        }

        if roles is not None:
            # Create a filter to get roles for just this user
            roles_filter = filter(
                lambda role: role["userId"] == user_id, roles)

            # Create a map to select just the role name
            roles_map = map(lambda r: r["role"], roles_filter)

            # Create a list of role names
            user_model["roles"] = list(roles_map)

        return user_model
