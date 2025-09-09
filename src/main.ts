import { app, BrowserWindow } from 'electron'
import { CommandParser } from './command-parser'
import * as path from 'path'
import * as os from 'os'

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 600,
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js'),
		},
		show: false,
	})

	const username = os.userInfo().username
	const hostname = os.hostname()
	mainWindow.setTitle(`Эмулятор - [${username}@${hostname}]`)

	mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'))

	mainWindow.once('ready-to-show', () => mainWindow.show())
}

app.whenReady().then(() => {
	CommandParser.testParser() // TODO MAKE FLAG TO START TESTS

	createWindow()
})

app.on('window-all-closed', () => app.quit)
