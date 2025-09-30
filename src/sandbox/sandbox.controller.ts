import { SandboxService } from './sandbox.service'
import { Controller, Get } from '@nestjs/common'

@Controller()
export class SandboxController {
	constructor(private readonly sandboxService: SandboxService) {}

	@Get()
	async sandbox(): Promise<any> {
		return await this.sandboxService.run()
	}
}
