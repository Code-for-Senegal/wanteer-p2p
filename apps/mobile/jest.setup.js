// AsyncStorage is a native module: without this, any suite that imports it
// fails to run with "NativeModule: AsyncStorage is null".
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
