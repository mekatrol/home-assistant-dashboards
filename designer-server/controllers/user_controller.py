from dataclasses import asdict
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from services.container_registry import get_container

from services.user_service import ForbiddenException, UserService

user_bp = Blueprint('users', __name__)


@user_bp.get('/all')
@jwt_required()
def get_all_users():
    container = get_container()
    user_service: UserService = container.get(UserService)

    try:
        # Get all users including their roles
        users = user_service.get_all_users(include_roles=True)

        # Convert to serializable dictionary versions
        # serializable_users = list(map(lambda u: asdict(u), users))

        # Return JSON response with user list
        return jsonify({
            "users": users
        }), 200
    except ForbiddenException:
        return jsonify({
            "message": "you are not permitted"
        }), 403
