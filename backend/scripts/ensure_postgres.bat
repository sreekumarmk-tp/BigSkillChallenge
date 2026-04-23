@echo off
setlocal

set "SCRIPT_DIR=%~dp0"

where py >nul 2>&1
if %ERRORLEVEL%==0 (
  py "%SCRIPT_DIR%ensure_postgres.py"
  exit /b %ERRORLEVEL%
)

where python >nul 2>&1
if %ERRORLEVEL%==0 (
  python "%SCRIPT_DIR%ensure_postgres.py"
  exit /b %ERRORLEVEL%
)

echo Python not found in PATH. Install Python 3 and try again.
exit /b 1
