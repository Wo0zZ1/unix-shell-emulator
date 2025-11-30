export interface ICreateDirectoryOptions {
	parents?: boolean
}

export interface IDeleteDirectoryOptions {
	parents?: boolean
}

export interface IDeleteFileOptions {
	recursive?: boolean
	force?: boolean
}

export interface IMoveOptions {
	rename?: boolean
}

export interface ICpOptions {
	recursive?: boolean
}

export interface IFileSystemService {
	// Операции с директориями
	listDirectory(path?: string): string
	changeDirectory(path: string): void
	createDirectory(path: string, options?: ICreateDirectoryOptions): void
	deleteDirectory(path: string, options?: IDeleteDirectoryOptions): void

	// Операции с файлами
	readFile(path: string): string
	writeFile(path: string, content: string): void
	createFile(path: string): void
	deleteFile(path: string, options?: IDeleteFileOptions): void
	moveFileOrDirectory(from: string, to: string, options?: IMoveOptions): void
	copyFileOrDirectory(from: string, to: string, options?: ICpOptions): void

	// Утилиты
	getCurrentPath(): string
	exists(path: string): boolean
	isFile(path: string): boolean
	isDirectory(path: string): boolean

	// Экспорт файловой системы
	toXML(): string
}
