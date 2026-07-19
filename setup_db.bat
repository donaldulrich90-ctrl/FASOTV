@echo off
title FASO TV - Configuration Base de Donnees
color 0B
echo.
echo  ======================================
echo   FASO TV - Configuration PostgreSQL
echo  ======================================
echo.
echo Connexion en tant qu'administrateur PostgreSQL...
echo (Entrez le mot de passe postgres si demande)
echo.

"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE USER fasotv WITH PASSWORD 'fasotv_pass';" 2>nul
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE fasotv_db OWNER fasotv ENCODING 'UTF8';" 2>nul
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fasotv_db TO fasotv;" 2>nul
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "ALTER USER fasotv CREATEDB;" 2>nul

echo.
echo Application des migrations Django...
cd /d D:\FASOTV\backend
set DJANGO_SETTINGS_MODULE=core.settings
python manage.py migrate

echo.
echo Chargement des donnees de demonstration...
python manage.py seed_data

echo.
echo  ======================================
echo   Base de donnees configuree !
echo   Admin : 70000000 / admin123
echo   Test  : 71000000 / test123
echo  ======================================
echo.
pause
