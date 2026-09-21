#!/bin/bash
# Prepara o ambiente da sessao do Claude Code na nuvem.
# Detecta a stack pelos manifestos presentes e instala as dependencias.
# Idempotente e nao-interativo: pode rodar quantas vezes for necessario.
set -euo pipefail

# Local (seu PC) nao precisa: voce mesmo gerencia o ambiente.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

log() { echo "[session-start] $*"; }

installed=0

# --- Node / JavaScript / TypeScript ---
if [ -f package.json ]; then
  installed=1
  if [ -f pnpm-lock.yaml ]; then
    log "pnpm detectado"
    command -v pnpm >/dev/null 2>&1 || npm install -g pnpm
    pnpm install
  elif [ -f yarn.lock ]; then
    log "yarn detectado"
    command -v yarn >/dev/null 2>&1 || npm install -g yarn
    yarn install
  elif [ -f bun.lockb ] || [ -f bun.lock ]; then
    log "bun detectado"
    bun install
  else
    log "npm detectado"
    npm install
  fi
fi

# --- Python ---
if [ -f pyproject.toml ] || [ -f requirements.txt ]; then
  installed=1
  if [ -f uv.lock ] || { [ -f pyproject.toml ] && grep -q '\[tool.uv\]' pyproject.toml 2>/dev/null; }; then
    log "uv detectado"
    command -v uv >/dev/null 2>&1 || pip install --quiet uv
    uv sync
  elif [ -f poetry.lock ] || grep -q '\[tool.poetry\]' pyproject.toml 2>/dev/null; then
    log "poetry detectado"
    command -v poetry >/dev/null 2>&1 || pip install --quiet poetry
    poetry install --no-interaction
  elif [ -f requirements.txt ]; then
    log "pip + requirements.txt detectado"
    pip install --quiet -r requirements.txt
  else
    log "pip + pyproject.toml detectado"
    pip install --quiet -e .
  fi
  echo 'export PYTHONPATH="."' >> "${CLAUDE_ENV_FILE:-/dev/null}"
fi

# --- Go ---
if [ -f go.mod ]; then
  installed=1
  log "go detectado"
  go mod download
fi

# --- Rust ---
if [ -f Cargo.toml ]; then
  installed=1
  log "cargo detectado"
  cargo fetch
fi

# --- Ruby ---
if [ -f Gemfile ]; then
  installed=1
  log "bundler detectado"
  bundle install
fi

# --- PHP ---
if [ -f composer.json ]; then
  installed=1
  log "composer detectado"
  composer install --no-interaction
fi

if [ "$installed" -eq 0 ]; then
  log "nenhum manifesto de dependencia encontrado - nada a instalar"
fi

log "ambiente pronto"
