from ali_saad.core.config import AppConfig


def test_app_config_defaults() -> None:
    config = AppConfig(data={})
    assert config.app_name == "Ali-Saad-"
    assert config.minimum_candles == 500
