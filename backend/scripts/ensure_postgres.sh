#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${BACKEND_DIR}/.env"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

POSTGRES_USER="${POSTGRES_USER:-bigskill}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-bigskill_password}"
POSTGRES_DB="${POSTGRES_DB:-bigskill_db}"
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is required to create/check databases. Install PostgreSQL client tools first."
  exit 1
fi

LOCAL_CHECK_CMD=(
  env "PGPASSWORD=${POSTGRES_PASSWORD}"
  psql
  -h "${POSTGRES_HOST}"
  -p "${POSTGRES_PORT}"
  -U "${POSTGRES_USER}"
  -d postgres
  -tAc "SELECT 1"
)

DB_EXISTS_CMD=(
  env "PGPASSWORD=${POSTGRES_PASSWORD}"
  psql
  -h "${POSTGRES_HOST}"
  -p "${POSTGRES_PORT}"
  -U "${POSTGRES_USER}"
  -d postgres
  -tAc "SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'"
)

create_db_if_missing() {
  local exists
  exists="$("${DB_EXISTS_CMD[@]}" | tr -d '[:space:]')"
  if [[ "${exists}" == "1" ]]; then
    echo "Database '${POSTGRES_DB}' already exists."
    return 0
  fi

  echo "Creating database '${POSTGRES_DB}'..."
  env "PGPASSWORD=${POSTGRES_PASSWORD}" \
    psql -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" -U "${POSTGRES_USER}" -d postgres \
    -v db_name="${POSTGRES_DB}" \
    -c 'CREATE DATABASE :"db_name";'
  echo "Database '${POSTGRES_DB}' created."
}

if [[ "$("${LOCAL_CHECK_CMD[@]}" | tr -d '[:space:]')" == "1" ]]; then
  echo "Local PostgreSQL detected at ${POSTGRES_HOST}:${POSTGRES_PORT}."
  create_db_if_missing
  exit 0
fi

echo "Local PostgreSQL not reachable. Starting Docker PostgreSQL..."
if docker compose version >/dev/null 2>&1; then
  docker compose up -d db
else
  docker-compose up -d db
fi

for i in {1..30}; do
  if [[ "$("${LOCAL_CHECK_CMD[@]}" | tr -d '[:space:]')" == "1" ]]; then
    echo "Docker PostgreSQL is ready."
    create_db_if_missing
    exit 0
  fi
  sleep 1
done

echo "PostgreSQL did not become ready in time."
exit 1
