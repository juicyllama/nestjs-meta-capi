import { MetaCapiService } from '../capi/capi.service'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SandboxService {
	private readonly logger = new Logger(SandboxService.name)

	constructor(private readonly metaCapiService: MetaCapiService) {
		this.logger.log(`MetaCapiService injected: ${!!this.metaCapiService}`)
	}

	// Example: Track a PageView event
	// await this.metaCapiService.trackPageView({ em: '<USER_EMAIL>' })

	// Example: Track a Lead event
	// await this.metaCapiService.trackLead({ em: '<USER_EMAIL>' })

	// Example: Track a ViewContent event
	// await this.metaCapiService.trackViewContent({ em: '<USER_EMAIL>', content_ids: ['123'], content_name: 'Product Name', content_type: 'product' })

	// Example: Track an AddToCart event
	// await this.metaCapiService.trackAddToCart({ em: '<USER_EMAIL>', content_ids: ['123'], value: 29.99, currency: 'USD' })

	// Example: Track an InitiateCheckout event
	// await this.metaCapiService.trackInitiateCheckout({ em: '<USER_EMAIL>', value: 59.99, currency: 'USD', num_items: 2 })

	// Example: Track a Purchase event
	// await this.metaCapiService.trackPurchase({ em: '<USER_EMAIL>', value: 99.99, currency: 'USD', orderId: 'ORDER123' })

	// Example: Track an UpsellPurchase event
	// await this.metaCapiService.trackUpsellPurchase({ em: '<USER_EMAIL>', value: 19.99, currency: 'USD', orderId: 'ORDER124' })

	// Example: Track a RebillSuccess event
	// await this.metaCapiService.trackRebillSuccess({ em: '<USER_EMAIL>', value: 9.99, currency: 'USD', orderId: 'ORDER125' })

	// Example: Track a Subscribe event
	// await this.metaCapiService.trackSubscribe({ em: '<USER_EMAIL>', value: 49.99, currency: 'USD' })

	// Example: Track an AddPaymentInfo event
	// await this.metaCapiService.trackAddPaymentInfo({ em: '<USER_EMAIL>' })

	async sendTestEvent() {
		this.logger.log('Sending test event...')
		const res = await this.metaCapiService.trackPageView(
			{
				em: '<USER_EMAIL>',
			},
			'default',
			'TEST61141',
		)
		this.logger.log('Test event sent.', JSON.stringify(res))
		return res
	}

	async sendTestEventToDifferentPixel() {
		this.logger.log('Sending test event to secondary pixel...')
		const res = await this.metaCapiService.trackPageView(
			{
				em: '<USER_EMAIL>',
			},
			'secondary',
			'TEST61141',
		)
		this.logger.log('Test event sent to secondary pixel.', JSON.stringify(res))
		return res
	}
}
