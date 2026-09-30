@echo off
echo ========================================================
echo Pushing STUDENTMANAGMENTSYSTEM to GitHub Repository...
echo Target: https://github.com/lagudujayanth131252-rgb/STUDENTMANAGMENTSYSTEM.git
echo ========================================================
echo.
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Repository successfully pushed to GitHub!
) else (
    echo [NOTE] If permission was denied, ensure that your GitHub account has write access
    echo or use a Personal Access Token:
    echo git push https://YOUR_TOKEN@github.com/lagudujayanth131252-rgb/STUDENTMANAGMENTSYSTEM.git main
)
pause
