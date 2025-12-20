@echo off
set ELECTRON_RUN_AS_NODE=
echo ELECTRON_RUN_AS_NODE is "%ELECTRON_RUN_AS_NODE%"
call npx electron test.cjs
