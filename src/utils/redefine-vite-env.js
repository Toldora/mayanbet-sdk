const redefineViteEnv = env =>
  Object.entries(env).reduce((acc, [key]) => {
    if (key.startsWith('VITE_')) {
      acc[`process.env.${key}`] = `import.meta.env.${key}`;
    }
    return acc;
  }, {});
