import { resetUsers } from "src/lib/db/queries/users";

export async function handlerReset(_: string) {
  await resetUsers();
  console.log("Truncated users table successfully");
}
