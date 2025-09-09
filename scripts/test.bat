@echo off
echo Testing terminal emulator

cmd /c "electron dist/main.js --vfs "VFS.xml" & exit"
cmd /c "electron dist/main.js --vfs "/VFS.xml" & exit"
cmd /c "electron dist/main.js --vfs "./VFS.xml" & exit"
cmd /c "electron dist/main.js --vfs "public/VFS.xml" & exit"
cmd /c "electron dist/main.js --vfs "./public/VFS.xml" & exit"

echo All tests completed!