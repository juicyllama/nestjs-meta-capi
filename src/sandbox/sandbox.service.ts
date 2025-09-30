import { MetaCapiService } from '../capi/capi.service'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SandboxService {
	private readonly logger = new Logger(SandboxService.name)

	constructor(private readonly metaCapiService: MetaCapiService) {}

	async run(): Promise<any> {
		// Test the service
		try {
			await this.metaCapiService.trackPageView({
				em: 'test@example.com',
				event_source_url: 'https://example.com',
			})
			this.logger.log('Page view tracked')
			return { status: 'success' }
		} catch (error) {
			this.logger.error('Error tracking page view', error)
			return { status: 'error', message: (error as Error).message }
		}
	}
}
