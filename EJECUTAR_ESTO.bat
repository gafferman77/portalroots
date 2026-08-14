@echo off
cd /d C:\Users\roots\OneDrive\Documentos\oficina\portalroots

if not exist functions mkdir functions

copy genesis-analista.html genesis-analista.html >nul
copy functions\api.js functions\api.js >nul

git add .
git commit -m "Fix Genesis - Deploy final"
git push origin main

cls
echo.
echo ============================================
echo LISTO!
echo Cloudflare esta deployando...
echo Espera 3 minutos
echo.
echo Luego accede a:
echo https://portalroots.pages.dev/genesis-analista.html
echo ============================================
echo.
pause
