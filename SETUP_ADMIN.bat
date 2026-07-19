@echo off
:: Verification droits administrateur
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo  ERREUR : Ce script doit etre execute en tant qu'Administrateur !
    echo  Clic droit sur ce fichier ^> "Executer en tant qu'administrateur"
    echo.
    pause
    exit /b 1
)

title FASO TV - Configuration Complete (Admin)
color 0B
echo.
echo  ============================================
echo   FASO TV - Configuration Complete
echo   (Droits Administrateur detectes)
echo  ============================================
echo.

REM ============================================================
REM ETAPE 1 : Passer PostgreSQL en mode trust (sans mot de passe)
REM ============================================================
echo [1/6] Ouverture de l'acces PostgreSQL sans mot de passe...

set PG_HBA=C:\Program Files\PostgreSQL\18\data\pg_hba.conf
set PG_HBA_BAK=C:\Program Files\PostgreSQL\18\data\pg_hba.conf.bak

copy "%PG_HBA%" "%PG_HBA_BAK%" >nul

powershell -Command "(Get-Content '%PG_HBA%') -replace 'scram-sha-256', 'trust' | Set-Content '%PG_HBA%'"

REM ============================================================
REM ETAPE 2 : Recharger PostgreSQL
REM ============================================================
echo [2/6] Rechargement de PostgreSQL...
net stop postgresql-x64-18 >nul 2>&1
net start postgresql-x64-18 >nul 2>&1
timeout /t 3 /nobreak >nul

REM ============================================================
REM ETAPE 3 : Creer utilisateur et base de donnees
REM ============================================================
echo [3/6] Creation de la base de donnees fasotv_db...
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "DROP DATABASE IF EXISTS fasotv_db;" >nul 2>&1
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "DROP USER IF EXISTS fasotv;" >nul 2>&1
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE USER fasotv WITH PASSWORD 'fasotv_pass' CREATEDB;"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "CREATE DATABASE fasotv_db OWNER fasotv ENCODING 'UTF8';"
"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE fasotv_db TO fasotv;"
echo    OK : Base fasotv_db creee.

REM ============================================================
REM ETAPE 4 : Restaurer la securite PostgreSQL
REM ============================================================
echo [4/6] Restauration de la securite PostgreSQL...
copy "%PG_HBA_BAK%" "%PG_HBA%" >nul
del "%PG_HBA_BAK%" >nul
net stop postgresql-x64-18 >nul 2>&1
net start postgresql-x64-18 >nul 2>&1
timeout /t 3 /nobreak >nul
echo    OK : Securite restauree (scram-sha-256).

REM ============================================================
REM ETAPE 5 : Migrations Django
REM ============================================================
echo [5/6] Application des migrations Django...
cd /d D:\FASOTV\backend
set DJANGO_SETTINGS_MODULE=core.settings
python manage.py migrate
if %errorlevel% neq 0 (
    echo    ERREUR lors des migrations !
    pause
    exit /b 1
)
echo    OK : Migrations appliquees.

REM ============================================================
REM ETAPE 6 : Donnees de demonstration
REM ============================================================
echo [6/6] Chargement des donnees de demonstration...
python manage.py seed_data
echo    OK : Donnees chargees.

echo.
echo  ============================================
echo   FASO TV est pret !
echo.
echo   Lancez maintenant : LANCER.bat
echo.
echo   Comptes de connexion :
echo   Admin : 70000000 / admin123
echo   Test  : 71000000 / test123
echo  ============================================
echo.
pause
