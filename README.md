# Эмулятор Командной Строки UNIX

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Electron](https://img.shields.io/badge/Electron-38.0-blue)](https://www.electronjs.org/)

Графический эмулятор командной строки UNIX-подобной оболочки. Разработан в рамках учебного задания по дисциплине "Конфигурационное управление" в РТУ МИРЭА.

## Возможности

- **Графический интерфейс:** Нативное desktop-приложение на основе Electron.
- **Виртуальная ФС (VFS):** Файловая система в памяти, загружаемая из XML.
- **Команды оболочки:** Реализованы команды `ls`, `cd`, `pwd`, `exit`, `tail`, `du`, `rmdir`, `mv`.
- **Настраиваемость:** Поддержка пользовательских приглашений, стартовых скриптов и путей к VFS через аргументы командной строки.
- **Кроссплатформенность:** Запускается на Windows, Linux и macOS.

## Установка и Запуск

1.  **Клонируйте репозиторий:**

    ```bash
    git clone https://github.com/your-username/unix-shell-emulator.git
    cd unix-shell-emulator
    ```

2.  **Установите зависимости:**

    ```bash
    npm install
    ```

3.  **Соберите проект:**

    ```bash
    npm run build
    ```

4.  **Запустите приложение:**
    ```bash
    npm start
    ```

### Аргументы командной строки

| Аргумент              | Описание                              | Пример                     |
| --------------------- | ------------------------------------- | -------------------------- |
| `--vfs-path`, `--vfs` | Путь к XML-файлу VFS                  | `--vfs "./vfs/sample.xml"` |
| `--prompt`, `-p`      | Пользовательское приглашение оболочки | `-p "my-terminal $"`       |
| `--script-path`, `-s` | Путь к стартовому скрипту             | `-s "./scripts/init.txt"`  |
| `--test-parser`, `-t` | Запустить тесты парсера без GUI       | `--test-parser`            |

## Разработка

- **Полная сборка:** `npm run build`
- **Запуск приложения:** `npm run start`
- **Запуск тестов:** `npm run test:windows` или `npm run test:linux`
