from typing import Optional
import yaml
from pathlib import Path
from collections.abc import Mapping


def deep_merge(base: dict, override: dict) -> dict:
    # Recursively merge two dictionaries
    for key, value in override.items():
        if (
            key in base
            and isinstance(base[key], dict)
            and isinstance(value, Mapping)
        ):
            base[key] = deep_merge(base[key], value)
        else:
            base[key] = value
    return base


def load_yaml_config(config_name: str, local_config_name: Optional[str] = None) -> dict:
    config_path = Path(config_name)
    if config_path.exists():
        with config_path.open("r") as f:
            config = yaml.safe_load(f) or {}

    if local_config_name is not None:
        local_path = Path(local_config_name)
        if local_path.exists():
            with local_path.open("r") as f:
                local_config = yaml.safe_load(f) or {}
            config = deep_merge(config, local_config)

    return config
