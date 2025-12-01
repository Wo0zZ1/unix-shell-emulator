import { type AppConfig } from './main'

export interface ElectronAPI {
	getAppConfig: () => Promise<AppConfig>
	readFile: (filePath: string) => Promise<string>
	saveFile: (filePath: string, content: string) => Promise<void>
	serverLog: (text: string) => Promise<void>
	platform: string
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
		appConfig?: AppConfig
	}
}
