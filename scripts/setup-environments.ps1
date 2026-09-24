<#
.SYNOPSIS
  Cria/atualiza os GitHub Environments da esteira do frontend via gh CLI.
  Versao PowerShell do scripts/setup-environments.sh (para rodar no Windows).

.DESCRIPTION
  O FRONTEND usa QUATRO Environments (diferente do backend, que usa dois),
  porque o `next build` inlina as NEXT_PUBLIC_* no bundle e o CI precisa
  carrega-las por ambiente:

    build-development : lido pelo ci.yml (job package). Vars NEXT_PUBLIC_* HOMOL.
    build-production  : lido pelo ci.yml (job package). Vars NEXT_PUBLIC_* PROD.
    development       : lido pelo cd.yml. Deploy ao mergear `development`. Sem gate.
    production        : lido pelo cd.yml. Deploy ao mergear `production`, COM
                        required reviewers (gate de aprovacao).

  Os Environments build-* sao separados de proposito: usar o Environment
  `production` (com reviewers) no job de build travaria o CI esperando aprovacao.
  O gate pertence ao deploy, nao ao build. Ver docs/CD-FRONTEND.md.

  NEXT_PUBLIC_* sao `vars`, NAO `secrets` (terminam no bundle, visiveis no
  navegador). Cada Environment recebe uma deployment branch policy que restringe
  o uso a exatamente uma branch (development / production).

  NAO cadastra secrets de deploy: o CD baixa o artefato com o GITHUB_TOKEN
  automatico. Se no futuro algum passo exigir secret, use:
    gh secret set NOME --env production --repo <owner/repo>

  Idempotente: reexecutar sobrescreve a config; nao duplica branch policies;
  `gh variable set` sobrescreve o valor da var.

.PARAMETER Repo
  Obrigatorio. owner/repo. Ex.: LogixSphere/logix-sphere-frontend-nextjs

.PARAMETER ProdReviewers
  Revisores do gate de PROD, separados por virgula. Cada item: user:<login> ou
  team:<slug>. Ex.: "user:ivanilton,team:plataforma"
  Recomendado pelo menos 1 — sem isso o PROD fica SEM gate (o script pede confirmacao).

.PARAMETER DevBranch
  Branch de DEV. Default: development

.PARAMETER ProdBranch
  Branch de PROD. Default: production

.PARAMETER WaitTimer
  Espera obrigatoria antes do deploy PROD, em minutos (0-43200). Default: 0

.PARAMETER DevApiUrl
  NEXT_PUBLIC_API_URL de HOMOL. Default: https://homol.logixsphere.com/api

.PARAMETER ProdApiUrl
  NEXT_PUBLIC_API_URL de PROD. Default: https://logixsphere.com/api

.PARAMETER DevApiBaseUrl / ProdApiBaseUrl
  NEXT_PUBLIC_API_BASE_URL por ambiente (opcional).

.PARAMETER DevChat / ProdChat
  NEXT_PUBLIC_CHAT por ambiente (opcional).

.PARAMETER DevChatSocketUrl / ProdChatSocketUrl
  NEXT_PUBLIC_CHAT_SOCKET_URL por ambiente (opcional).
  (Vars nao informadas sao puladas, nao apagadas.)

.PARAMETER DryRun
  Mostra o que faria, sem chamar a API de escrita.

.EXAMPLE
  .\scripts\setup-environments.ps1 -Repo LogixSphere/logix-sphere-frontend-nextjs -ProdReviewers "user:SEU_LOGIN"

.EXAMPLE
  .\scripts\setup-environments.ps1 -Repo LogixSphere/logix-sphere-frontend-nextjs -ProdReviewers "user:SEU_LOGIN" -DryRun

.NOTES
  Pre-requisitos: gh CLI autenticado (`gh auth status`) com permissao de ADMIN no repo.
  Recomendado PowerShell 7+ (funciona tambem no Windows PowerShell 5.1).
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)] [string] $Repo,
  [string] $ProdReviewers     = "",
  [string] $DevBranch         = "development",
  [string] $ProdBranch        = "production",
  [int]    $WaitTimer         = 0,
  [string] $DevApiUrl         = "https://homol.logixsphere.com/api",
  [string] $ProdApiUrl        = "https://logixsphere.com/api",
  [string] $DevApiBaseUrl     = "",
  [string] $ProdApiBaseUrl    = "",
  [string] $DevChat           = "",
  [string] $ProdChat          = "",
  [string] $DevChatSocketUrl  = "",
  [string] $ProdChatSocketUrl = "",
  [switch] $DryRun
)

# Sinaliza que o required reviewers foi recusado pelo plano (resumo final).
$script:ReviewersUnsupported = $false

$ErrorActionPreference = "Stop"
function Log { param([string]$Msg) Write-Host "[setup-env] $Msg" }

# --------------------------------------------------------------------------
# Validacoes de ambiente
# --------------------------------------------------------------------------
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw "gh CLI nao encontrado. Instale: https://cli.github.com"
}

gh auth status *> $null
if ($LASTEXITCODE -ne 0) { throw "gh nao esta autenticado. Rode 'gh auth login' primeiro." }

