import { MetaCapiService } from './capi.service'
import { META_CAPI_CONFIG_TOKEN } from './capi.tokens'
import { MetaCapiConfig } from './capi.types'
import { HttpModule } from '@nestjs/axios'
import { DynamicModule, Global, Module } from '@nestjs/common'

@Global()
@Module({})
export class MetaCapiModule {
	static forRoot(config: MetaCapiConfig): DynamicModule {
		return {
			module: MetaCapiModule,
			imports: [HttpModule],
			providers: [MetaCapiService, { provide: META_CAPI_CONFIG_TOKEN, useValue: config }],
			exports: [MetaCapiService],
		}
	}

	static forRootAsync(options: {
		inject: any[]
		useFactory: (...args: any[]) => Promise<MetaCapiConfig> | MetaCapiConfig
	}): DynamicModule {
		return {
			module: MetaCapiModule,
			imports: [HttpModule],
			providers: [
				MetaCapiService,
				{ provide: META_CAPI_CONFIG_TOKEN, useFactory: options.useFactory, inject: options.inject },
			],
			exports: [MetaCapiService],
		}
	}
}
