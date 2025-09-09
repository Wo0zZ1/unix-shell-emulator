@echo off
echo Testing terminal emulator

echo 1. Testing with script path
cmd /c "electron dist/main.js -s "scripts/test-script.txt" -p "script $" & exit"

echo 2. Testing with bad script path
cmd /c "electron dist/main.js -s "scripts/undefined-script.txt" -p "script bad path $" & exit"

echo 3. Testing with error script
cmd /c "electron dist/main.js --script-path "scripts/error-script.txt" -p "script invalid $" & exit"

echo All tests completed!