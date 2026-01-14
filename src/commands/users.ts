import { setUser } from "src/config";
import { createUser, getUser } from "src/lib/db/queries/users";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const username = args[0];
  const existingUser = await getUser(username);

  if (!existingUser) {
    throw new Error(`user ${username} doesn't exits in the database`);
  }

  setUser(existingUser.name);
  console.log(`Logging in as ${existingUser.name}...`);
  console.log("User switched successfully!");
}

export async function handlerRegister(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const userName = args[0];
  const user = await createUser(userName);

  if (!user) {
    throw new Error(`User ${userName} not found`);
  }

  console.log(`user ${user.name} was created`);
  setUser(user.name);
}
