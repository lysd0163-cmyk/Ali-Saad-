# Phase 0 — System Architecture

## 0.1 Project Structure

The repository is organized around a core bootstrap layer, reusable domain modules, plugin support, runtime configuration, and persistent storage.

## 0.2 Strategy Manager

The Strategy Manager is responsible for:
- importing strategy files
- validating structure
- storing active and historical strategies
- exposing the active strategy to future engines

## Growth Path

Later phases will add market data ingestion, analysis engines, reporting, monitoring, execution, and backtesting without changing the base architecture.
