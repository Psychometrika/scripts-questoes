require("dotenv").config();
import { Z_FIXED } from 'node:zlib';
import { z } from 'zod'

const envSchema = z.object({
  MONGODB_URI: z.string(),
  INPUT_PATH: z.string(),
  INPUT_TO_UPDATE: z.string(),
  INPUT_TO_ARCHIVE: z.string(),
  AZURE_STORAGE_CONTAINER_NAME: z.string(),
  AZURE_STORAGE_URL: z.string(),
  API_URL: z.string(),
  ARVORE_BNCC: z.string(),
  EMAIL: z.string(),
  PASSWORD: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables', _env.error.format())
  throw new Error('Invalid environment variables')
}

export const env = _env.data