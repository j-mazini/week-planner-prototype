#!/usr/bin/env bash
# =============================================================================
# scripts/setup-environments.sh — logix-sphere-frontend-nextjs
# -----------------------------------------------------------------------------
# Cria/atualiza os GitHub Environments consumidos pela esteira, de forma
# IDEMPOTENTE, usando o gh CLI autenticado. O FRONTEND usa QUATRO Environments
# (diferente do backend, que usa dois), porque o `next build` inlina as
# variaveis NEXT_PUBLIC_* no bundle e o CI precisa carrega-las por ambiente:
#
#   build-development : lido pelo ci.yml (job `package`). Guarda as `vars`
#                       NEXT_PUBLIC_* de HOMOLOGACAO. Sem gate.
#   build-production  : lido pelo ci.yml (job `package`). Guarda as `vars`
#                       NEXT_PUBLIC_* de PRODUCAO. Sem gate.
#   development       : lido pelo cd.yml. Deploy automatico ao mergear
#                       `development`. Sem gate.
#   production        : lido pelo cd.yml. Deploy ao mergear `production`,
#                       COM required reviewers (gate de aprovacao).
#
# ⚠️ Os Environments `build-*` sao SEPARADOS de propriedade dos de deploy: se o
# job de build usasse o Environment `production` (que tem required reviewers),
# o CI ficaria parado esperando aprovacao. O gate pertence ao deploy, nao ao
# build. Ver docs/CD-FRONTEND.md.
#
# ⚠️ NEXT_PUBLIC_* sao `vars`, NAO `secrets`: terminam no bundle e sao visiveis
# no navegador — secret so poluiria o log com *** sem esconder nada.
#
# Cada Environment recebe uma deployment branch policy que restringe o uso a
# exatamente uma branch (development / production), espelhando os gatilhos dos
# workflows.
#
# NAO cadastra secrets de deploy: o CD baixa o artefato com o GITHUB_TOKEN
# automatico e le logs/credenciais do shared/ na VM. Se, no futuro, algum passo
# exigir secret de ambiente, adicione com:
#   gh secret set NOME --env production --repo <owner/repo>
#
# Pre-requisitos:
#   - gh CLI instalado e autenticado (`gh auth status`) com permissao de ADMIN
#     no repositorio (necessaria para gerenciar Environments).
#   - jq instalado.
#
# Uso:
#   scripts/setup-environments.sh \
#     --repo LogixSphere/logix-sphere-frontend-nextjs \
#     --prod-reviewers user:fulano,team:plataforma \
#     --dev-api-url  https://homol.logixsphere.com/api \
#     --prod-api-url https://logixsphere.com/api
#
# Flags:
#   --repo <owner/repo>       Obrigatorio. Ex.: LogixSphere/logix-sphere-frontend-nextjs
#   --dev-branch <nome>       Branch de DEV.  Default: development
#   --prod-branch <nome>      Branch de PROD. Default: production
#   --prod-reviewers <lista>  Revisores do gate de PROD, separados por virgula.
#                             Cada item: user:<login> ou team:<slug>.
#                             Ex.: user:ivanilton,team:plataforma
#                             (Recomendado: pelo menos 1. Sem isso o PROD fica
#                             SEM gate — o script avisa e pede confirmacao.)
#   --wait-timer <min>        Espera obrigatoria antes do deploy PROD, em
#                             minutos (0–43200). Default: 0.
#
#   VARIAVEIS DE BUILD (setadas como `vars` nos Environments build-*):
#   --dev-api-url <url>          NEXT_PUBLIC_API_URL de HOMOL.
#                                Default: https://homol.logixsphere.com/api
#   --prod-api-url <url>         NEXT_PUBLIC_API_URL de PROD.
#                                Default: https://logixsphere.com/api
#   --dev-api-base-url <url>     NEXT_PUBLIC_API_BASE_URL de HOMOL (opcional).
#   --prod-api-base-url <url>    NEXT_PUBLIC_API_BASE_URL de PROD (opcional).
#   --dev-chat <val>            NEXT_PUBLIC_CHAT de HOMOL (opcional).
#   --prod-chat <val>           NEXT_PUBLIC_CHAT de PROD (opcional).
#   --dev-chat-socket-url <url>  NEXT_PUBLIC_CHAT_SOCKET_URL de HOMOL (opcional).
#   --prod-chat-socket-url <url> NEXT_PUBLIC_CHAT_SOCKET_URL de PROD (opcional).
#                                (Vars nao informadas sao puladas, nao apagadas.)
#
#   --dry-run                 Mostra o que faria, sem chamar a API de escrita.
#   -h | --help
#
# Reexecutar e seguro: PUT no environment sobrescreve a config para o estado
# desejado; branch policies existentes com o mesmo nome nao sao duplicadas;
# `gh variable set` sobrescreve o valor atual da var.
# =============================================================================

