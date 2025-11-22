export class VFSError extends Error {
	constructor(message: string) {
		super(message)
		this.name = 'VFSError'
	}
}

export class VFSLoadingError extends VFSError {
	constructor(message: string) {
		super(message)
		this.name = 'VFSLoadingError'
	}
}

export class VFSFormatError extends VFSLoadingError {
	constructor(expectedFormat: string) {
		super(`expected ${expectedFormat}`)
		this.name = 'VFSFormatError'
	}
}

export class VFSFileOrDirectoryNotFound extends VFSError {
	constructor(path: string) {
		super(`no such file or directory: ${path}`)
	}
}

export class VFSFileNotFound extends VFSError {
	constructor(path: string) {
		super(`no such file: ${path}`)
	}
}

export class VFSFileAlreadyExists extends VFSError {
	constructor(path: string) {
		super(`file already exists: ${path}`)
	}
}

export class VFSDirectoryNotFound extends VFSError {
	constructor(path: string) {
		super(`no such directory: ${path}`)
	}
}

export class VFSDirectoryAlreadyExists extends VFSError {
	constructor(path: string) {
		super(`directory already exists: ${path}`)
	}
}

export class VFSFileOrDirectoryAlreadyExists extends VFSError {
	constructor(path: string) {
		super(`file or directory already exists: ${path}`)
	}
}

export class VFSDirectoryIsBusy extends VFSError {
	constructor(path: string) {
		super(`directory is busy: ${path}`)
	}
}

export class VFSPathEscapesRoot extends VFSError {
	constructor() {
		super('path escapes root')
		this.name = 'VFSPathEscapesRoot'
	}
}

export class VFSInvalidPath extends VFSError {
	constructor(path: string) {
		super(`invalid path: ${path}`)
		this.name = 'VFSInvalidPath'
	}
}