if ($Repo -notmatch '^[^/]+/[^/]+$') { throw "-Repo deve ser owner/repo (ex.: LogixSphere/logix-sphere-frontend-nextjs)." }
$Owner = $Repo.Split('/')[0]

# Confirma acesso de admin (Environments exigem admin).
$perm = (gh api "repos/$Repo" --jq '.permissions.admin' 2>$null)
if ($perm -ne 'true') {
  throw "Voce nao tem permissao de ADMIN em $Repo (necessaria para gerenciar Environments). Confira: gh api repos/$Repo --jq .permissions"
}

# --------------------------------------------------------------------------
# Resolve a lista de revisores (user:<login> | team:<slug>) em JSON [{type,id}]
# --------------------------------------------------------------------------
function Resolve-ReviewersJson {
  param([string]$List)
  $objs = @()
  foreach ($raw in $List.Split(',')) {
    $token = $raw.Trim()
    if (-not $token) { continue }

    # Atalho: 'me' / '@me' resolve o usuario autenticado (sem precisar do login).
    if ($token -in 'me', '@me') {
      $id = ("$(gh api user --jq '.id' 2>$null)").Trim()
      if ($id -notmatch '^[0-9]+$') { throw "Nao consegui resolver o usuario autenticado. Rode 'gh auth status'." }
      $objs += "{""type"":""User"",""id"":$id}"
      Log "revisor resolvido: $token -> id $id"
      continue
    }

    $parts = $token.Split(':', 2)
    if ($parts.Count -ne 2) { throw "Revisor invalido '$token'. Use user:<login>, team:<slug> ou me." }
    $kind = $parts[0]; $ref = $parts[1]
    switch ($kind) {
      'user' {
        $id = ("$(gh api "users/$ref" --jq '.id' 2>$null)").Trim()
        if ($id -notmatch '^[0-9]+$') { throw "Usuario nao encontrado no GitHub: '$ref'. Use seu login real (ex.: user:ivaniltonneto)." }
        $objs += "{""type"":""User"",""id"":$id}"
      }
      'team' {
        $id = ("$(gh api "orgs/$Owner/teams/$ref" --jq '.id' 2>$null)").Trim()
        if ($id -notmatch '^[0-9]+$') { throw "Time nao encontrado em ${Owner}: '$ref'. Use o slug real do time." }
        $objs += "{""type"":""Team"",""id"":$id}"
      }
      default { throw "Revisor invalido '$token'. Use user:<login> ou team:<slug>." }
    }
    Log "revisor resolvido: $token -> id $id"
  }
  return '[' + ($objs -join ',') + ']'
}

# --------------------------------------------------------------------------
# Cria/atualiza um Environment com branch policy restrita a uma unica branch.
# --------------------------------------------------------------------------
function Set-Environment {
  param(
    [string]$EnvName,
    [string]$Branch,
    [string]$ReviewersJson,
    [int]$Wait
  )

  Log "Configurando environment '$EnvName' (branch permitida: $Branch)..."

  # 1) Corpo base (sem reviewers) — sempre aceito no plano Team.
  $baseBody = @"
{
  "wait_timer": $Wait,
  "deployment_branch_policy": { "protected_branches": false, "custom_branch_policies": true }
}
"@

  if ($DryRun) {
    Write-Host "  [dry-run] PUT (base) repos/$Repo/environments/$EnvName"
    Write-Host $baseBody
  } else {
    $baseBody | gh api -X PUT "repos/$Repo/environments/$EnvName" --input - *> $null
    if ($LASTEXITCODE -ne 0) { throw "Falha ao criar/atualizar environment '$EnvName'." }
    Log "environment '$EnvName' criado/atualizado (branch policy aplicada)."
  }

  # 2) Required reviewers (opcional) — re-inclui a base para nao perde-la. Em
  #    repo PRIVADO no plano Team a API retorna 422 (billing plan): avisamos e
  #    seguimos, sem perder a config base do passo 1.
  if ($ReviewersJson -ne "[]") {
    $revBody = @"
{
  "wait_timer": $Wait,
  "reviewers": $ReviewersJson,
  "deployment_branch_policy": { "protected_branches": false, "custom_branch_policies": true }
}
"@
    if ($DryRun) {
      Write-Host "  [dry-run] PUT (reviewers) repos/$Repo/environments/$EnvName"
      Write-Host $revBody
    } else {
      $err = ($revBody | gh api -X PUT "repos/$Repo/environments/$EnvName" --input - 2>&1)
      if ($LASTEXITCODE -eq 0) {
        Log "required reviewers aplicado em '$EnvName'."
      } elseif ("$err" -match '(?i)billing plan') {
        $script:ReviewersUnsupported = $true
        Log "AVISO: required reviewers NAO aplicado em '$EnvName': o plano nao suporta"
        Log "       essa protection rule em repo privado (precisa de GitHub Enterprise)."
        Log "       Use o gate por branch protection — scripts/setup-branch-protection.sh."
      } else {
        throw "Falha ao aplicar reviewers em '$EnvName': $err"
      }
    }
  }

  # Branch policy: garante UMA policy com o nome da branch alvo (idempotente).
  $existing = (gh api "repos/$Repo/environments/$EnvName/deployment-branch-policies" --jq '.branch_policies[].name' 2>$null)
  if ($existing -contains $Branch) {
    Log "branch policy '$Branch' ja existe em '$EnvName'."
  } elseif ($DryRun) {
    Write-Host "  [dry-run] POST branch policy '$Branch' em '$EnvName'"
  } else {
    gh api -X POST "repos/$Repo/environments/$EnvName/deployment-branch-policies" -f name=$Branch *> $null
    if ($LASTEXITCODE -ne 0) { throw "Falha ao adicionar branch policy '$Branch' em '$EnvName'." }
    Log "branch policy '$Branch' adicionada em '$EnvName'."
  }
}

