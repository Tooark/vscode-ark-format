#!/usr/bin/env bash

# Exemplo complexo para validar formatacao de shell script.
# Cenarios cobertos:
# - parse de argumentos
# - trap e limpeza de recursos
# - funcoes com retorno/erro
# - case/if/for/while
# - pipeline e redirecionamento
# - here-doc e comando multiline

set -u

APP_NAME="ark-shell-runner"
ENVIRONMENT="dev"
TIMEOUT=20
RETRIES=2
VERBOSE=0
DRY_RUN=0
WORKDIR=""

tmp_dir=""

log(){
local level="$1"
shift
local message="$*"
printf '[%s] [%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$level" "$message"
}

cleanup(){
local exit_code=$?
if [ -n "$tmp_dir" ] && [ -d "$tmp_dir" ];then
rm -rf "$tmp_dir"
fi

if [ "$exit_code" -ne 0 ]; then
log ERROR "Execucao finalizada com erro (codigo=$exit_code)."
else
log INFO "Execucao finalizada com sucesso."
fi

exit "$exit_code"
}

trap cleanup EXIT INT TERM

print_help(){
cat <<'HELP'
Uso:
  example.complex.sh [opcoes]

Opcoes:
  -e, --env <nome>        Ambiente (dev|hml|prod)
  -t, --timeout <seg>     Timeout em segundos (padrao: 20)
  -r, --retries <n>       Quantidade de tentativas (padrao: 2)
  -w, --workdir <path>    Diretorio de trabalho
  -v, --verbose           Exibe logs detalhados
  -n, --dry-run           Simula a execucao sem alterar estado
  -h, --help              Mostra esta ajuda
HELP
}

parse_args(){
while [ "$#" -gt 0 ]; do
case "$1" in
  -e|--env)
    ENVIRONMENT="${2:-}"
    shift 2
    ;;
  -t|--timeout)
    TIMEOUT="${2:-}"
    shift 2
    ;;
  -r|--retries)
    RETRIES="${2:-}"
    shift 2
    ;;
  -w|--workdir)
    WORKDIR="${2:-}"
    shift 2
    ;;
  -v|--verbose)
    VERBOSE=1
    shift
    ;;
  -n|--dry-run)
    DRY_RUN=1
    shift
    ;;
  -h|--help)
    print_help
    exit 0
    ;;
  *)
    log ERROR "Parametro invalido: $1"
    print_help
    exit 2
    ;;
esac
done
}

validate_inputs(){
case "$ENVIRONMENT" in
  dev|hml|prod) ;;
  *)
    log ERROR "Ambiente invalido: $ENVIRONMENT"
    return 1
    ;;
esac

if ! printf '%s' "$TIMEOUT" | grep -Eq '^[0-9]+$'; then
log ERROR "Timeout deve ser numerico. Recebido: $TIMEOUT"
return 1
fi

if ! printf '%s' "$RETRIES" | grep -Eq '^[0-9]+$'; then
log ERROR "Retries deve ser numerico. Recebido: $RETRIES"
return 1
fi

if [ -n "$WORKDIR" ] && [ ! -d "$WORKDIR" ]; then
log ERROR "Diretorio inexistente: $WORKDIR"
return 1
fi

return 0
}

prepare_workspace(){
if [ -n "$WORKDIR" ]; then
tmp_dir="$WORKDIR/.ark-tmp"
else
tmp_dir="$(mktemp -d)"
fi

mkdir -p "$tmp_dir/logs"
mkdir -p "$tmp_dir/output"
}

run_step(){
local step_name="$1"
local cmd="$2"
local attempt=1

while [ "$attempt" -le "$RETRIES" ]; do
log INFO "Executando etapa '$step_name' (tentativa $attempt/$RETRIES)"

if [ "$DRY_RUN" -eq 1 ]; then
log INFO "[dry-run] $cmd"
return 0
fi

if sh -c "$cmd" >>"$tmp_dir/logs/${step_name}.log" 2>&1; then
log INFO "Etapa '$step_name' concluida"
return 0
fi

log WARN "Falha na etapa '$step_name'"
attempt=$((attempt + 1))
sleep 1
done

return 1
}

collect_report(){
local report_file="$tmp_dir/output/report.txt"
{
echo "App........: $APP_NAME"
echo "Ambiente...: $ENVIRONMENT"
echo "Timeout....: $TIMEOUT"
echo "Retries....: $RETRIES"
echo "Dry-run....: $DRY_RUN"
echo "Verbose....: $VERBOSE"
echo "Workdir....: ${WORKDIR:-<temporario>}"
echo "Data.......: $(date '+%Y-%m-%d %H:%M:%S')"
} >"$report_file"

if [ "$VERBOSE" -eq 1 ]; then
log INFO "Conteudo do relatorio:"
cat "$report_file" | sed 's/^/  /'
fi
}

main(){
parse_args "$@"

if ! validate_inputs; then
exit 1
fi

prepare_workspace

run_step "preflight" "printf 'ok preflight\\n'"
run_step "healthcheck" "printf 'ok healthcheck\\n'"
run_step "deploy" "printf 'ok deploy (%s)\\n' '$ENVIRONMENT'"

collect_report

log INFO "Resumo final:"
grep -E '^(App|Ambiente|Timeout|Retries|Dry-run|Verbose)' "$tmp_dir/output/report.txt" |
while IFS= read -r line;do
echo " - $line"
done
}

main "$@"
