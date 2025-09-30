import { MetaCapiService } from '../capi/capi.service'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SandboxService {
	private readonly logger = new Logger(SandboxService.name)

	constructor(private readonly metaCapiService: MetaCapiService) {
		this.logger.log(`MetaCapiService injected: ${!!this.metaCapiService}`)
	}

	async sendTestEvent() {
		this.logger.log('Sending test event...')
		const res = await this.metaCapiService.testEvent(
			{
				em: '<USER_EMAIL>',
			},
			'TEST47858',
		)
		this.logger.log('Test event sent.', JSON.stringify(res))
		return res
	}

	async sendTestEventToDifferentPixel() {
		this.logger.log('Sending test event to secondary pixel...')
		const res = await this.metaCapiService.testEvent(
			{
				em: '<USER_EMAIL>',
			},
			'TEST47858',
			'secondary',
		)
		this.logger.log('Test event sent to secondary pixel.', JSON.stringify(res))
		return res
	}
}
