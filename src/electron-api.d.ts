import { type AppConfig } from './main'

export interface ElectronAPI {
	getAppConfig: () => Promise<AppConfig>
	readFile: (filePath: string) => Promise<string>
	serverLog: (text: string) => void
	platform: string
}

declare global {
	interface Window {
		electronAPI: ElectronAPI
		appConfig?: AppConfig
	}
}
