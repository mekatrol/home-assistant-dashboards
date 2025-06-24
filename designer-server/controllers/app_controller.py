import atexit
import os
from time import sleep
import threading
import re

from flask import Blueprint, jsonify, current_app, Response, request, abort
from flask_jwt_extended import jwt_required

from services.configuration_service import ConfigurationService
from services.container_registry import get_container
from services.user_service import ForbiddenException

app_bp = Blueprint("app", __name__)

# This controls the background task running state
background_tasks_thread_event = threading.Event()


def background_task():
    while background_tasks_thread_event.is_set():
        print("Background task tick...")
        sleep(5)


def stop_background_task():
    try:
        background_tasks_thread_event.clear()

        print("Background task stopped!")
    except Exception as error:
        print(str(error))


def start_background_task():
    try:
        atexit.register(stop_background_task)

        background_tasks_thread_event.set()

        thread = threading.Thread(target=background_task)
        thread.start()

        return None
    except Exception as error:
        return str(error)


# Default route for static content
@app_bp.get("/")
@app_bp.get('/dashboard/', defaults={'path': ''})
@app_bp.get('/dashboard/<path:path>')
def index(path: str | None = None):
    # Get the host and port from the request
    host = request.host  # e.g., '127.0.0.1:5000'

    # Path to the static index.html file
    index_path = current_app.static_folder + '/index.html'

    if not os.path.exists(index_path):
        return "index.html not found", 404

    # Read file index.html content
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace API base URL
    content = re.sub(
        r'(<input\s+[^>]*id="api-base-url"[^>]*value=")[^"]*(")',
        fr'\1http://{host}\2',
        content
    )

    # Replace WebSocket base URL
    container = get_container()
    config_service: ConfigurationService = container.get(ConfigurationService)
    home_assistant_url = config_service.get(
        "home_assistant_url", "http://homeassistant.local:8123")

    content = re.sub(
        r'(<input\s+[^>]*id="ws-base-url"[^>]*value=")[^"]*(")',
        fr'\1{home_assistant_url}\2',
        content
    )

    # Return modified HTML content
    return Response(content, mimetype='text/html')


@app_bp.get("/components/<path:sub_path>")
def components(sub_path: str):
    # Component base directory
    base_dir = os.path.normpath(os.path.join(
        current_app.static_folder, "components"))

    # Normalize full path
    component_file_path = os.path.normpath(os.path.join(base_dir, sub_path))

    # Prevent path traversal
    if not component_file_path.startswith(base_dir):
        abort(404, f"Invalid component file '{component_file_path}'")

    # Default to fallback if file doesn't exist
    if not os.path.exists(component_file_path):
        component_file_path = os.path.normpath(
            os.path.join(base_dir, "cwc-default-web-component.js"))

    # Default to fallback if file doesn't exist
    if not os.path.exists(component_file_path):
        abort(404, f"Invalid component file '{component_file_path}'")

    # Serve file as JS
    with open(component_file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Convert to PascalCase for the class name
    def to_pascal_case(s: str) -> str:
        return ''.join(word.capitalize() for word in re.split(r"[\W_]+", s))

    # Convert to kebab-case for the element name
    def to_kebab_case(s: str) -> str:
        return re.sub(r'[_\s]+', '-', re.sub(r'([a-z])([A-Z])', r'\1-\2', s)).lower()

    class_name = f"Cwc{to_pascal_case(sub_path)}"
    element_name = f"cwc-{to_kebab_case(sub_path)}"

    content = re.sub(r"\bCwcDefaultWebComponent\b", class_name, content)
    content = re.sub(r"\bcwc-default-web-component\b", element_name, content)

    return Response(content, mimetype='application/javascript')


@app_bp.get("/start")
@jwt_required()
def start_app():
    try:
        # Start background task
        start_background_task()

        return jsonify({"message": "Background task started"}), 200
    except ForbiddenException:
        return jsonify({"message": "you are not permitted"}), 403


@app_bp.get("/stop")
@jwt_required()
def stop_app():
    try:
        # Stop background task
        stop_background_task()

        return jsonify({"message": "Background task stopped"}), 200
    except ForbiddenException:
        return jsonify({"message": "you are not permitted"}), 403


@app_bp.get("/ping")
def ping():
    return jsonify({"ping": "pong"}), 200
