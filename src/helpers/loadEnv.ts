import { readFileSync } from 'fs';
import { resolve } from 'path';
import * as process from 'process';
import * as console from 'console';

type ConfigType<T> = {
  [K in keyof T]: T[K] extends 'number' ? number : string;
};
type EnvSchemaType = 'string' | 'number';

const schema = {
  CLIENT_BASE_URL: 'string',
  PORT: 'number',
  JWT_SECRET: 'string',
  DB_PORT: 'number',
  DB_HOST: 'string',
  DB_USER: 'string',
  DB_PASSWORD: 'string',
} as const;

function loadDotEnv() {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const data = readFileSync(envPath, 'utf8');
    const variables = data.split('\n');

    variables.forEach((variable) => {
      const line = variable.trim();
      if (!line || line.startsWith('#')) {
        return;
      }

      const [key, value] = line.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error(`Error loading .env file: ${error.message}`);
    process.exit(1);
  }
}

function createConfigObject<T extends Record<string, EnvSchemaType>>(
  schema: T,
): ConfigType<T> {
  loadDotEnv();

  const configObject = {} as Record<string, unknown>;

  Object.entries(schema).forEach(([key, type]) => {
    const envValue = process.env[key];
    if (!envValue) {
      console.error(`${key} env in not defined`);
      process.exit(1);
    }
    if (type === 'number') {
      const numValue = Number(envValue);
      if (isNaN(numValue)) {
        console.error(`${key} env type is not correct. Should be: ${type}`);
        process.exit(1);
      }
      configObject[key] = numValue;
      return;
    }

    configObject[key] = envValue;
    console.error(`${key} env type is not correct. Should be: ${type}`);
  });

  return configObject as ConfigType<T>;
}

export const config = createConfigObject(schema);
