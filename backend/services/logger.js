export const logger = {
  
  error: (message) => {
    const timestamp = new Date().toISOString();
    console.error(`
      ❌ \x1b[41m [ERROR] \x1b[0m 
      [${timestamp}] 
      ${message}`);
  },

  info: (message) => {
    const timestamp = new Date().toISOString();
    console.log(`
      ℹ️ \x1b[46m [INFO] \x1b[0m 
      [${timestamp}] 
      ${message}`);
  },

  warn: (message) => {
    const timestamp = new Date().toISOString();
    console.warn(`
      ⚠️ \x1b[43m [WARN] \x1b[0m 
      [${timestamp}] 
      ${message}`);
  },

  debug: (message, ...options) => {
    if (process.env.NODE_ENV !== "dev") return; // Only log in development mode
    const timestamp = new Date().toISOString();

    options = options.length ? JSON.stringify(options) : "";
    if (options) {
      options = `\nOptions: ${options}`;
    }

    console.debug(`
      🐞 \x1b[45m [DEBUG] \x1b[0m 
      [${timestamp}] 
      ${message} 
      ${options}`);
  },
};
