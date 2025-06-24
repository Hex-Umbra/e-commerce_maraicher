export const logger = {
  error: (message) => {
    const timestamp = new Date().toISOString();
    console.error(`❌ [ERROR] [${timestamp}] ${message}`);
  },
  info: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`ℹ️ [INFO] [${timestamp}] ${message}`);
  },
  warn: (message) => {
    const timestamp = new Date().toISOString();
    console.warn(`⚠️ [WARN] [${timestamp}] ${message}`);
  },
  debug: (message) => {
    if (process.env.NODE_ENV !== "development") return; // Only log in development mode
    const timestamp = new Date().toISOString();
    console.debug(`🐞 [DEBUG] [${timestamp}] ${message}`);
  }, 
};
