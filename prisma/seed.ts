import "dotenv/config";
import { hash } from "argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const genres = ["Pop", "Rock", "Jazz", "Classical", "Electronic", "Hip-Hop", "R&B", "Indie"];
  for (const name of genres) {
    await prisma.genre.upsert({ where: { name }, update: {}, create: { name } });
  }

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (email && password) {
    const passwordHash = await hash(password);
    await prisma.user.upsert({
      where: { email },
      update: { role: "ADMIN", isActive: true },
      create: {
        email,
        passwordHash,
        displayName: process.env.ADMIN_NAME || "SonicCloud Admin",
        role: "ADMIN",
      },
    });
    console.log(`Admin account ready: ${email}`);
  } else {
    console.log("ADMIN_EMAIL/ADMIN_PASSWORD not set. Skipping admin bootstrap.");
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
