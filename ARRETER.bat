@echo off
title FASO TV - Arret
color 0C
echo.
echo  ======================================
echo   FASO TV - Arret de la plateforme
echo  ======================================
echo.
echo Fermeture des serveurs...

taskkill /FI "WINDOWTITLE eq FASO TV - Backend*" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq FASO TV - Frontend*" /F >nul 2>&1
taskkill /F /IM "node.exe" >nul 2>&1

echo Serveurs arretes.
echo.
pause
