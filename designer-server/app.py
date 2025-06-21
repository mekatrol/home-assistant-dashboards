import yaml
from flask_jwt_extended import JWTManager
from flask import Flask, jsonify
from flask_cors import CORS
from pyaml_env import parse_config
from constants.messages import ACCESS_TOKEN_EXPIRED, ACCESS_TOKEN_EXPIRED, ACCESS_TOKEN_INVALID, ACCESS_TOKEN_MISSING, ACCESS_TOKEN_REVOKED
from controllers.auth_controller import auth_bp
from controllers.user_controller import user_bp
from controllers.app_controller import app_bp, start_background_task
from services.user_token_service import UserTokenService
from services.user_service import UserService
from services.container_registry import create_container


def create_app():
    # Initialise configuration and DI
    all_config = parse_config("config/config.yaml", loader=yaml.Loader)

    # Create services container singleton
    container = create_container(all_config["app"])

    result = start_background_task()

    if result != None:
        print(result)
        exit()

    app = Flask(__name__,
                static_url_path='',
                static_folder='web/static',
                template_folder='web/templates')

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(user_bp, url_prefix='/users')
    app.register_blueprint(app_bp, url_prefix='/app')

    app.config["JWT_COOKIE_SECURE"] = True
    app.config["JWT_SECRET_KEY"] = all_config["app"]["jwt_key"]

    # Initialise JWT
    jwt = JWTManager()
    jwt.init_app(app)

    # Initialise CORS
    CORS(app, resources={r"/auth/*": {"origins": "*"}})

    # Make sure there is at least one user who is the default admin user
    user_service = container.get(UserService)
    user_service.ensure_admin_user()

    # User injection
    @jwt.user_lookup_loader
    def inject_user(jwt_headers, jwt_data):
        user_name = jwt_data["sub"]

        if user_name is None:
            return None

        user = user_service.get_user(user_name=user_name)
        return user

    def create_error(message: str) -> list:
        error_model = [
            {
                "property": None,
                "errorMessage": message
            }
        ]

        return error_model

    # JWT claims
    @jwt.additional_claims_loader
    def inject_user_claims(identity):
        user = user_service.get_user(user_name=identity)
        if user and len(user["roles"]) > 0:
            return {"roles": user["roles"]}

        return None

    # JWT error handling
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify(create_error(ACCESS_TOKEN_EXPIRED)), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify(create_error(ACCESS_TOKEN_INVALID)), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify(create_error(ACCESS_TOKEN_MISSING)), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_data):
        return jsonify(create_error(ACCESS_TOKEN_REVOKED)), 401

    @jwt.token_in_blocklist_loader
    def check_token_revoked(jwt_header, jwt_data):
        user_token_service = container.get(UserTokenService)

        jti = jwt_data["jti"]
        type = jwt_data["type"]

        user_token = None
        if type == "access":
            user_token = user_token_service.getByAccessJti(jti)
        elif type == "refresh":
            user_token = user_token_service.getByRefreshJti(jti)

        # The user token is revoked if there is no user token
        return user_token is None

    return app


if __name__ == "__main__":
    app = create_app()
    app.run()
