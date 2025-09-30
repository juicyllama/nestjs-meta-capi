export interface MetaCapiEventData {
	em?: string
	ph?: string
	fn?: string
	ln?: string
	ct?: string
	st?: string
	country?: string
	zp?: string
	ge?: string
	external_id?: string
	value?: number
	currency?: string
	orderId?: string
	content_ids?: string[]
	content_name?: string
	content_type?: string
	contents?: any[]
	num_items?: number
	event_source_url?: string
	event_id?: string
	fbc?: string
	fbp?: string
	fbclid?: string
	userAgent?: string
	client_ip_address?: string
}

export interface MetaCapiUserData {
	em?: string
	ph?: string
	fn?: string
	ln?: string
	ct?: string
	st?: string
	country?: string
	zp?: string
	ge?: string
	external_id?: string
	fbc?: string
	fbp?: string
	client_ip_address?: string
	client_user_agent?: string
}

export interface MetaCapiCustomData {
	value?: number
	currency?: string
	order_id?: string
	content_ids?: string[]
	content_name?: string
	content_type?: string
	contents?: any[]
	num_items?: number
}

export interface MetaCapiResponse {
	events_received: number
	messages: string[]
	fbtrace_id: string
}

export interface MetaCapiConfig {
	pixelId: string
	accessToken: string
}
