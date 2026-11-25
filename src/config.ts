export interface AppConfig {
  app_name: string | undefined;
  api_url: string | undefined;
  school_name: string | undefined;
  description: string | undefined;
}

const config: AppConfig = {
  app_name: import.meta.env.VITE_APP_NAME,
  api_url: import.meta.env.VITE_API_URL,
  school_name: import.meta.env.VITE_SCHOOL_NAME,
  description: import.meta.env.VITE_APP_DESCRIPTION,
};

console.log({ config });

export default config;
