# api/container_registry.py

from wireup import create_sync_container, AsyncContainer
from services.user_service import UserService, UserTokenService
from services.data_service import DataService
from services.user_mapper_service import UserMapperService
from services.dashboard_service import DashboardService


# Services container global singleton
_container: AsyncContainer | None = None


def create_container(config: dict) -> AsyncContainer:
    global _container

    _container = create_sync_container(
        parameters=config, services=[
            UserService,
            UserTokenService,
            DataService,
            UserMapperService,
            DashboardService])
    
    return _container


def get_container():
    if _container is None:
        raise RuntimeError(
            "Container not initialized — call create_container() first")
    return _container
