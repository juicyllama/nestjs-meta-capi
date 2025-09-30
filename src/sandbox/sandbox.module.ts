import { MetaCapiModule } from '../index'
import { SandboxController } from './sandbox.controller'
import { SandboxService } from './sandbox.service'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
	imports: [
		ConfigModule.forRoot(),
		MetaCapiModule.forRoot({
			pixelId: process.env.META_PIXEL_ID || 'test-pixel',
			accessToken: process.env.META_ACCESS_TOKEN || 'test-token',
		}),
	],
	controllers: [SandboxController],
	providers: [SandboxService],
	exports: [SandboxService],
})
export class SandboxModule {}
