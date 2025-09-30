import { MetaCapiService } from './capi.service'
import { MetaCapiConfig } from './capi.types'
import { DynamicModule, Global, Module } from '@nestjs/common'

@Global()
@Module({})
export class MetaCapiModule {
	static forRoot(config: MetaCapiConfig): DynamicModule {
		return {
			module: MetaCapiModule,
			providers: [
				{
					provide: MetaCapiService,
					useValue: new MetaCapiService(config),
				},
			],
			exports: [MetaCapiService],
		}
	}

	static forRootAsync(configProvider: any): DynamicModule {
		return {
			module: MetaCapiModule,
			providers: [
				{
					provide: MetaCapiService,
					useFactory: (config: MetaCapiConfig) => new MetaCapiService(config),
					inject: [configProvider],
				},
			],
			exports: [MetaCapiService],
		}
	}
}
