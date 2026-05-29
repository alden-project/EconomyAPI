import { CommandBase, CommandContext } from '@/api';
import type Main from '../main';

export class EcoCommand extends CommandBase {
	public constructor(private readonly plugin: Main) {
		super({
			name: 'eco',
			description: 'eco.desc',
			aliases: ['economy', 'money'],
			usage: 'eco.usage',
			permission: 'economy.admin',
		});
	}

	public async execute(ctx: CommandContext): Promise<void> {
		const action = ctx.args[0]?.toLowerCase();

		switch (action) {
			case 'give':
				await this.handleGive(ctx);
				break;
			case 'take':
				await this.handleTake(ctx);
				break;
			case 'set':
				await this.handleSet(ctx);
				break;
			case 'check':
				await this.handleCheck(ctx);
				break;
			case 'top':
				await this.handleTop(ctx);
				break;
			case 'reset':
				await this.handleReset(ctx);
				break;
			default:
				await this.sendHelp(ctx);
				break;
		}
	}

	private async handleGive(ctx: CommandContext): Promise<void> {
		const { targetUids, cleanArgs } = ctx.parseArgs(1);
		const targetUid = targetUids[0];
		const amount = cleanArgs[0] ? parseInt(cleanArgs[0], 10) : NaN;

		if (!targetUid || isNaN(amount) || amount <= 0 || cleanArgs.length !== 1) {
			await ctx.reply(ctx.t('eco.give.usage'));
			return;
		}

		const economy = this.plugin.getEconomyService();
		const newBalance = economy.addBalance(targetUid, amount);
		await economy.save();
		await ctx.reply(
			ctx.t(
				'eco.give.success',
				{ amount, uid: targetUid, balance: newBalance },
			),
		);
	}

	private async handleTake(ctx: CommandContext): Promise<void> {
		const { targetUids, cleanArgs } = ctx.parseArgs(1);
		const targetUid = targetUids[0];
		const amount = cleanArgs[0] ? parseInt(cleanArgs[0], 10) : NaN;

		if (!targetUid || isNaN(amount) || amount <= 0 || cleanArgs.length !== 1) {
			await ctx.reply(ctx.t('eco.take.usage'));
			return;
		}

		const economy = this.plugin.getEconomyService();
		const result = economy.reduceBalance(targetUid, amount);
		if (result === false) {
			await ctx.reply(ctx.t('eco.take.insufficient', { uid: targetUid }));
			return;
		}

		await economy.save();
		await ctx.reply(ctx.t('eco.take.success', { amount, uid: targetUid, balance: result }));
	}

	private async handleSet(ctx: CommandContext): Promise<void> {
		const { targetUids, cleanArgs } = ctx.parseArgs(1);
		const targetUid = targetUids[0];
		const amount = cleanArgs[0] ? parseInt(cleanArgs[0], 10) : NaN;

		if (!targetUid || isNaN(amount) || amount < 0 || cleanArgs.length !== 1) {
			await ctx.reply(ctx.t('eco.set.usage'));
			return;
		}

		const economy = this.plugin.getEconomyService();
		economy.setBalance(targetUid, amount);
		await economy.save();
		await ctx.reply(ctx.t('eco.set.success', { uid: targetUid, amount }));
	}

	private async handleCheck(ctx: CommandContext): Promise<void> {
		const { targetUids } = ctx.parseArgs(1);
		const targetUid = targetUids[0] ?? ctx.message.data.uidFrom;
		const balance = this.plugin.getEconomyService().getBalance(targetUid);

		await ctx.reply(ctx.t('eco.check.result', { uid: targetUid, balance }));
	}

	private async handleTop(ctx: CommandContext): Promise<void> {
		const top = this.plugin.getEconomyService().getTop(10);

		if (top.length === 0) {
			await ctx.reply(ctx.t('eco.top.empty'));
			return;
		}

		let reply = ctx.t('eco.top.title', { count: top.length });
		for (let i = 0; i < top.length; i++) {
			const entry = top[i]!;
			reply += ctx.t(
				'eco.top.item',
				{ rank: i + 1, uid: entry.userId, balance: entry.balance },
			);
		}

		await ctx.reply(reply);
	}

	private async handleReset(ctx: CommandContext): Promise<void> {
		const { targetUids } = ctx.parseArgs(1);
		const targetUid = targetUids[0];

		if (!targetUid) {
			await ctx.reply(ctx.t('eco.reset.usage'));
			return;
		}

		const economy = this.plugin.getEconomyService();
		economy.setBalance(targetUid, 0);
		await economy.save();
		await ctx.reply(ctx.t('eco.reset.success', { uid: targetUid }));
	}

	private async sendHelp(ctx: CommandContext): Promise<void> {
		const help =
			ctx.t('eco.help.title') +
			ctx.t('eco.help.give') +
			ctx.t('eco.help.take') +
			ctx.t('eco.help.set') +
			ctx.t('eco.help.check') +
			ctx.t('eco.help.top') +
			ctx.t('eco.help.reset');

		await ctx.reply(help);
	}
}