set -euo pipefail

REPO=""
DEV_BRANCH="development"
PROD_BRANCH="production"
PROD_REVIEWERS=""
WAIT_TIMER="0"
DRY_RUN="false"

# Variaveis de build (NEXT_PUBLIC_*) por ambiente. API_URL tem default
# documentado; as demais so sao setadas se informadas.
DEV_API_URL="https://homol.logixsphere.com/api"
PROD_API_URL="https://logixsphere.com/api"
DEV_API_BASE_URL=""
PROD_API_BASE_URL=""
DEV_CHAT=""
PROD_CHAT=""
DEV_CHAT_SOCKET_URL=""
PROD_CHAT_SOCKET_URL=""

usage() { sed -n '2,90p' "$0" | sed 's/^# \{0,1\}//'; exit "${1:-0}"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --repo)                 REPO="${2:-}"; shift 2 ;;
    --dev-branch)           DEV_BRANCH="${2:-}"; shift 2 ;;
    --prod-branch)          PROD_BRANCH="${2:-}"; shift 2 ;;
    --prod-reviewers)       PROD_REVIEWERS="${2:-}"; shift 2 ;;
    --wait-timer)           WAIT_TIMER="${2:-}"; shift 2 ;;
    --dev-api-url)          DEV_API_URL="${2:-}"; shift 2 ;;
    --prod-api-url)         PROD_API_URL="${2:-}"; shift 2 ;;
    --dev-api-base-url)     DEV_API_BASE_URL="${2:-}"; shift 2 ;;
    --prod-api-base-url)    PROD_API_BASE_URL="${2:-}"; shift 2 ;;
    --dev-chat)             DEV_CHAT="${2:-}"; shift 2 ;;
    --prod-chat)            PROD_CHAT="${2:-}"; shift 2 ;;
    --dev-chat-socket-url)  DEV_CHAT_SOCKET_URL="${2:-}"; shift 2 ;;
    --prod-chat-socket-url) PROD_CHAT_SOCKET_URL="${2:-}"; shift 2 ;;
    --dry-run)              DRY_RUN="true"; shift ;;
    -h|--help)              usage 0 ;;
    *) echo "Argumento desconhecido: $1" >&2; usage 1 ;;
  esac
done

# --------------------------------------------------------------------------
# Validacoes de ambiente
# --------------------------------------------------------------------------
command -v gh >/dev/null 2>&1 || { echo "❌ gh CLI nao encontrado. Instale: https://cli.github.com" >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq nao encontrado. Instale o jq." >&2; exit 1; }
[[ -n "$REPO" ]] || { echo "❌ --repo e obrigatorio (ex.: LogixSphere/logix-sphere-backend)." >&2; usage 1; }

if ! gh auth status >/dev/null 2>&1; then
  echo "❌ gh nao esta autenticado. Rode 'gh auth login' primeiro." >&2
  exit 1
fi

OWNER="${REPO%%/*}"
NAME="${REPO#*/}"
[[ "$OWNER" != "$REPO" && -n "$NAME" ]] || { echo "❌ --repo deve ser no formato owner/repo." >&2; exit 1; }

# Confirma acesso de admin (Environments exigem admin).
PERM="$(gh api "repos/$REPO" --jq '.permissions.admin' 2>/dev/null || echo "false")"
if [[ "$PERM" != "true" ]]; then
  echo "❌ Voce nao tem permissao de ADMIN em $REPO (necessaria para gerenciar Environments)." >&2
  echo "   gh api repos/$REPO --jq .permissions  → confira suas permissoes." >&2
  exit 1
fi

# Escreve em STDERR de proposito: resolve_reviewers_json tem seu stdout capturado
# por $(...), entao logs em stdout contaminariam o JSON retornado.
log()  { echo "[setup-env] $*" >&2; }
run()  { if [[ "$DRY_RUN" == "true" ]]; then echo "  [dry-run] $*"; else eval "$@"; fi; }

# --------------------------------------------------------------------------
# Resolve a lista de revisores (user:<login> | team:<slug>) em objetos
# {type,id} exigidos pela API de Environments.
# --------------------------------------------------------------------------
resolve_reviewers_json() {
  local list="$1" out="[]" token kind ref id
  IFS=',' read -r -a items <<< "$list"
  for token in "${items[@]}"; do
    token="$(echo "$token" | xargs)"   # trim
    [[ -z "$token" ]] && continue
    kind="${token%%:*}"
    ref="${token#*:}"
    case "$kind" in
      me|@me)
        id="$(gh api user --jq '.id' 2>/dev/null | tr -d '[:space:]' || true)"
        [[ "$id" =~ ^[0-9]+$ ]] || { echo "❌ Nao consegui resolver o usuario autenticado. Rode 'gh auth status'." >&2; exit 1; }
        out="$(jq -c --argjson id "$id" '. + [{"type":"User","id":$id}]' <<< "$out")"
        ;;
      user)
        id="$(gh api "users/$ref" --jq '.id' 2>/dev/null | tr -d '[:space:]' || true)"
        [[ "$id" =~ ^[0-9]+$ ]] || { echo "❌ Usuario nao encontrado no GitHub: '$ref'. Use seu login real (ex.: user:ivaniltonneto)." >&2; exit 1; }
        out="$(jq -c --argjson id "$id" '. + [{"type":"User","id":$id}]' <<< "$out")"
        ;;
      team)
        id="$(gh api "orgs/$OWNER/teams/$ref" --jq '.id' 2>/dev/null | tr -d '[:space:]' || true)"
        [[ "$id" =~ ^[0-9]+$ ]] || { echo "❌ Time nao encontrado em $OWNER: '$ref'. Use o slug real do time." >&2; exit 1; }
        out="$(jq -c --argjson id "$id" '. + [{"type":"Team","id":$id}]' <<< "$out")"
        ;;
      *)
        echo "❌ Revisor invalido '$token'. Use user:<login> ou team:<slug>." >&2
        exit 1
        ;;
    esac
    log "revisor resolvido: $token → id $id"
  done
  echo "$out"
}

