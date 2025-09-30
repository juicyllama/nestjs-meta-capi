import { MetaCapiService } from './capi.service'
import { MetaCapiConfig } from './capi.types'

describe('MetaCapiService', () => {
	let service: MetaCapiService

	beforeEach(async () => {
		const config: MetaCapiConfig = {
			pixelId: 'test-pixel',
			accessToken: 'test-token',
		}
		service = new MetaCapiService(config)
	})

	it('should be defined', () => {
		expect(service).toBeDefined()
	})

	it('should track page view', async () => {
		const eventData = {
			em: 'test@example.com',
			event_source_url: 'https://example.com',
		}
		// Mock axios
		const mockPost = jest.fn().mockResolvedValue({ status: 200, data: {} })
		service['httpClient'].post = mockPost

		await service.trackPageView(eventData)
		expect(mockPost).toHaveBeenCalledWith('/test-pixel/events', expect.any(Object))
	})

	// Add more tests for other methods
})
