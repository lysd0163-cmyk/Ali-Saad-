# Ali-Saad-

Platform foundation for the institutional trading system.

## Phase 0 — System Architecture

This repository starts with the base structure required for:
- project organization
- configuration management
- logging
- plugin loading
- strategy management

## Layout

- `src/ali_saad/core/` — core services
- `src/ali_saad/modules/` — domain modules
- `src/ali_saad/plugins/` — plugin contracts and loaders
- `config/` — runtime configuration
- `storage/` — charts, OHLC, logs, reports, cache
- `tests/` — validation and smoke tests

## Next step

Phase 0.2 will expand the Strategy Manager into a complete strategy registry, parser, and validator.
