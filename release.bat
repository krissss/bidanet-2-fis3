:: 删除www目录
if exist %cd%\www rd /s /q %cd%\www

:: 执行release
fis3 release -d ./www

pause
