import { readFileSync } from 'fs';
import { resolve } from 'path';

export function loadEnv() {
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

export function checkRequiredEnvVariables(requiredVars: readonly string[]) {
  const unsetVars = requiredVars.filter((varName) => !process.env[varName]);

  if (unsetVars.length > 0) {
    console.error(
      'Missing required environment variables:',
      unsetVars.join(', '),
    );
    process.exit(1); // Exit if any required variable is not set
  }
}
