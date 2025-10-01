/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { MetaCapiService } from './capi.service'
import { META_CAPI_CONFIG_TOKEN } from './capi.tokens'
import { MetaCapiConfig, MetaCapiEventData, MetaCapiResponse } from './capi.types'
import { HttpService } from '@nestjs/axios'
import { Test, TestingModule } from '@nestjs/testing'
import { AxiosResponse } from 'axios'
import { of, throwError } from 'rxjs'

describe('MetaCapiService', () => {
	let service: MetaCapiService
	let httpService: jest.Mocked<HttpService>

	const mockConfig: MetaCapiConfig = {
		pixels: {
			default: {
				pixelId: '123456789',
				accessToken: 'test-access-token',
			},
			secondary: {
				pixelId: '987654321',
				accessToken: 'secondary-access-token',
			},
		},
		defaultPixel: 'default',
	}

	const mockEventData: MetaCapiEventData = {
		em: 'test@example.com',
		ph: '+1234567890',
		fn: 'John',
		ln: 'Doe',
		ct: 'New York',
		st: 'NY',
		country: 'US',
		zp: '10001',
		ge: 'M',
		external_id: 'ext123',
		value: 99.99,
		currency: 'USD',
		orderId: 'order123',
		content_ids: ['content1', 'content2'],
		content_name: 'Test Product',
		content_type: 'product',
		contents: [{ id: 'content1', quantity: 1 }],
		num_items: 2,
		event_source_url: 'https://example.com',
		event_id: 'event123',
		fbc: 'fb.1.123456789',
		fbp: 'fb.1.987654321',
		userAgent: 'Mozilla/5.0',
		client_ip_address: '192.168.1.1',
	}

	const mockResponse: AxiosResponse<MetaCapiResponse> = {
		data: {
			events_received: 1,
			messages: [],
			fbtrace_id: 'trace123',
		},
		status: 200,
		statusText: 'OK',
		headers: {},
		config: {} as any,
	}

	beforeEach(async () => {
		const mockHttpService = {
			post: jest.fn(),
		}

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				MetaCapiService,
				{
					provide: HttpService,
					useValue: mockHttpService,
				},
				{
					provide: META_CAPI_CONFIG_TOKEN,
					useValue: mockConfig,
				},
			],
		}).compile()

		service = module.get<MetaCapiService>(MetaCapiService)
		httpService = module.get(HttpService)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	describe('trackPageView', () => {
		it('should send PageView event successfully', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackPageView(mockEventData)

			expect(httpService.post).toHaveBeenCalledWith(
				'https://graph.facebook.com/v23.0/123456789/events?access_token=test-access-token',
				expect.any(String),
				{ headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
			)
			expect(result).toEqual(mockResponse.data)
		})

		it('should use custom pixel key', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			await service.trackPageView(mockEventData, 'secondary')

			expect(httpService.post).toHaveBeenCalledWith(
				'https://graph.facebook.com/v23.0/987654321/events?access_token=secondary-access-token',
				expect.any(String),
				expect.any(Object),
			)
		})

		it('should throw error for invalid pixel key', async () => {
			await expect(service.trackPageView(mockEventData, 'invalid')).rejects.toThrow(
				'Pixel configuration not found for key: invalid',
			)
		})

		it('should handle HTTP error', async () => {
			const error = new Error('HTTP Error')
			httpService.post.mockReturnValue(throwError(() => error))

			await expect(service.trackPageView(mockEventData)).rejects.toThrow('HTTP Error')
		})
	})

	describe('trackLead', () => {
		it('should send Lead event', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackLead(mockEventData)

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('trackViewContent', () => {
		it('should send ViewContent event', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackViewContent(mockEventData)

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('trackAddToCart', () => {
		it('should send AddToCart event', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackAddToCart(mockEventData)

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('trackInitiateCheckout', () => {
		it('should send InitiateCheckout event', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackInitiateCheckout(mockEventData)

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('trackPurchase', () => {
		it('should send Purchase event', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackPurchase(mockEventData)

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('trackUpsellPurchase', () => {
		it('should send UpsellPurchase event', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackUpsellPurchase(mockEventData)

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('trackRebillSuccess', () => {
		it('should send RebillSuccess event', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackRebillSuccess(mockEventData)

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('trackSubscribe', () => {
		it('should send Subscribe event', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackSubscribe(mockEventData)

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('trackAddPaymentInfo', () => {
		it('should send AddPaymentInfo event', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.trackAddPaymentInfo(mockEventData)

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})
	})

	describe('testEvent', () => {
		it('should send test event with test_event_code', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			const result = await service.testEvent(mockEventData, 'test123')

			expect(httpService.post).toHaveBeenCalled()
			expect(result).toEqual(mockResponse.data)
		})

		it('should include test_event_code in form data', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			await service.testEvent(mockEventData, 'test123')

			const callArgs = httpService.post.mock.calls[0]
			const formDataString = callArgs[1] as string
			expect(formDataString).toContain('test_event_code=test123')
		})
	})

	describe('data normalization', () => {
		it('should hash email correctly', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			await service.trackPageView({ em: 'Test@Example.COM' })

			const callArgs = httpService.post.mock.calls[0]
			const formDataString = callArgs[1] as string
			const payload = JSON.parse(new URLSearchParams(formDataString).get('data') || '[]')[0]

			// SHA256 hash of 'test@example.com'
			expect(payload.user_data.em).toBe('973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b')
		})

		it('should hash phone correctly', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			await service.trackPageView({ ph: '+1 (234) 567-8901' })

			const callArgs = httpService.post.mock.calls[0]
			const formDataString = callArgs[1] as string
			const payload = JSON.parse(new URLSearchParams(formDataString).get('data') || '[]')[0]

			// SHA256 hash of '12345678901'
			expect(payload.user_data.ph).toBe('254aa248acb47dd654ca3ea53f48c2c26d641d23d7e2e93a1ec56258df7674c4')
		})

		it('should hash names correctly', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			await service.trackPageView({ fn: 'JOHN', ln: 'DOE' })

			const callArgs = httpService.post.mock.calls[0]
			const formDataString = callArgs[1] as string
			const payload = JSON.parse(new URLSearchParams(formDataString).get('data') || '[]')[0]

			expect(payload.user_data.fn).toBe('96d9632f363564cc3032521409cf22a852f2032eec099ed5967c0d000cec607a')
			expect(payload.user_data.ln).toBe('799ef92a11af918e3fb741df42934f3b568ed2d93ac1df74f1b8d41a27932a6f')
		})

		it('should handle custom event_id', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			await service.trackPageView({ event_id: 'custom-event-123' })

			const callArgs = httpService.post.mock.calls[0]
			const formDataString = callArgs[1] as string
			const payload = JSON.parse(new URLSearchParams(formDataString).get('data') || '[]')[0]

			expect(payload.event_id).toBe('custom-event-123')
		})

		it('should generate event_id if not provided', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			await service.trackPageView({})

			const callArgs = httpService.post.mock.calls[0]
			const formDataString = callArgs[1] as string
			const payload = JSON.parse(new URLSearchParams(formDataString).get('data') || '[]')[0]

			expect(payload.event_id).toBeDefined()
			expect(typeof payload.event_id).toBe('string')
		})

		it('should set event_time to current timestamp', async () => {
			const beforeTime = Math.floor(Date.now() / 1000)
			httpService.post.mockReturnValue(of(mockResponse))

			await service.trackPageView({})

			const afterTime = Math.floor(Date.now() / 1000)
			const callArgs = httpService.post.mock.calls[0]
			const formDataString = callArgs[1] as string
			const payload = JSON.parse(new URLSearchParams(formDataString).get('data') || '[]')[0]

			expect(payload.event_time).toBeGreaterThanOrEqual(beforeTime)
			expect(payload.event_time).toBeLessThanOrEqual(afterTime)
		})

		it('should include custom_data correctly', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			await service.trackPurchase({
				value: 199.99,
				currency: 'EUR',
				orderId: 'order456',
				content_ids: ['prod1'],
				content_name: 'Premium Product',
				content_type: 'product',
				num_items: 1,
			})

			const callArgs = httpService.post.mock.calls[0]
			const formDataString = callArgs[1] as string
			const payload = JSON.parse(new URLSearchParams(formDataString).get('data') || '[]')[0]

			expect(payload.custom_data.value).toBe(199.99)
			expect(payload.custom_data.currency).toBe('EUR')
			expect(payload.custom_data.order_id).toBe('order456')
			expect(payload.custom_data.content_ids).toEqual(['prod1'])
			expect(payload.custom_data.content_name).toBe('Premium Product')
			expect(payload.custom_data.content_type).toBe('product')
			expect(payload.custom_data.num_items).toBe(1)
		})

		it('should handle partial user data', async () => {
			httpService.post.mockReturnValue(of(mockResponse))

			await service.trackPageView({ em: 'user@test.com' })

			const callArgs = httpService.post.mock.calls[0]
			const formDataString = callArgs[1] as string
			const payload = JSON.parse(new URLSearchParams(formDataString).get('data') || '[]')[0]

			expect(payload.user_data.em).toBeDefined()
			expect(payload.user_data.ph).toBeUndefined()
		})
	})

	describe('configuration handling', () => {
		it('should use first pixel as default when no defaultPixel specified', async () => {
			const configWithoutDefault: MetaCapiConfig = {
				pixels: {
					first: {
						pixelId: '111111111',
						accessToken: 'first-token',
					},
					second: {
						pixelId: '222222222',
						accessToken: 'second-token',
					},
				},
			}

			const module: TestingModule = await Test.createTestingModule({
				providers: [
					MetaCapiService,
					{
						provide: HttpService,
						useValue: httpService,
					},
					{
						provide: META_CAPI_CONFIG_TOKEN,
						useValue: configWithoutDefault,
					},
				],
			}).compile()

			const serviceWithoutDefault = module.get<MetaCapiService>(MetaCapiService)
			httpService.post.mockReturnValue(of(mockResponse))

			await serviceWithoutDefault.trackPageView(mockEventData)

			expect(httpService.post).toHaveBeenCalledWith(
				'https://graph.facebook.com/v23.0/111111111/events?access_token=first-token',
				expect.any(String),
				expect.any(Object),
			)
		})
	})
})