# --------------------------------------------------------------------------
# Seta uma `var` no escopo de um Environment (idempotente). Vars vazias sao
# PULADAS — nunca apagamos uma var existente por causa de flag ausente.
# --------------------------------------------------------------------------
function Set-Variable-Env {
  param([string]$EnvName, [string]$Name, [string]$Value)
  if (-not $Value) { Log "  var $Name em '$EnvName' nao informada — pulando."; return }
  if ($DryRun) {
    Write-Host "  [dry-run] gh variable set $Name --env $EnvName --repo $Repo --body '$Value'"
  } else {
    gh variable set $Name --env $EnvName --repo $Repo --body $Value *> $null
    if ($LASTEXITCODE -ne 0) { throw "Falha ao setar var $Name em '$EnvName'." }
    Log "  var $Name setada em '$EnvName'."
  }
}

# --------------------------------------------------------------------------
# Cria/atualiza um Environment de BUILD (sem gate) e popula as NEXT_PUBLIC_*.
# --------------------------------------------------------------------------
function Setup-BuildEnvironment {
  param([string]$EnvName, [string]$Branch, [string]$ApiUrl, [string]$ApiBase, [string]$Chat, [string]$Socket)
  Set-Environment -EnvName $EnvName -Branch $Branch -ReviewersJson "[]" -Wait 0
  Set-Variable-Env -EnvName $EnvName -Name "NEXT_PUBLIC_API_URL"         -Value $ApiUrl
  Set-Variable-Env -EnvName $EnvName -Name "NEXT_PUBLIC_API_BASE_URL"    -Value $ApiBase
  Set-Variable-Env -EnvName $EnvName -Name "NEXT_PUBLIC_CHAT"            -Value $Chat
  Set-Variable-Env -EnvName $EnvName -Name "NEXT_PUBLIC_CHAT_SOCKET_URL" -Value $Socket
}

# --------------------------------------------------------------------------
# Execucao
# --------------------------------------------------------------------------
Log "Repositorio: $Repo"
Log "CI   -> environments 'build-development' / 'build-production' (vars NEXT_PUBLIC_*)"
Log "DEV  -> environment 'development' (branch: $DevBranch, sem gate)"
Log "PROD -> environment 'production'  (branch: $ProdBranch, com gate)"
if ($DryRun) { Log "MODO DRY-RUN: nenhuma escrita sera feita." }

# build-*: lidos pelo ci.yml (job package).
Setup-BuildEnvironment -EnvName "build-development" -Branch $DevBranch `
  -ApiUrl $DevApiUrl -ApiBase $DevApiBaseUrl -Chat $DevChat -Socket $DevChatSocketUrl
Setup-BuildEnvironment -EnvName "build-production" -Branch $ProdBranch `
  -ApiUrl $ProdApiUrl -ApiBase $ProdApiBaseUrl -Chat $ProdChat -Socket $ProdChatSocketUrl

# development: sem reviewers.
Set-Environment -EnvName "development" -Branch $DevBranch -ReviewersJson "[]" -Wait 0

# production: com reviewers (gate).
$prodJson = "[]"
if ($ProdReviewers) {
  $prodJson = Resolve-ReviewersJson -List $ProdReviewers
} else {
  Write-Warning "Nenhum -ProdReviewers informado: 'production' ficara SEM gate de aprovacao."
  $ans = Read-Host "Continuar mesmo assim? [y/N]"
  if ($ans.ToLower() -ne 'y') { Write-Host "Abortado."; exit 1 }
}
Set-Environment -EnvName "production" -Branch $ProdBranch -ReviewersJson $prodJson -Wait $WaitTimer

Write-Host ""
Log "OK. Confira em: https://github.com/$Repo/settings/environments"
Log "Environments: build-development / build-production (vars NEXT_PUBLIC_*), development, production."
Log "'development' -> branch policy '$DevBranch'; 'production' -> branch policy '$ProdBranch'."
Log "Vars de build: .../settings/variables/actions (escopo Environment)."
if ($script:ReviewersUnsupported) {
  Write-Host ""
  Log "AVISO: GATE DE APROVACAO PENDENTE — required reviewers do Environment nao e"
  Log "       suportado neste plano (repo privado no Team). Aplique o gate por branch"
  Log "       protection: bash scripts/setup-branch-protection.sh --repo $Repo --reviewers 1"
}
