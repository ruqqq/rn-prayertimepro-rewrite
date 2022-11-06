module.exports = {
  preset: 'react-native',
  testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  watchPathIgnorePatterns: ['/node_modules/', '/html-report/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFiles: ['<rootDir>/jest.setup.ts'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup-after-env.ts'],
  clearMocks: true,
  moduleNameMapper: {
    '\\.(jpg|jpeg|png)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!(@react-native|react-native|react-native-vector-icons|react-native-onboarding-swiper|react-native-paper|react-native-iphone-x-helper|react-native-reanimated|react-native-gesture-handler|react-native-permissions)/).*/',
  ],
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: './html-report',
        filename: 'report.html',
      },
    ],
  ],
};