# Sinaliza que o required reviewers foi recusado pelo plano (ver resumo final).
REVIEWERS_UNSUPPORTED=0

# --------------------------------------------------------------------------
# Cria/atualiza um Environment com branch policy restrita a uma unica branch.
#   $1 = nome do environment ; $2 = branch permitida ; $3 = reviewers JSON
#   $4 = wait_timer (minutos; so incluido quando > 0)
#
# As protection rules sao aplicadas em DUAS chamadas de proposito:
#   1) base: deployment_branch_policy (+ wait_timer se > 0) — funciona no Team.
#   2) reviewers: required reviewers — em repo PRIVADO exige GitHub Enterprise;
#      no Team retorna 422 (billing). Se falhar, avisamos e seguimos, sem
#      perder a config base ja aplicada no passo 1.
# --------------------------------------------------------------------------
upsert_environment() {
  local env="$1" branch="$2" reviewers="$3" wait_timer="${4:-0}"

  log "Configurando environment '$env' (branch permitida: $branch)…"

  # 1) Corpo base (sem reviewers) — sempre aceito no plano Team.
  local base_body
  base_body="$(jq -n --argjson wait "$wait_timer" '
    {
      deployment_branch_policy: { protected_branches: false, custom_branch_policies: true }
    } + (if $wait > 0 then { wait_timer: $wait } else {} end)')"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [dry-run] PUT (base) repos/$REPO/environments/$env"
    echo "$base_body" | jq .
  else
    echo "$base_body" | gh api -X PUT "repos/$REPO/environments/$env" --input - >/dev/null
    log "environment '$env' criado/atualizado (branch policy aplicada)."
  fi

  # 2) Required reviewers (opcional) — re-inclui a config base para nao perde-la.
  if [[ "$reviewers" != "[]" ]]; then
    local rev_body err
    rev_body="$(jq -n --argjson reviewers "$reviewers" --argjson wait "$wait_timer" '
      {
        reviewers: $reviewers,
        deployment_branch_policy: { protected_branches: false, custom_branch_policies: true }
      } + (if $wait > 0 then { wait_timer: $wait } else {} end)')"

    if [[ "$DRY_RUN" == "true" ]]; then
      echo "  [dry-run] PUT (reviewers) repos/$REPO/environments/$env"
      echo "$rev_body" | jq .
    elif err="$(echo "$rev_body" | gh api -X PUT "repos/$REPO/environments/$env" --input - 2>&1 >/dev/null)"; then
      log "required reviewers aplicado em '$env'."
    elif grep -qi "billing plan" <<< "$err"; then
      REVIEWERS_UNSUPPORTED=1
      log "⚠️  required reviewers NAO aplicado em '$env': o plano nao suporta essa"
      log "    protection rule em repo privado (precisa de GitHub Enterprise)."
      log "    Use o gate por branch protection — ver scripts/setup-branch-protection.sh."
    else
      echo "❌ Falha ao aplicar reviewers em '$env':" >&2
      echo "$err" >&2
      exit 1
    fi
  fi

  # 3) Branch policy nomeada: garante UMA policy com o nome da branch alvo.
  local existing
  existing="$(gh api "repos/$REPO/environments/$env/deployment-branch-policies" \
                --jq '.branch_policies[].name' 2>/dev/null || true)"
  if grep -Fxq "$branch" <<< "$existing"; then
    log "branch policy '$branch' ja existe em '$env'."
  else
    run "gh api -X POST \"repos/$REPO/environments/$env/deployment-branch-policies\" -f name='$branch' >/dev/null"
    log "branch policy '$branch' adicionada em '$env'."
  fi
}

