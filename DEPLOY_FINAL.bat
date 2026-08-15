@echo off
cd /d C:\Users\roots\OneDrive\Documentos\oficina\portalroots

REM Eliminar carpeta functions que tiene el Worker fallido
rmdir /s /q functions 2>nul

REM Copiar el nuevo HTML
copy genesis-analista.html genesis-analista.html >nul

REM Git commit y push
git add -A
git commit -m "Deploy Genesis Final - Sin Worker, HTML puro funciona"
git push origin main

cls
echo.
echo ============================================
echo LISTO! Deployando version final...
echo Espera 2 minutos
echo.
echo Luego accede a:
echo https://portalroots.pages.dev/genesis-analista.html
echo ============================================
echo.
pause
