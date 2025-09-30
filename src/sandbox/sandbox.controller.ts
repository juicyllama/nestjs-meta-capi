import { SandboxService } from './sandbox.service'
import { Controller, Get } from '@nestjs/common'

@Controller()
export class SandboxController {
	constructor(private readonly sandboxService: SandboxService) {}

	@Get('test-event')
	async sendTestEvent() {
		return this.sandboxService.sendTestEvent()
	}
}
