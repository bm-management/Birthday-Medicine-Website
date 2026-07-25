@echo off
cd /d "%~dp0"

set PYCMD=
where python >nul 2>nul && set PYCMD=python
if not defined PYCMD (
    where py >nul 2>nul && set PYCMD=py
)

if not defined PYCMD (
    echo Could not find Python on this computer.
    echo Install Python from https://www.python.org/downloads/ ^(check "Add python.exe to PATH" during setup^), then run this file again.
    pause
    exit /b 1
)

echo Starting a local server for this folder at http://localhost:8000
echo Keep this window open while you're viewing the site. Close this window to stop the server.
echo.

start "" cmd /c "ping -n 2 127.0.0.1 >nul & start "" http://localhost:8000"

%PYCMD% -m http.server 8000
