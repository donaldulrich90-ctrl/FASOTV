@echo off
title FASO TV - Demarrage
color 0A
echo.
echo  ======================================
echo   FASO TV - Demarrage de la plateforme
echo  ======================================
echo.

REM --- Backend Django ---
echo [1/2] Demarrage du serveur Django (port 8000)...
start "FASO TV - Backend" cmd /k "cd /d D:\FASOTV\backend && echo Serveur Django en cours... && python manage.py runserver"

REM --- Frontend React ---
echo [2/2] Demarrage du serveur React (port 5173)...
start "FASO TV - Frontend" cmd /k "cd /d D:\FASOTV\frontend && echo Serveur React en cours... && npm run dev"

REM --- Ouverture navigateur apres 5 secondes ---
echo.
echo Ouverture du navigateur dans 5 secondes...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo  Plateforme FASO TV demarree !
echo  Backend  : http://localhost:8000
echo  Frontend : http://localhost:5173
echo  Admin    : http://localhost:8000/admin
echo.
echo  Fermez les fenetres "Backend" et "Frontend" pour arreter.
pause
