// This file allows dynamic configuration based on environment
module.exports = ({ config }) => {
  const isProduction = process.env.APP_ENV === 'production';
  
  return {
    ...config,
    name: config.name || 'Save It',
    slug: config.slug || 'save-it',
    version: process.env.APP_VERSION || config.version || '1.0.0',
    
    ios: {
      ...config.ios,
      bundleIdentifier: config.ios?.bundleIdentifier || 'app.rork.save-it',
      buildNumber: process.env.BUILD_NUMBER || '1',
      config: {
        usesNonExemptEncryption: false,
      },
    },
    
    android: {
      ...config.android,
      package: config.android?.package || 'app.rork.save-it',
      versionCode: parseInt(process.env.BUILD_NUMBER || '1', 10),
      permissions: [
        'INTERNET',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
      ],
    },
    
    extra: {
      environment: process.env.APP_ENV || 'development',
      apiUrl: process.env.API_URL || 'https://save-it-chi.vercel.app',
      eas: {
        projectId: process.env.EAS_PROJECT_ID || '',
      },
    },
    
    updates: {
      url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID || ''}`,
    },
    
    runtimeVersion: {
      policy: 'appVersion',
    },
  };
};
