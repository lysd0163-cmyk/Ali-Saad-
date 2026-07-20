class AliSaadError(Exception):
    """Base exception for the platform."""


class ConfigurationError(AliSaadError):
    """Raised when configuration cannot be loaded or validated."""


class PluginError(AliSaadError):
    """Raised when plugin loading fails."""


class StrategyError(AliSaadError):
    """Raised when strategy loading or validation fails."""
