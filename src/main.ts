import { app, BrowserWindow, ipcMain } from 'electron'
import { CommandParser } from './command-parser'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import * as yargs from 'yargs'

interface IAppArgs {
	vfsPath?: string
	prompt?: string
	scriptPath?: string
	testParser?: boolean
}

export type AppConfig = IAppArgs

const argv = yargs
	.default(process.argv.slice(2))
	.option('vfs-path', {
		type: 'string',
		description: 'Path to VFS XML file',
		alias: ['vfs'],
	})
	.option('prompt', {
		type: 'string',
		description: 'Custom prompt',
		alias: ['p'],
	})
	.option('script-path', {
		type: 'string',
		description: 'Path to startup script',
		alias: ['s'],
	})
	.option('test-parser', {
		type: 'boolean',
		description: 'Run command parser tests without launching GUI',
		alias: ['t'],
	})
	.locale('en')
	.parse() as IAppArgs

console.log('Command line parameters:')
console.log('\tVFS Path:', argv.vfsPath || 'Not specified')
console.log('\tPrompt:', argv.prompt || 'Not specified')
console.log('\tScript Path:', argv.scriptPath || 'Not specified')

const createWindow = () => {
	const mainWindow = new BrowserWindow({
		width: 800,
		height: 900,
		center: true,
		autoHideMenuBar: true,
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'preload.js'),
		},
		show: false,
	})

	mainWindow.loadFile(path.join(__dirname, 'public', 'index.html'))

	const username = os.userInfo().username
	const hostname = os.hostname()
	mainWindow.setTitle(`Эмулятор - [${username}@${hostname}]`)

	mainWindow.once('ready-to-show', () => {
		mainWindow.show()
	})
}

ipcMain.handle('get-app-config', (event): AppConfig => {
	return {
		prompt: argv.prompt,
		scriptPath: argv.scriptPath,
		vfsPath: argv.vfsPath,
		testParser: argv.testParser,
	}
})

ipcMain.handle('read-file', async (event, filePath: string) => {
	try {
		return await fs.promises.readFile(path.join(__dirname, 'public', filePath), 'utf-8')
	} catch (e) {
		const error = e as NodeJS.ErrnoException
		if (error.code === 'ENOENT') throw `File loading error: File not found`
		if (error.code === 'EACCES') throw `File loading error: Permission denied`
		throw 'File loading error: Unknown error'
	}
})

ipcMain.handle('server-log', async (event, text: string) => {
	console.log(text)
})

app.whenReady().then(() => {
	if (argv.testParser) {
		CommandParser.testParser()
		app.quit()
	}

	createWindow()
})

app.on('window-all-closed', () => {
	app.quit()
})
