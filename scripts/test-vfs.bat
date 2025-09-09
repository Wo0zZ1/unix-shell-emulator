@echo off
echo Testing terminal emulator

echo 1. Testing with VFS path
cmd /c "electron dist/main.js --vfs "VFS.xml" --prompt "VFS $" & exit"

echo 2. Testing with bad VFS path
cmd /c "electron dist/main.js --vfs "./src/VFS.xml" --prompt "VFS bad path $" & exit"

echo 3. Testing with bad VFS file format
cmd /c "electron dist/main.js --vfs "VFS.txt" --prompt "VFS bad format $" & exit"

echo 4. Testing with bad VFS file
cmd /c "electron dist/main.js --vfs "invalid.xml" --prompt "VFS invalid $" & exit"

echo All tests completed!