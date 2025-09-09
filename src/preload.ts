import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
	getAppConfig: () => ipcRenderer.invoke('get-app-config'),
	readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
	serverLog: (text: string) => ipcRenderer.invoke('server-log', text),
	platform: process.platform,
})
