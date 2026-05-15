@echo off
title Budgetbeheer

echo.
echo  ============================
echo   Budgetbeheer opstarten...
echo  ============================
echo.

:: Controleer of Node.js aanwezig is
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo  [FOUT] Node.js is niet geinstalleerd.
    echo  Download het op: https://nodejs.org
    pause
    exit /b 1
)

:: Ga naar de map waar dit script staat
cd /d "%~dp0"

:: Bouw de app als de .next map ontbreekt
if not exist ".next" (
    echo  Eerste keer opstarten - even wachten, app wordt gebouwd...
    call npm run build
    if %errorlevel% neq 0 (
        echo  [FOUT] Bouwen mislukt. Controleer de installatie.
        pause
        exit /b 1
    )
)

:: Toon het IP-adres zodat collega's het kunnen gebruiken
echo  ============================
echo   Jouw netwerk-adres:
ipconfig | findstr /i "IPv4"
echo   Collega's openen in browser:
echo   http://[bovenstaand IP]:3001
echo  ============================
echo.
echo  De app draait. Sluit dit venster NIET.
echo  Druk Ctrl+C om te stoppen.
echo.

:: Start de app
npm run start -- --hostname 0.0.0.0 --port 3001

pause
