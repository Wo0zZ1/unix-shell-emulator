import { VFSFormatError } from '../errors/vfs-error'
import { VFSContentEncoding, VFSDirectoryNode, VFSNode } from '../vfs'

export class VFSParser {
	public static parseXML(xmlContent: string): VFSDirectoryNode {
		const parser = new DOMParser()
		const xmlDoc = parser.parseFromString(xmlContent, 'text/xml')

		const parseError = xmlDoc.getElementsByTagName('parsererror')[0]
		if (parseError) throw new VFSFormatError('invalid XML structure')

		const rootElement = xmlDoc.documentElement
		if (rootElement.nodeName !== 'vfs')
			throw new VFSFormatError('root element must be <vfs>')

		const rootNode = this.createRootNode()

		for (const childElement of Array.from(rootElement.children)) {
			const childNode = this.parseXMLNode(childElement)
			rootNode.children.push(childNode)
		}

		return rootNode
	}

	public static createRootNode(children: VFSNode[] = []): VFSDirectoryNode {
		return {
			name: 'root',
			type: 'directory',
			children,
			metadata: {
				owner: 'root',
				permissions: 'rwxr-xr-x',
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		}
	}

	public static serializeToXML(root: VFSDirectoryNode): XMLDocument {
		const xmlDoc = document.implementation.createDocument('', '', null)
		const vfsElement = xmlDoc.createElement('vfs')
		xmlDoc.appendChild(vfsElement)

		for (const child of root.children) {
			const childXML = this.serializeNodeToXML(child)
			vfsElement.innerHTML += childXML
		}
		return xmlDoc
	}

	private static parseXMLNode(XMLNode: Element): VFSNode {
		const name = XMLNode.getAttribute('name')
		const type = XMLNode.getAttribute('type')
		const owner = XMLNode.getAttribute('owner')
		const permissions = XMLNode.getAttribute('permissions')
		const createdAtStr = XMLNode.getAttribute('createdAt')
		const updatedAtStr = XMLNode.getAttribute('updatedAt')
		const createdAt = createdAtStr ? new Date(createdAtStr) : null
		const updatedAt = updatedAtStr ? new Date(updatedAtStr) : null

		if (!name) throw new VFSFormatError('node must have a name attribute')
		if (type !== 'file' && type !== 'directory')
			throw new VFSFormatError('node must have type "file" or "directory"')
		if (!owner || !permissions || !createdAt || !updatedAt)
			throw new VFSFormatError('node is missing required metadata attributes')

		if (type === 'directory') {
			const children: VFSNode[] = Array.from(XMLNode.children)
				.map(child => this.parseXMLNode(child))
				.filter((child): child is VFSNode => child !== null)

			return {
				name,
				type: 'directory',
				children,
				metadata: {
					owner,
					permissions,
					createdAt,
					updatedAt,
				},
			}
		} else if (type === 'file') {
			const contentNode = this.getChildContentNode(XMLNode)
			if (!contentNode)
				throw new VFSFormatError('file node must have <content> child node')

			const contentEncoding = contentNode.getAttribute('encoding')
			if (contentEncoding !== 'base64' && contentEncoding !== 'utf-8')
				throw new VFSFormatError(`unsupported encoding: ${contentEncoding}`)

			let contentText =
				contentEncoding === 'base64'
					? decodeURIComponent(escape(atob(contentNode.textContent)))
					: contentNode.textContent

			return {
				name,
				type: 'file',
				content: contentText,
				metadata: {
					owner,
					permissions,
					createdAt,
					updatedAt,
				},
			}
		}

		throw new VFSFormatError('node must have type "file" or "directory"')
	}

	private static serializeNodeToXML(node: VFSNode): string {
		let nodeXML = `<node name="${node.name}" type="${node.type}" owner="${
			node.metadata.owner
		}" permissions="${
			node.metadata.permissions
		}" createdAt="${node.metadata.createdAt.toISOString()}" updatedAt="${node.metadata.updatedAt.toISOString()}">`
		if (node.type === 'file') {
			const contentEncoding: VFSContentEncoding = 'utf-8'
			const contentText = node.content
			nodeXML += `<content encoding="${contentEncoding}">${contentText}</content>`
		} else if (node.type === 'directory') {
			for (const child of node.children) nodeXML += this.serializeNodeToXML(child)
		}
		nodeXML += `</node>`
		return nodeXML
	}

	private static getChildContentNode(parent: Element): Element | null {
		const children = parent.children
		for (let i = 0; i < children.length; i++)
			if (children[i].nodeName === 'content') return children[i]
		return null
	}
}
