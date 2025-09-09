import { VFSError, VFSFormatError, VFSLoadingError } from './vfs-error'

function isErrorWithCode(error: unknown): error is Error & { code: string } {
	return (
		error instanceof Error && 'code' in error && typeof (error as any).code === 'string'
	)
}

export const getErrorMessage = (error: unknown): string => {
	let errorMessage = String(error)

	if (errorMessage.includes('Error invoking remote method'))
		return errorMessage.split(':').slice(2).join(':').trim()

	if (error instanceof VFSFormatError) return `Wrong VFS file format: ${error.message}`
	if (error instanceof VFSLoadingError) return `VFS loading error: ${error.message}`
	if (error instanceof VFSError) return `VFS error: ${error.message}`
	if (error instanceof Error) return `Error: ${error.message}`
	else return `Unknown error: ${error}`
}
