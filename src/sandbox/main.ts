//import 'module-alias/register'
import { SandboxModule } from './sandbox.module'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import 'reflect-metadata'

async function bootstrap() {
	const app = await NestFactory.create(SandboxModule, {
		cors: true,
	})

	const configService = app.get(ConfigService)
	await app.listen(configService.get('PORT') ?? 3000)
}

try {
	bootstrap()
} catch (err) {
	const e = err as Error
	console.error(`Error during bootstrap: ${e.message}`)
}
