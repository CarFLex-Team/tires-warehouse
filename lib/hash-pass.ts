// const bcrypt = require("bcrypt");

// async function hash() {
//   const password = "Owner@123";
//   const hash = await bcrypt.hash(password, 10);
//   console.log(hash);
// }

// hash();
import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
