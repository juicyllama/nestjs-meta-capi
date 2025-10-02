import { META_CAPI_CONFIG_TOKEN } from './capi.tokens'
import { MetaCapiConfig, MetaCapiEventData, MetaCapiUserData, MetaCapiCustomData, MetaCapiResponse } from './capi.types'
import { HttpService } from '@nestjs/axios'
import { Injectable, Inject, Logger } from '@nestjs/common'
import { createHash, randomUUID } from 'crypto'
import { firstValueFrom } from 'rxjs'

@Injectable()
export class MetaCapiService {
	private readonly logger = new Logger(MetaCapiService.name)
	private readonly API_VERSION = 'v23.0'
	private readonly GRAPH_API_URL = `https://graph.facebook.com/${this.API_VERSION}`

	constructor(
		private readonly httpService: HttpService,
		@Inject(META_CAPI_CONFIG_TOKEN) private readonly config: MetaCapiConfig,
	) {
		const pixelKeys = Object.keys(config.pixels)
		this.logger.log(
			`MetaCapiService created with pixels: ${pixelKeys.join(', ')}, default: ${config.defaultPixel || pixelKeys[0]}`,
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

	private async sendEvent(
		eventName: string,
		eventData: MetaCapiEventData,
		test_event_code?: string,
		pixelKey?: string,
	) {
		const pixelKeyToUse = pixelKey || this.config.defaultPixel || Object.keys(this.config.pixels)[0]
		const pixelConfig = this.config.pixels[pixelKeyToUse]

		if (!pixelConfig) {
			throw new Error(`Pixel configuration not found for key: ${pixelKeyToUse}`)
		}

		const { pixelId, accessToken } = pixelConfig
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
				`${this.GRAPH_API_URL}/${pixelId}/events?access_token=${accessToken}`,
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
	trackPageView(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('PageView', eventData, test_event_code, pixelKey)
	}
	trackLead(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('Lead', eventData, test_event_code, pixelKey)
	}
	trackViewContent(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('ViewContent', eventData, test_event_code, pixelKey)
	}
	trackAddToCart(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('AddToCart', eventData, test_event_code, pixelKey)
	}
	trackInitiateCheckout(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('InitiateCheckout', eventData, test_event_code, pixelKey)
	}
	trackPurchase(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('Purchase', eventData, test_event_code, pixelKey)
	}
	trackUpsellPurchase(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('UpsellPurchase', eventData, test_event_code, pixelKey)
	}
	trackRebillSuccess(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('RebillSuccess', eventData, test_event_code, pixelKey)
	}
	trackSubscribe(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('Subscribe', eventData, test_event_code, pixelKey)
	}
	trackAddPaymentInfo(eventData: MetaCapiEventData, pixelKey?: string, test_event_code?: string) {
		return this.sendEvent('AddPaymentInfo', eventData, test_event_code, pixelKey)
	}
}
