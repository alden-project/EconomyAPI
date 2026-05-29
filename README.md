# EconomyAPI Plugin

Core economy system for alden-bot.

## Features

- **Centralized Economy:** Provides a reliable API for other plugins to manage and interact with user balances.
- **Admin Commands:** Built-in commands to manually adjust, add, or reset user balances.
- **Top Leaderboard:** Tracks the wealthiest users across the bot.
- **Service Registration:** Exposes an `IEconomyService` interface that can be injected into other plugins (e.g., `ChatLevels`).

## Commands

| Command | Aliases | Permission | Description |
| :--- | :--- | :--- | :--- |
| `/eco give <@user/uid> <amount>` | `/economy`, `/money` | `economy.admin` | Adds funds to a user's balance. |
| `/eco take <@user/uid> <amount>` | | `economy.admin` | Removes funds from a user's balance. |
| `/eco set <@user/uid> <amount>` | | `economy.admin` | Sets a user's balance to a specific amount. |
| `/eco check [@user/uid]` | | `economy.admin` | Checks the balance of a user (or yourself if empty). |
| `/eco top` | | `economy.admin` | Displays the top 10 richest users. |
| `/eco reset <@user/uid>` | | `economy.admin` | Resets a user's balance to 0. |

## Permissions

- `economy.admin` - Default level `3` (Admin). Controls access to all `/eco` management commands.

## Developer API

Other plugins can interact with the economy by retrieving the service:

```typescript
const eco = this.getService<IEconomyService>('economy');
if (eco) {
    eco.addBalance(userId, 500);
}
```
