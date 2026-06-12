const dotenv = require("dotenv");
const { z } = require("zod");

dotenv.config({ quiet: true });

const nodeEnv = process.env.NODE_ENV || "development";
const fallbackJwtSecret =
  nodeEnv === "production" ? undefined : "dev-only-change-this-secret";
const providedJwtSecret = process.env.JWT_SECRET_KEY || "";
const jwtSecret =
  nodeEnv === "production" || providedJwtSecret.length >= 16
    ? providedJwtSecret
    : fallbackJwtSecret;

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DB_HOST: z.string().min(1).default("localhost"),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1).default("root"),
  DB_PASSWORD: z.string().default(""),
  DB_DATABASE: z
    .string()
    .regex(/^[A-Za-z0-9_]+$/)
    .default("fitnessquest"),
  JWT_SECRET_KEY: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("2h"),
  JWT_ALGORITHM: z.enum(["HS256", "HS384", "HS512"]).default("HS256"),
});

const parsed = schema.safeParse({
  ...process.env,
  NODE_ENV: nodeEnv,
  JWT_SECRET_KEY: jwtSecret,
});

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid environment configuration: ${details}`);
}

module.exports = {
  env: parsed.data,
};
