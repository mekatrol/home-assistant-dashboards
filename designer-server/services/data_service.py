from typing import Annotated
from pysondb import db
from wireup import Inject, service
from filelock import BaseFileLock, Timeout, SoftFileLock
from config.config import DataFileConfig
from services.base import BaseService


@service
class DataService(BaseService):
    __users_db: db.JsonDatabase
    __user_tokens_db: db.JsonDatabase
    __user_security_roles_db: db.JsonDatabase
    __points_db: db.JsonDatabase
    __lock: BaseFileLock

    def __init__(self, lock_file: Annotated[str, Inject(param="lock_file")], data_files: Annotated[DataFileConfig, Inject(param="data_files")]):
        super().__init__()

        self.__lock = SoftFileLock(lock_file)

        try:
            # Try and get the app lock without blocking
            with self.__lock.acquire(timeout=1):

                users_data_file = data_files.get("users_data_file")
                user_tokens_data_file = data_files.get(
                    "user_tokens_data_file")
                user_security_roles_data_file = data_files.get(
                    "user_security_roles_data_file")
                points_data_file = data_files.get("points_data_file")

                if users_data_file is None:
                    raise Exception(
                        "'users_data_file' setting missing from configuration file")

                if user_tokens_data_file is None:
                    raise Exception(
                        "'user_tokens_data_file' setting missing from configuration file")

                if user_security_roles_data_file is None:
                    raise Exception(
                        "'user_security_roles_data_file' setting missing from configuration file")

                if points_data_file is None:
                    raise Exception(
                        "'points_data_file' setting missing from configuration file")

                self.__users_db = db.getDb(users_data_file)
                self.__user_tokens_db = db.getDb(user_tokens_data_file)
                self.__user_security_roles_db = db.getDb(
                    user_security_roles_data_file)
                self.__points_db = db.getDb(points_data_file)
        except Timeout:
            raise Exception(
                f"Unable to acquire the application lock file: '{lock_file}'. If you are sure no instances are running then you can safely delete this lock file and re run the application. This can happen if the application crashed previously, or the app was forcibly terminated.")

    def __enter__(self):
        self.__lock.acquire(timeout=1)
        return self

    def __exit__(self, exc_type, exc_value, traceback):
        self.__lock.release()
        return True

    def get_users_db(self) -> db.JsonDatabase:
        return self.__users_db

    def get_user_tokens_db(self) -> db.JsonDatabase:
        return self.__user_tokens_db

    def get_user_security_roles_db(self) -> db.JsonDatabase:
        return self.__user_security_roles_db

    def get_points_db(self) -> db.JsonDatabase:
        return self.__points_db
