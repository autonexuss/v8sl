@echo off
title Velocitrak car explorer
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js 18 or newer, then double-click this file again.
  echo Download: https://nodejs.org/
  pause
  exit /b 1
)
node server.mjs
echo.
pause
