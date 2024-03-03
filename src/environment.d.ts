declare namespace NodeJS {
  export interface ProcessEnv {
    CLIENT_BASE_URL: string;
    PORT: string;
    JWT_SECRET: string;
  }
}
