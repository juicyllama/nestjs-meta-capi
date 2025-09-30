import { META_CAPI_CONFIG_TOKEN } from './capi.tokens'
import { MetaCapiConfig, MetaCapiEventData, MetaCapiUserData, MetaCapiCustomData, MetaCapiResponse } from './capi.types'
import { HttpService } from '@nestjs/axios'
import { Injectable, Inject, Logger } from '@nestjs/common'
import { createHash, randomUUID } from 'crypto'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class MetaCapiService {
	private readonly logger = new Logger(MetaCapiService.name)

	constructor(
		private readonly httpService: HttpService,
		@Inject(META_CAPI_CONFIG_TOKEN) private readonly config: MetaCapiConfig,
	) {
		this.logger.log(
			`MetaCapiService created with pixelId: ${config.pixelId}, accessToken: ${
				config.accessToken ? '***' + config.accessToken.slice(-4) : 'undefined'
			}`,
		)
	}

	private hash(data: string): string {
		return createHash('sha256').update(data).digest('hex')
	}

	private normalizeUserData(eventData: MetaCapiEventData): MetaCapiUserData {
		const userData: MetaCapiUserData = {}
		if (eventData.em) userData.em = this.hash(eventData.em.toLowerCase().trim())
		if (eventData.ph) userData.ph = this.hash(eventData.ph.replace(/\D/g, ''))
		if (eventData.fn) userData.fn = this.hash(eventData.fn.toLowerCase().trim())
		if (eventData.ln) userData.ln = this.hash(eventData.ln.toLowerCase().trim())
		if (eventData.ct) userData.ct = this.hash(eventData.ct.toLowerCase().trim())
		if (eventData.st) userData.st = this.hash(eventData.st.toLowerCase().trim())
		if (eventData.country) userData.country = this.hash(eventData.country.toUpperCase())
		if (eventData.zp) userData.zp = this.hash(eventData.zp)

		if (eventData.ge) userData.ge = eventData.ge
		if (eventData.external_id) userData.external_id = eventData.external_id
		if (eventData.fbc) userData.fbc = eventData.fbc
		if (eventData.fbp) userData.fbp = eventData.fbp
		if (eventData.client_ip_address) userData.client_ip_address = eventData.client_ip_address
		if (eventData.userAgent) userData.client_user_agent = eventData.userAgent

		return userData
	}

	private generateEventId(): string {
		return randomUUID()
	}

	private async sendEvent(eventName: string, eventData: MetaCapiEventData, test_event_code?: string) {
		const { pixelId, accessToken } = this.config
		const userData = this.normalizeUserData(eventData)

		const customData: MetaCapiCustomData = {}
		if (eventData.value) customData.value = eventData.value
		if (eventData.currency) customData.currency = eventData.currency
		if (eventData.orderId) customData.order_id = eventData.orderId
		if (eventData.content_ids) customData.content_ids = eventData.content_ids
		if (eventData.content_name) customData.content_name = eventData.content_name
		if (eventData.content_type) customData.content_type = eventData.content_type
		if (eventData.contents) customData.contents = eventData.contents
		if (eventData.num_items) customData.num_items = eventData.num_items

		const payload = {
			data: [
				{
					action_source: 'website',
					event_id: eventData.event_id || this.generateEventId(),
					event_name: eventName,
					event_time: Math.floor(Date.now() / 1000),
					user_data: userData,
					custom_data: customData,
					event_source_url: eventData.event_source_url,
				},
			],
			test_event_code,
		}

		try {
			const formData = new URLSearchParams()
			formData.append('data', JSON.stringify(payload.data))
			if (payload.test_event_code) {
				formData.append('test_event_code', payload.test_event_code)
			}

			const response = this.httpService.post<MetaCapiResponse>(
				`https://graph.facebook.com/v23.0/${pixelId}/events?access_token=${accessToken}`,
				formData.toString(),
				{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
			)

			const data = await firstValueFrom(response)
			this.logger.log(`Event ${eventName} sent successfully: ${JSON.stringify(data.data)}`)
			return data.data
		} catch (error) {
			this.logger.error(`Error sending event ${eventName}: ${(error as Error).message}`)
			throw error
		}
	}

	// event helpers
	trackPageView(eventData: MetaCapiEventData) {
		return this.sendEvent('PageView', eventData)
	}
	trackLead(eventData: MetaCapiEventData) {
		return this.sendEvent('Lead', eventData)
	}
	trackViewContent(eventData: MetaCapiEventData) {
		return this.sendEvent('ViewContent', eventData)
	}
	trackAddToCart(eventData: MetaCapiEventData) {
		return this.sendEvent('AddToCart', eventData)
	}
	trackInitiateCheckout(eventData: MetaCapiEventData) {
		return this.sendEvent('InitiateCheckout', eventData)
	}
	trackPurchase(eventData: MetaCapiEventData) {
		return this.sendEvent('Purchase', eventData)
	}
	trackUpsellPurchase(eventData: MetaCapiEventData) {
		return this.sendEvent('UpsellPurchase', eventData)
	}
	trackRebillSuccess(eventData: MetaCapiEventData) {
		return this.sendEvent('RebillSuccess', eventData)
	}
	trackSubscribe(eventData: MetaCapiEventData) {
		return this.sendEvent('Subscribe', eventData)
	}
	trackAddPaymentInfo(eventData: MetaCapiEventData) {
		return this.sendEvent('AddPaymentInfo', eventData)
	}
	testEvent(eventData: MetaCapiEventData, test_event_code: string) {
		return this.sendEvent('TestEvent', eventData, test_event_code)
	}
}
