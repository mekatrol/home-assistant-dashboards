from wireup import service
from config.config_helper import load_yaml_config
from services.base import BaseService


@service
class ConfigurationService(BaseService):
    def __getitem__(self, key):
        all_config = load_yaml_config(
            "config/config.yaml", "config/config.local.yaml")

        return all_config["app"][key]
