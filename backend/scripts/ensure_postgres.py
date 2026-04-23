#!/usr/bin/env python3
from __future__ import annotations

import os
import shlex
import subprocess
import sys
import time
from pathlib import Path


def load_env_file(env_path: Path) -> None:
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def run_cmd(command: list[str], env: dict[str, str] | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        command,
        env=env,
        capture_output=True,
        text=True,
        check=False,
    )


def psql_query(
    host: str,
    port: str,
    user: str,
    password: str,
    database: str,
    query: str,
) -> str | None:
    env = os.environ.copy()
    env["PGPASSWORD"] = password
    command = [
        "psql",
        "-h",
        host,
        "-p",
        port,
        "-U",
        user,
        "-d",
        database,
        "-tAc",
        query,
    ]
    result = run_cmd(command, env=env)
    if result.returncode != 0:
        return None
    return result.stdout.strip()


def create_db_if_missing(host: str, port: str, user: str, password: str, db_name: str) -> bool:
    exists = psql_query(
        host=host,
        port=port,
        user=user,
        password=password,
        database="postgres",
        query=f"SELECT 1 FROM pg_database WHERE datname='{db_name}'",
    )
    if exists == "1":
        print(f"Database '{db_name}' already exists.")
        return True

    print(f"Creating database '{db_name}'...")
    env = os.environ.copy()
    env["PGPASSWORD"] = password
    result = run_cmd(
        [
            "psql",
            "-h",
            host,
            "-p",
            port,
            "-U",
            user,
            "-d",
            "postgres",
            "-v",
            f"db_name={db_name}",
            "-c",
            'CREATE DATABASE :"db_name";',
        ],
        env=env,
    )
    if result.returncode != 0:
        if result.stderr:
            print(result.stderr.strip())
        return False
    print(f"Database '{db_name}' created.")
    return True


def has_docker_compose() -> list[str] | None:
    docker_compose_v2 = run_cmd(["docker", "compose", "version"])
    if docker_compose_v2.returncode == 0:
        return ["docker", "compose"]

    docker_compose_v1 = run_cmd(["docker-compose", "--version"])
    if docker_compose_v1.returncode == 0:
        return ["docker-compose"]
    return None


def main() -> int:
    backend_dir = Path(__file__).resolve().parent.parent
    load_env_file(backend_dir / ".env")

    postgres_user = os.getenv("POSTGRES_USER", "bigskill")
    postgres_password = os.getenv("POSTGRES_PASSWORD", "bigskill_password")
    postgres_db = os.getenv("POSTGRES_DB", "bigskill_db")
    postgres_host = os.getenv("POSTGRES_HOST", "localhost")
    postgres_port = os.getenv("POSTGRES_PORT", "5432")

    psql_check = run_cmd(["psql", "--version"])
    if psql_check.returncode != 0:
        print("psql is required to create/check databases. Install PostgreSQL client tools first.")
        return 1

    local_ready = psql_query(
        host=postgres_host,
        port=postgres_port,
        user=postgres_user,
        password=postgres_password,
        database="postgres",
        query="SELECT 1",
    )
    if local_ready == "1":
        print(f"Local PostgreSQL detected at {postgres_host}:{postgres_port}.")
        return 0 if create_db_if_missing(postgres_host, postgres_port, postgres_user, postgres_password, postgres_db) else 1

    print("Local PostgreSQL not reachable. Starting Docker PostgreSQL...")
    compose_cmd = has_docker_compose()
    if not compose_cmd:
        print("Docker Compose not found. Install Docker Desktop/Engine with Compose support.")
        return 1

    up_result = run_cmd([*compose_cmd, "up", "-d", "db"])
    if up_result.returncode != 0:
        if up_result.stderr:
            print(up_result.stderr.strip())
        return 1

    for _ in range(30):
        local_ready = psql_query(
            host=postgres_host,
            port=postgres_port,
            user=postgres_user,
            password=postgres_password,
            database="postgres",
            query="SELECT 1",
        )
        if local_ready == "1":
            print("Docker PostgreSQL is ready.")
            return 0 if create_db_if_missing(postgres_host, postgres_port, postgres_user, postgres_password, postgres_db) else 1
        time.sleep(1)

    print("PostgreSQL did not become ready in time.")
    return 1


if __name__ == "__main__":
    sys.exit(main())
