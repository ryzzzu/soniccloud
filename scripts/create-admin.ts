import "dotenv/config";
import { hash } from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const [emailArg, passwordArg, ...nameParts] = process.argv.slice(2);
  const email = emailArg?.trim().toLowerCase();
  const password = passwordArg;
  const displayName = nameParts.join(" ") || "SonicCloud Admin";
  if (!email || !password || password.length < 10) {
    throw new Error('Usage: npm run admin:create -- admin@example.com "StrongPassword123" "Admin Name" (min 10 chars)');
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
  try {
    await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN", isActive: true, displayName },
      create: { email, passwordHash: await hash(password), displayName, role: "ADMIN" },
    });
    console.log(`Admin created/updated: ${email}`);
  } finally {
    await prisma.$disconnect();
  }
}
main().catch((error) => { console.error(error); process.exit(1); });
