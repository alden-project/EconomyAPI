export interface IEconomyService {
	/**
	 * Get the current balance of a user.
	 * @param userId The user's ID.
	 * @returns Current balance (defaults to 0 if no data exists).
	 */
	getBalance(userId: string): number;

	/**
	 * Set the absolute balance for a user.
	 * @param userId The user's ID.
	 * @param amount New balance (must be >= 0).
	 * @returns true if successful, false if amount is invalid.
	 */
	setBalance(userId: string, amount: number): boolean;

	/**
	 * Add funds to a user's account.
	 * @param userId The user's ID.
	 * @param amount Amount to add (must be > 0).
	 * @returns Balance after addition.
	 */
	addBalance(userId: string, amount: number): number;

	/**
	 * Deduct funds from a user's account.
	 * @param userId The user's ID.
	 * @param amount Amount to deduct (must be > 0).
	 * @returns Balance after deduction, or false if insufficient funds.
	 */
	reduceBalance(userId: string, amount: number): number | false;

	/**
	 * Transfer funds between two users.
	 * @param fromUserId Sender's ID.
	 * @param toUserId Receiver's ID.
	 * @param amount Amount to transfer (must be > 0).
	 * @returns true if successful, false if sender has insufficient funds.
	 */
	transfer(fromUserId: string, toUserId: string, amount: number): boolean;

	/**
	 * Get the top richest users leaderboard.
	 * @param limit Number of entries to return (default 10).
	 */
	getTop(limit?: number): Array<{ userId: string; balance: number }>;
}
