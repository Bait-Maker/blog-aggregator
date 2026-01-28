import type { CommandHandler, UserCommandHandler } from "./commands/commands";
import { readConfig } from "./config";
import { getUser } from "./lib/db/queries/users";

export function middlewareLoggedIn(
  handler: UserCommandHandler,
): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    const userName = config.currentUserName;

    if (!userName) {
      throw new Error("User not logged in");
    }

    const user = await getUser(userName);

    if (!user) {
      throw new Error(`User ${config.currentUserName} not found`);
    }

    await handler(cmdName, user, ...args);
  };
}
