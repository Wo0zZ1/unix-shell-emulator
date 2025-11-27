import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	getAppConfig: () => ipcRenderer.invoke('get-app-config'),
	readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
	saveFile: (filePath: string, content: string) =>
		ipcRenderer.invoke('save-file', filePath, content),
	serverLog: (text: string) => ipcRenderer.invoke('server-log', text),
	platform: process.platform,
})
