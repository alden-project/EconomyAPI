import path from 'node:path';
import { readJsonFileAsync, writeJsonFileAsync, type PluginBase } from '@/api';
import type { IEconomyService } from './types';

// Data structure: Record<userId, balance>
type EconomyData = Record<string, number>;

export class EconomyService implements IEconomyService {
	private data: EconomyData = {};
	private readonly dataPath: string;
	private isLoaded = false;

	constructor(private readonly plugin: PluginBase) {
		this.dataPath = path.join(plugin.dataFolder, 'economy.json');
	}

	public async load(): Promise<void> {
		try {
			const loadedData = await readJsonFileAsync<EconomyData>(this.dataPath);
			if (loadedData) {
				this.data = loadedData;
			}
			this.isLoaded = true;
			this.plugin.logger.info(
				`Loaded economy data for ${Object.keys(this.data).length} users.`,
			);
		} catch (error) {
			this.plugin.logger.error('Failed to load economy data', error);
			throw error;
		}
	}

	public async save(): Promise<void> {
		if (!this.isLoaded) return;
		try {
			await writeJsonFileAsync(this.dataPath, this.data);
		} catch (error) {
			this.plugin.logger.error('Failed to save economy data', error);
			throw error;
		}
	}

	public getBalance(userId: string): number {
		return this.data[userId] ?? 0;
	}

	public setBalance(userId: string, amount: number): boolean {
		if (amount < 0) return false;
		this.data[userId] = amount;
		return true;
	}

	public addBalance(userId: string, amount: number): number {
		if (amount <= 0) return this.getBalance(userId);

		const current = this.getBalance(userId);
		const newBalance = current + amount;
		this.data[userId] = newBalance;
		return newBalance;
	}

	public reduceBalance(userId: string, amount: number): number | false {
		if (amount <= 0) return false;

		const current = this.getBalance(userId);
		if (current < amount) return false;

		const newBalance = current - amount;
		this.data[userId] = newBalance;
		return newBalance;
	}

	public transfer(fromUserId: string, toUserId: string, amount: number): boolean {
		if (amount <= 0 || fromUserId === toUserId) return false;

		const fromBalance = this.getBalance(fromUserId);
		if (fromBalance < amount) return false;

		// Deduct from sender
		this.data[fromUserId] = fromBalance - amount;

		// Add to receiver
		const toBalance = this.getBalance(toUserId);
		this.data[toUserId] = toBalance + amount;

		return true;
	}

	public getTop(limit: number = 10): Array<{ userId: string; balance: number }> {
		return Object.entries(this.data)
			.map(([userId, balance]) => ({ userId, balance }))
			.sort((a, b) => b.balance - a.balance)
			.slice(0, limit);
	}
}
