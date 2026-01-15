import { readConfig, setUser } from "src/config";
import { createUser, getUsers } from "src/lib/db/queries/users";

export async function handlerLogin(cmdName: string, ...args: string[]) {
  if (args.length !== 1) {
    throw new Error(`usage: ${cmdName} <name>`);
  }

  const username = args[0];
  setUser(username);

  console.log(`Logging in as ${username}...`);
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

  setUser(user.name);
  console.log(`user ${user.name} was created`);
}

export async function handlerGetUsers(_: string) {
  const users = await getUsers();
  const config = readConfig();
  const currentUser = config.currentUserName;

  users.map((user) => {
    user.name === currentUser
      ? console.log(`* ${user.name} (current)`)
      : console.log(`* ${user.name}`);
  });
}
