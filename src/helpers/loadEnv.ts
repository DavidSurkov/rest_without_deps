import { readFileSync } from 'fs';
import { resolve } from 'path';

export const loadEnv = () => {
  const envPath = resolve(process.cwd(), '.env');
  try {
    const data = readFileSync(envPath, 'utf8');
    const variables = data.split('\n');

    variables.forEach((variable) => {
      const [key, value] = variable.split('=');
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });
  } catch (error) {
    console.error(`Error loading .env file: ${error.message}`);
  }
};
