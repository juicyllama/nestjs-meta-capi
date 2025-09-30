import { MetaCapiEventData, MetaCapiConfig, MetaCapiUserData, MetaCapiCustomData } from './capi.types'
import { Injectable, Logger } from '@nestjs/common'
import axios, { AxiosInstance } from 'axios'
import { createHash, randomUUID } from 'crypto'

@Injectable()
export class MetaCapiService {
	protected readonly httpClient: AxiosInstance
	private readonly logger = new Logger(MetaCapiService.name)
	private readonly pixelId: string
	private readonly accessToken: string

	constructor(config: MetaCapiConfig) {
		this.pixelId = config.pixelId
		this.accessToken = config.accessToken
		this.httpClient = axios.create({
			baseURL: 'https://graph.facebook.com/v18.0', // Use latest stable, or v10.0 for parity
			timeout: 10000,
		})
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
		if (eventData.ge) userData.ge = eventData.ge // gender as is
		if (eventData.external_id) userData.external_id = eventData.external_id
		if (eventData.fbc) userData.fbc = eventData.fbc
		if (eventData.fbp) userData.fbp = eventData.fbp
		if (eventData.client_ip_address) userData.client_ip_address = eventData.client_ip_address
		if (eventData.userAgent) userData.client_user_agent = eventData.userAgent
		return userData
	}

	private generateEventId(): string {
		// Generate a unique event ID
		return randomUUID() // For uniqueness
	}

	private async sendEvent(eventName: string, eventData: MetaCapiEventData) {
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
					event_name: eventName,
					event_time: Math.floor(Date.now() / 1000),
					event_id: eventData.event_id || this.generateEventId(),
					user_data: userData,
					custom_data: customData,
					event_source_url: eventData.event_source_url,
				},
			],
			access_token: this.accessToken,
		}

		try {
			const response = await this.httpClient.post(`/${this.pixelId}/events`, payload)
			this.logger.log(`Event ${eventName} sent successfully: ${response.status}`)
			return response.data
		} catch (error) {
			this.logger.error(`Error sending event ${eventName}: ${(error as Error).message}`)
			throw error
		}
	}

	async trackPageView(eventData: MetaCapiEventData) {
		return this.sendEvent('PageView', eventData)
	}

	async trackLead(eventData: MetaCapiEventData) {
		return this.sendEvent('Lead', eventData)
	}

	async trackViewContent(eventData: MetaCapiEventData) {
		return this.sendEvent('ViewContent', eventData)
	}

	async trackAddToCart(eventData: MetaCapiEventData) {
		return this.sendEvent('AddToCart', eventData)
	}

	async trackInitiateCheckout(eventData: MetaCapiEventData) {
		return this.sendEvent('InitiateCheckout', eventData)
	}

	async trackPurchase(eventData: MetaCapiEventData) {
		return this.sendEvent('Purchase', eventData)
	}

	async trackUpsellPurchase(eventData: MetaCapiEventData) {
		return this.sendEvent('UpsellPurchase', eventData)
	}

	async trackRebillSuccess(eventData: MetaCapiEventData) {
		return this.sendEvent('RebillSuccess', eventData)
	}

	async trackSubscribe(eventData: MetaCapiEventData) {
		return this.sendEvent('Subscribe', eventData)
	}

	async trackAddPaymentInfo(eventData: MetaCapiEventData) {
		return this.sendEvent('AddPaymentInfo', eventData)
	}
}
