import path from 'node:path';
import { I18nManager, PluginBase } from '@/api';
import { EconomyService } from './EconomyService';
import { EcoCommand } from './commands/EcoCommand';
import type { IEconomyService } from './types';

export default class Main extends PluginBase {
	private economyService!: EconomyService;

	public getEconomyService(): EconomyService {
		return this.economyService;
	}

	public async onLoad(): Promise<void> {
		this.economyService = new EconomyService(this);
		await this.economyService.load();
	}

	public async onEnable(): Promise<void> {
		await this.saveResources(['locales/vi.json', 'locales/en.json']);

		this.i18n = new I18nManager(
			path.join(this.dataFolder, 'locales'),
			this.bot.config.LANGUAGE,
		);
		await this.i18n.loadLocales();

		this.registerService<IEconomyService>('economy', this.economyService);
		this.registerCommand(new EcoCommand(this));

		this.logger.info('EconomyAPI has been loaded and registered.');

		this.scheduleTask('*/5 * * * *', async () => {
			await this.economyService.save();
		});
	}

	public async onDisable(): Promise<void> {
		await this.economyService.save();
		this.logger.info('Economy data saved successfully.');
	}
}
