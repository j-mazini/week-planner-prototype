#!/usr/bin/env bash
# =============================================================================
# scripts/setup-runner.sh — logix-sphere-frontend-nextjs
# -----------------------------------------------------------------------------
# Prepara uma VM (DEV ou PROD) para hospedar o self-hosted GitHub Actions runner
# consumido por .github/workflows/cd.yml + deploy-reusable.yml:
#   - Node 22 instalado system-wide (nao via nvm em profile de shell)
#   - PM2 instalado globalmente
#   - rsync, curl e gh CLI disponiveis
#   - usuario de servico dedicado `gh-runner-frontend` e grupo compartilhado
#     `deploy` com acesso a /var/www
#
# ⚠️ USUARIO SEPARADO DO BACKEND: se esta VM tambem hospeda o runner do backend
# (usuario `gh-runner`), o frontend PRECISA de um usuario proprio
# (`gh-runner-frontend`). Cada usuario tem seu proprio daemon PM2 e seu proprio
# diretorio _work do actions-runner; compartilhar o mesmo usuario faria os
# processos PM2 de front e back colidirem (mesma lista `pm2 list`, mesmo dump).
#
# NAO faz: download/registro do binario do actions-runner (config.sh --token),
# criacao do servico systemd do runner, nem concessao de sudo. O token de
# registro tem TTL curto (~60 min) e deve ser obtido manualmente — ver
# docs/RUNNERS.md para o passo a passo completo (registro, verificacao e
# remocao/re-registro).
#
# Idempotente: pode ser executado novamente sem duplicar/alterar estado ja
# correto.
#
# Uso:
#   sudo ./scripts/setup-runner.sh --env dev
#   sudo ./scripts/setup-runner.sh --env prod
#
# Pressupoe VM Debian/Ubuntu (apt-get). Ajuste a secao de instalacao de
# pacotes se o alvo for outra distro.
# =============================================================================

set -euo pipefail

NODE_MAJOR=22
RUNNER_USER="gh-runner-frontend"
DEPLOY_GROUP="deploy"

usage() {
  echo "Uso: sudo $0 --env dev|prod" >&2
  exit 1
}

ENVIRONMENT=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --env)
      ENVIRONMENT="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      ;;
    *)
      echo "Argumento desconhecido: $1" >&2
      usage
      ;;
  esac
done

case "$ENVIRONMENT" in
  dev)
    DEPLOY_BASE="/var/www/logix-sphere-frontend-nextjs"
    ;;
  prod)
    DEPLOY_BASE="/var/www/logix-sphere-frontend-nextjs-prod"
    ;;
  *)
    usage
    ;;
esac

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Este script precisa rodar como root (use sudo)." >&2
  exit 1
fi

log() { echo "[setup-runner:${ENVIRONMENT}] $*"; }

# -----------------------------------------------------------------------------
# 1. Node 22 (system-wide — visivel para a sessao systemd do runner sem PATH
#    de nvm/shell profile)
# -----------------------------------------------------------------------------
if command -v node >/dev/null 2>&1 && node -v | grep -q "^v${NODE_MAJOR}\."; then
  log "Node $(node -v) já instalado."
else
  log "Instalando Node ${NODE_MAJOR}.x via NodeSource..."
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

# -----------------------------------------------------------------------------
# 2. PM2 (global — precisa estar resolvivel no PATH configurado na unit
#    systemd do runner via Environment=PATH=..., nao apenas no shell
#    interativo)
# -----------------------------------------------------------------------------
if command -v pm2 >/dev/null 2>&1; then
  log "PM2 $(pm2 -v) já instalado."
else
  log "Instalando PM2 globalmente..."
  npm install -g pm2
fi
PM2_BIN_DIR="$(dirname "$(command -v pm2)")"
log "PM2 em ${PM2_BIN_DIR} — use este caminho no Environment=PATH= da unit systemd do runner (ver docs/RUNNERS.md)."

# -----------------------------------------------------------------------------
# 3. rsync, curl, gh CLI
# -----------------------------------------------------------------------------
log "Garantindo rsync/curl..."
apt-get update -y
apt-get install -y rsync curl

if command -v gh >/dev/null 2>&1; then
  log "gh CLI $(gh --version | head -n1) já instalado."
else
  log "Instalando gh CLI a partir do repositório oficial do GitHub..."
  install -d -m 0755 /etc/apt/keyrings
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
    -o /etc/apt/keyrings/githubcli-archive-keyring.gpg
  chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    > /etc/apt/sources.list.d/github-cli.list
  apt-get update -y
  apt-get install -y gh
fi

# -----------------------------------------------------------------------------
# 4. Usuário dedicado do runner + grupo compartilhado de deploy
# -----------------------------------------------------------------------------
if getent group "$DEPLOY_GROUP" >/dev/null; then
  log "Grupo '${DEPLOY_GROUP}' já existe."
else
  log "Criando grupo '${DEPLOY_GROUP}'..."
  groupadd "$DEPLOY_GROUP"
fi

if id "$RUNNER_USER" >/dev/null 2>&1; then
  log "Usuário '${RUNNER_USER}' já existe."
else
  log "Criando usuário de serviço dedicado '${RUNNER_USER}'..."
  useradd --create-home --shell /bin/bash --gid "$DEPLOY_GROUP" "$RUNNER_USER"
fi
usermod -aG "$DEPLOY_GROUP" "$RUNNER_USER"

# -----------------------------------------------------------------------------
# 5. Permissões em /var/www (grupo compartilhado + setgid — nunca chmod 777)
# -----------------------------------------------------------------------------
log "Preparando ${DEPLOY_BASE} (grupo '${DEPLOY_GROUP}', setgid, sem acesso de outros)..."
mkdir -p "$DEPLOY_BASE"
chgrp -R "$DEPLOY_GROUP" "$DEPLOY_BASE"
chmod -R g+rwX "$DEPLOY_BASE"
find "$DEPLOY_BASE" -type d -exec chmod g+s {} +

log "Setup de ambiente concluído para '${ENVIRONMENT}'."
log "Nenhuma regra de sudo foi criada: deploy-reusable.yml não executa nenhum comando"
log "'sudo' hoje (pm2 reload/start roda com o próprio daemon do usuário '${RUNNER_USER}')."
log "Se um passo futuro precisar de privilégio (ex.: reload do nginx), adicione uma regra"
log "estreita em /etc/sudoers.d/ para esse comando específico — nunca NOPASSWD: ALL."
log ""
log "Próximo passo: registrar o runner como serviço systemd (token manual, TTL curto)."
log "Ver docs/RUNNERS.md."
