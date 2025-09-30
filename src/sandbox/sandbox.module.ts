import { MetaCapiModule } from '../capi/capi.module'
import { SandboxController } from './sandbox.controller'
import { SandboxService } from './sandbox.service'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: '.env',
		}),
		MetaCapiModule.forRoot({
			pixelId: process.env.META_PIXEL_ID || 'test_pixel_id',
			accessToken: process.env.FACEBOOK_ACCESS_TOKEN || 'test_token',
		}),
	],
	providers: [SandboxService],
	controllers: [SandboxController],
	exports: [],
})
export class SandboxModule {}
