from dataclasses import dataclass


@dataclass(frozen=True)
class DataFileConfig:
    users_data_file: str
    user_tokens_data_file: str
    user_security_roles_data_file: str
    points_data_file: str


@dataclass(frozen=True)
class AppConfig:
    lock_file: str
    jwt_key: str
    jwt_refresh_token_expiry_mins: int
    data_files: DataFileConfig
