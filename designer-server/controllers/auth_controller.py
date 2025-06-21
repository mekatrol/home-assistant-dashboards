 # controller/auth_controller.py

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required, current_user
from services.container_registry import get_container

from constants.messages import (
    ACCESS_TOKEN_INVALID,
    INVALID_USER_NAME_OR_PASSWORD,
    SERVER_ERROR_OCCURRED,
    USER_ALREADY_EXISTS,
    ACCESS_TOKEN_REVOKED,
)
from services.user_token_service import UserTokenService
from services.user_service import (
    InvalidCredentialsException,
    UserExistsException,
    UserService,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register_user():
    try:
        container = get_container()
        user_service: UserService = container.get(UserService)

        # Get body as JSON
        data = request.get_json()

        # Get provided user name and password (with defaults if not provided)
        user_name = data.get("userName", "")
        password = data.get("password", "")

        # Create the user
        user = user_service.create_user(user_name, password)

        # Return created message with the new user ID
        return jsonify({"message": f"user '{user['userName']}' created"}), 201

    except UserExistsException:
        return jsonify({"message": USER_ALREADY_EXISTS}), 409  # Conflict
    except InvalidCredentialsException as ex:
        return jsonify({"message": str(ex)}), 400  # Bad request
    except Exception as ex:
        # Print exception for debugging use
        print(ex)

        # Internal server error
        return jsonify({"message": SERVER_ERROR_OCCURRED}), 500


@auth_bp.post("/login")
def login_user():
    try:
        container = get_container()
        user_service: UserService = container.get(UserService)

        # Get body as JSON
        data = request.get_json()

        # Get provided user name and password (with defaults if not provided)
        user_name = data.get("userName", "")
        password = data.get("password", "")

        if (
            user_name is None
            or len(user_name) == 0
            or password is None
            or len(password) == 0
        ):
            # A user name and password must be provided
            return jsonify({"message": INVALID_USER_NAME_OR_PASSWORD}), 401

        # Get user credentials from the request
        user_name = user_name.strip()
        password = password.strip()

        # Locate user by user_name
        user = user_service.get_user(user_name)

        if user is None:
            # A matching user_name was not found in the database
            return jsonify({"message": INVALID_USER_NAME_OR_PASSWORD}), 401

        try:
            # Login user
            token = user_service.login_user(user_name, password)

            # Return token to caller
            return jsonify(token), 200
        except InvalidCredentialsException as ex:
            return jsonify({"message": str(ex)}), 401  # Unauthorized

    except Exception as ex:
        # Print exception for debugging use
        print(ex)

        # Internal server error
        return jsonify({"message": SERVER_ERROR_OCCURRED}), 500


@auth_bp.get("/logout")
@jwt_required(verify_type=False)
def logout_user():
    container = get_container()
    user_token_service: UserTokenService = container.get(UserTokenService)

    jwt = get_jwt()

    user_token_service.revoke(jwt["jti"])

    # Always return success regardless of result
    return jsonify({"message": ACCESS_TOKEN_REVOKED}), 200


@auth_bp.get("/refresh-token")
@jwt_required(refresh=True)
def refresh_token():
    container = get_container()
    user_token_service: UserTokenService = container.get(UserTokenService)

    jwt = get_jwt()

    access_token = user_token_service.refresh(jwt["jti"])

    if access_token is None:
        # If the user had a valid refresh token but they have no access token entry in the DB
        # then their refresh token is no longer valid
        return jsonify({"message": ACCESS_TOKEN_INVALID}), 401

    return jsonify(access_token), 200


@auth_bp.get("/user")
@jwt_required()
def get_user_detail():
    user_model = {
        "id": current_user["id"],
        "userName": current_user["userName"],
        "roles": current_user["roles"],
    }
    return jsonify({"user": user_model}), 200
