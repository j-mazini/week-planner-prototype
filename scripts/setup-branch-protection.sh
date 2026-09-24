#!/usr/bin/env bash
# =============================================================================
# scripts/setup-branch-protection.sh — logix-sphere-frontend-nextjs
# -----------------------------------------------------------------------------
# Cria/atualiza um REPOSITORY RULESET que exige Pull Request aprovado para
# entrar nas branches de deploy (production e, opcionalmente, development),
# IDEMPOTENTE, via gh CLI.
#
# POR QUE: o required reviewers do GitHub Environment nao e suportado em repo
# PRIVADO no plano Team (precisa de Enterprise). Como o CD dispara no *push*
# para `production` (que, pela politica do time, so acontece via merge de PR),
# exigir PR aprovado para essa branch se torna o gate de producao efetivo —
# corrige o P10 do ESTEIRA-CICD.md sem custo extra.
#
# O ruleset tambem bloqueia push direto e force-push/delete nessas branches,
# reforcando a politica "nada de push direto, tudo por PR".
#
# Pre-requisitos: gh CLI autenticado com ADMIN no repo; jq instalado.
#
# Uso:
#   scripts/setup-branch-protection.sh --repo LogixSphere/logix-sphere-frontend-nextjs
#   scripts/setup-branch-protection.sh --repo <owner/repo> --reviewers 1 \
#       --prod-branch production --dev-branch development --gate-dev
#
# Flags:
#   --repo <owner/repo>   Obrigatorio.
#   --prod-branch <nome>  Branch de producao. Default: production
#   --dev-branch <nome>   Branch de dev/homolog. Default: development
#   --reviewers <n>       Aprovacoes exigidas no PR de producao. Default: 1
#   --gate-dev            Tambem exige PR (0 aprovacoes) para a branch de dev,
#                         so bloqueando push direto. Default: nao.
#   --name <nome>         Nome do ruleset. Default: cd-deploy-gate
#   --dry-run             Mostra o payload sem escrever.
#   -h | --help
# =============================================================================

set -euo pipefail

REPO=""
PROD_BRANCH="production"
DEV_BRANCH="development"
REVIEWERS=1
GATE_DEV="false"
RULESET_NAME="cd-deploy-gate"
DRY_RUN="false"

usage() { sed -n '2,40p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)         REPO="${2:-}"; shift 2 ;;
    --prod-branch)  PROD_BRANCH="${2:-}"; shift 2 ;;
    --dev-branch)   DEV_BRANCH="${2:-}"; shift 2 ;;
    --reviewers)    REVIEWERS="${2:-}"; shift 2 ;;
    --gate-dev)     GATE_DEV="true"; shift ;;
    --name)         RULESET_NAME="${2:-}"; shift 2 ;;
    --dry-run)      DRY_RUN="true"; shift ;;
    -h|--help)      usage 0 ;;
    *) echo "Argumento desconhecido: $1" >&2; usage 1 ;;
  esac
done

command -v gh >/dev/null 2>&1 || { echo "❌ gh CLI nao encontrado." >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq nao encontrado." >&2; exit 1; }
[[ -n "$REPO" ]] || { echo "❌ --repo e obrigatorio." >&2; usage 1; }
[[ "$REVIEWERS" =~ ^[0-9]+$ ]] || { echo "❌ --reviewers deve ser inteiro." >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "❌ gh nao autenticado (gh auth login)." >&2; exit 1; }

PERM="$(gh api "repos/$REPO" --jq '.permissions.admin' 2>/dev/null || echo false)"
[[ "$PERM" == "true" ]] || { echo "❌ Precisa de admin em $REPO." >&2; exit 1; }

log() { echo "[branch-protect] $*" >&2; }

# Branches-alvo do ruleset.
INCLUDE_REFS="$(jq -n --arg p "refs/heads/$PROD_BRANCH" '[$p]')"
if [[ "$GATE_DEV" == "true" ]]; then
  INCLUDE_REFS="$(jq -n --arg p "refs/heads/$PROD_BRANCH" --arg d "refs/heads/$DEV_BRANCH" '[$p,$d]')"
fi

# Regras: exige PR (com N aprovacoes) + bloqueia force-push e delete.
# 'creation'/'update'/'deletion' sem bypass = sem push direto nessas branches.
PAYLOAD="$(jq -n \
  --arg name "$RULESET_NAME" \
  --argjson refs "$INCLUDE_REFS" \
  --argjson reviewers "$REVIEWERS" '
  {
    name: $name,
    target: "branch",
    enforcement: "active",
    conditions: { ref_name: { include: $refs, exclude: [] } },
    rules: [
      { type: "pull_request",
        parameters: {
          required_approving_review_count: $reviewers,
          dismiss_stale_reviews_on_push: true,
          require_code_owner_review: false,
          require_last_push_approval: false,
          required_review_thread_resolution: false
        } },
      { type: "non_fast_forward" },
      { type: "deletion" }
    ]
  }')"

log "Repositorio:      $REPO"
log "Ruleset:          $RULESET_NAME"
log "Branches no gate: $(jq -r 'join(", ")' <<< "$INCLUDE_REFS")"
log "Aprovacoes no PR: $REVIEWERS"

if [[ "$DRY_RUN" == "true" ]]; then
  echo "  [dry-run] payload do ruleset:"
  jq . <<< "$PAYLOAD"
  exit 0
fi

# Idempotencia: procura um ruleset com o mesmo nome; atualiza (PUT) ou cria (POST).
EXISTING_ID="$(gh api "repos/$REPO/rulesets" --jq \
  ".[] | select(.name==\"$RULESET_NAME\") | .id" 2>/dev/null | head -n1 || true)"

if [[ -n "$EXISTING_ID" ]]; then
  log "Ruleset '$RULESET_NAME' ja existe (id $EXISTING_ID) — atualizando."
  echo "$PAYLOAD" | gh api -X PUT "repos/$REPO/rulesets/$EXISTING_ID" --input - >/dev/null
else
  log "Criando ruleset '$RULESET_NAME'."
  echo "$PAYLOAD" | gh api -X POST "repos/$REPO/rulesets" --input - >/dev/null
fi

log "✅ Gate aplicado. Confira em: https://github.com/$REPO/settings/rules"
log "   A partir de agora, entrar em '$PROD_BRANCH' exige PR com $REVIEWERS aprovacao(oes)."
