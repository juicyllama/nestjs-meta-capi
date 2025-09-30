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
			pixels: {
				default: {
					pixelId: process.env.META_PIXEL_ID || 'test_pixel_id',
					accessToken: process.env.FACEBOOK_ACCESS_TOKEN || 'test_token',
				},
				secondary: {
					pixelId: process.env.META_PIXEL_ID_2 || 'test_pixel_id_2',
					accessToken: process.env.FACEBOOK_ACCESS_TOKEN_2 || 'test_token_2',
				},
			},
			defaultPixel: 'default',
		}),
	],
	providers: [SandboxService],
	controllers: [SandboxController],
	exports: [],
})
export class SandboxModule {}