# --------------------------------------------------------------------------
# Seta uma `var` de repositorio no escopo de um Environment (idempotente:
# `gh variable set` cria ou sobrescreve). Vars vazias sao PULADAS — nunca
# apagamos uma var existente so porque a flag nao foi passada nesta execucao.
#   $1 = environment ; $2 = nome da var ; $3 = valor
# --------------------------------------------------------------------------
set_variable() {
  local env="$1" name="$2" value="$3"
  if [[ -z "$value" ]]; then
    log "  var $name em '$env' nao informada — pulando."
    return 0
  fi
  if [[ "$DRY_RUN" == "true" ]]; then
    echo "  [dry-run] gh variable set $name --env $env --repo $REPO --body '$value'"
  else
    gh variable set "$name" --env "$env" --repo "$REPO" --body "$value" >/dev/null
    log "  var $name setada em '$env'."
  fi
}

# --------------------------------------------------------------------------
# Cria/atualiza um Environment de BUILD (sem gate, branch policy = $2) e
# popula as vars NEXT_PUBLIC_* passadas.
#   $1=env $2=branch $3=api_url $4=api_base_url $5=chat $6=chat_socket_url
# --------------------------------------------------------------------------
setup_build_environment() {
  local env="$1" branch="$2" api_url="$3" api_base="$4" chat="$5" socket="$6"
  upsert_environment "$env" "$branch" "[]" "0"
  set_variable "$env" "NEXT_PUBLIC_API_URL"         "$api_url"
  set_variable "$env" "NEXT_PUBLIC_API_BASE_URL"    "$api_base"
  set_variable "$env" "NEXT_PUBLIC_CHAT"            "$chat"
  set_variable "$env" "NEXT_PUBLIC_CHAT_SOCKET_URL" "$socket"
}

# --------------------------------------------------------------------------
# Execucao
# --------------------------------------------------------------------------
log "Repositorio: $REPO"
log "CI   → environments 'build-development' / 'build-production' (vars NEXT_PUBLIC_*)"
log "DEV  → environment 'development' (branch: $DEV_BRANCH, sem gate)"
log "PROD → environment 'production'  (branch: $PROD_BRANCH, com gate)"
[[ "$DRY_RUN" == "true" ]] && log "MODO DRY-RUN: nenhuma escrita sera feita."

# build-*: lidos pelo ci.yml (job package). Guardam as vars de build por ambiente.
setup_build_environment "build-development" "$DEV_BRANCH" \
  "$DEV_API_URL" "$DEV_API_BASE_URL" "$DEV_CHAT" "$DEV_CHAT_SOCKET_URL"
setup_build_environment "build-production" "$PROD_BRANCH" \
  "$PROD_API_URL" "$PROD_API_BASE_URL" "$PROD_CHAT" "$PROD_CHAT_SOCKET_URL"

# development: sem reviewers.
upsert_environment "development" "$DEV_BRANCH" "[]" "0"

# production: com reviewers (gate).
PROD_REVIEWERS_JSON="[]"
if [[ -n "$PROD_REVIEWERS" ]]; then
  PROD_REVIEWERS_JSON="$(resolve_reviewers_json "$PROD_REVIEWERS")"
else
  echo "⚠️  Nenhum --prod-reviewers informado: o environment 'production' ficara SEM gate de aprovacao."
  read -r -p "    Continuar mesmo assim? [y/N] " ans
  [[ "${ans,,}" == "y" ]] || { echo "Abortado."; exit 1; }
fi
upsert_environment "production" "$PROD_BRANCH" "$PROD_REVIEWERS_JSON" "$WAIT_TIMER"

echo
log "✅ Environments configurados. Confira em: https://github.com/$REPO/settings/environments"
log "   build-development / build-production (vars NEXT_PUBLIC_*), development, production."
log "   'development' → branch policy '$DEV_BRANCH'; 'production' → branch policy '$PROD_BRANCH'."
log "   Vars de build: confira em .../settings/variables/actions (escopo Environment)."
if [[ "$REVIEWERS_UNSUPPORTED" == "1" ]]; then
  echo
  log "⚠️  GATE DE APROVACAO PENDENTE: o required reviewers do Environment nao e suportado"
  log "    neste plano (repo privado no Team). Aplique o gate por branch protection:"
  log "        bash scripts/setup-branch-protection.sh --repo $REPO --reviewers 1"
  log "    Isso exige PR aprovado para entrar em '$PROD_BRANCH' — como o deploy dispara no"
  log "    merge, o PR revisado passa a ser o gate de producao (corrige P10)."
fi
