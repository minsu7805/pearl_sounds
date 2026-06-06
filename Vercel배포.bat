@echo off
chcp 65001 >nul
echo Pearl Sounds Vercel 배포 준비
echo.
echo 1. 브라우저에서 Vercel 로그인
echo 2. Deploy without Git 또는 폴더 업로드 선택
echo 3. pearlsounds-vercel.zip 압축 해제 후 폴더 내용 업로드
echo    (index.html 이 루트에 있어야 함)
echo 4. Framework: Other, Build Command: 비움
echo 5. Deploy 후 Settings - Deployment Protection 끄기
echo.
start https://vercel.com/new
explorer /select,"%~dp0..\pearlsounds-vercel.zip"
pause
