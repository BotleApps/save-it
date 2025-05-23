module.exports = {
  preset: 'jest-expo',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testMatch: [
    '**/__tests__/**/*.ts?(x)',
    '**/?(*.)+(spec|test).ts?(x)',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['@testing-library/react-native/extend-expect'],
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|lucide-react-native|@react-native-async-storage/async-storage)"
  ],
  // Ensure files in the stores directory are transformed
  // This is often covered by the default transform config, but explicitly including it here for clarity if needed.
  // If your stores are in a different location or have a different extension, adjust accordingly.
  // transform: {
  //   ...
  //   '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest', // or 'ts-jest'
  // },
};
