import { createHash } from 'crypto'
import { Request } from 'express'

export class MetaCapiUtils {
	static hash(data: string): string {
		return createHash('sha256').update(data).digest('hex')
	}

	static getIpAddress(request: Request): string {
		const ip =
			(typeof request.headers['x-forwarded-for'] === 'string' && request.headers['x-forwarded-for']) ||
			(typeof request.headers['x-real-ip'] === 'string' && request.headers['x-real-ip']) ||
			(typeof request.socket.remoteAddress === 'string' && request.socket.remoteAddress) ||
			''
		return ip.split(',')[0].trim()
	}

	static getHttpUserAgent(request: Request): string {
		return request.headers['user-agent'] || ''
	}

	static getRequestUri(request: Request): string {
		return request.url || ''
	}

	static getFbp(params: { fbp?: string }): string {
		return params.fbp || ''
	}

	static getFbc(params: { fbc?: string }): string {
		return params.fbc || ''
	}
}
