@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo Pearl Sounds 로컬 서버를 시작합니다...
echo YouTube 영상은 http://localhost:8080 에서 바로 재생됩니다.
echo 종료하려면 이 창을 닫으세요.
powershell -ExecutionPolicy Bypass -File "%~dp0serve.ps1"
