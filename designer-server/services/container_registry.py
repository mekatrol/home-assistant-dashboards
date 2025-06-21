# api/container_registry.py

from wireup import create_sync_container, SyncContainer
from services.configuration_service import ConfigurationService
from services.user_service import UserService, UserTokenService
from services.data_service import DataService
from services.user_mapper_service import UserMapperService
from services.dashboard_service import DashboardService


# Services container global singleton
_container: SyncContainer | None = None


def create_container(config: dict) -> SyncContainer:
    global _container

    _container = create_sync_container(
        parameters=config, services=[
            UserService,
            UserTokenService,
            DataService,
            UserMapperService,
            DashboardService,
            ConfigurationService])

    return _container


def get_container():
    if _container is None:
        raise RuntimeError(
            "Container not initialized — call create_container() first")
    return _container
