import { VFSFormatError, VFSLoadingError } from './errors/vfs-error'
import { VFSDirectoryNode, VFSNode, VFSFileNode } from './vfs'

export default class VFSParser {
	public static parseXML(xmlContent: string): VFSDirectoryNode {
		try {
			const parser = new DOMParser()
			const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')

			const parseError = xmlDoc.getElementsByTagName('parsererror')[0]
			if (parseError) throw new VFSFormatError('invalid XML structure')

			const rootElement = xmlDoc.documentElement
			if (rootElement.nodeName !== 'vfs')
				throw new VFSFormatError('root element must be <vfs>')

			const childElements = rootElement.children

			const rootNode = {
				name: rootElement.getAttribute('name'),
				type: 'directory',
				children: [],
			} as VFSDirectoryNode
			for (let i = 0; i < childElements.length; i++) {
				const childNode = this.parseVFSNode(childElements[i])
				rootNode.children.push(childNode)
			}

			return rootNode
		} catch (error) {
			if (error instanceof VFSFormatError) throw error
			throw new VFSLoadingError(`XML parsing failed: ${(error as Error).message}`)
		}
	}

	public static parseVFSNode(element: Element): VFSNode {
		const name = element.getAttribute('name')
		if (!name) throw new VFSFormatError('node must have a name attribute')

		const type = element.getAttribute('type')
		if (type !== 'file' && type !== 'directory')
			throw new VFSFormatError('node must have type "file" or "directory"')

		let node = { name, type } as VFSNode
		if (type === 'file') {
			const contentElement = element.getElementsByTagName('content')[0]
			if (!contentElement)
				throw new VFSFormatError('file node must have <conent> element')
			const encoding = contentElement.getAttribute('encoding')
			let content = contentElement.textContent || ''
			if (encoding === 'base64')
				try {
					content = atob(content)
				} catch (error) {
					throw new VFSFormatError('invalid base64 encoding')
				}
			else if (encoding && encoding !== 'text')
				throw new VFSFormatError(`unsupported encoding: ${encoding}`)

			node = { ...node, content } as VFSFileNode
		} else {
			node = { ...node, children: [] } as VFSDirectoryNode
			const childElements = element.children

			for (let i = 0; i < childElements.length; i++) {
				const childNode = this.parseVFSNode(childElements[i])
				node.children.push(childNode)
			}
		}

		return node
	}
}
