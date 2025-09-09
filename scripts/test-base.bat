@echo off
echo Testing terminal emulator

echo 1. Testing with custom prompt
cmd /c "electron dist/main.js --prompt "MyTerminal $" & exit"

echo 2. Testing with script
cmd /c "electron dist/main.js --script-path "scripts/test-script.txt" -p "Script $" & exit"

echo 3. Testing with vfs
cmd /c "electron dist/main.js --vfs "VFS.xml" -p "VFS $" & exit"

echo All tests completed!