/** @type {Detox.DetoxConfig} */
module.exports = {
  testRunner: {
    args: {
      $0: 'jest',
      config: 'e2e/jest.config.js',
    },
    jest: {
      setupTimeout: 120000,
    },
  },
  apps: {
    'ios.debug': {
      type: 'ios.app',
      binaryPath: 'ios/build/Build/Products/Debug-iphonesimulator/CountryExplorer.app',
      build:
        'EXPO_PUBLIC_E2E=true xcodebuild -workspace ios/CountryExplorer.xcworkspace -scheme CountryExplorer -configuration Debug -sdk iphonesimulator -derivedDataPath ios/build',
    },
    'android.debug': {
      type: 'android.apk',
      binaryPath: 'android/app/build/outputs/apk/debug/app-debug.apk',
      build:
        'cd android && ./gradlew assembleDebug assembleAndroidTest -DtestBuildType=debug && cd ..',
      testBinaryPath:
        'android/app/build/outputs/apk/androidTest/debug/app-debug-androidTest.apk',
    },
  },
  devices: {
    simulator: {
      type: 'ios.simulator',
      device: {
        type: 'iPhone 17 Pro',
      },
    },
    emulator: {
      type: 'android.emulator',
      device: {
        avdName: 'Pixel_API_34',
      },
    },
    // Used in CI: Bitrise boots the emulator, Detox attaches to it
    'ci-emulator': {
      type: 'android.attached',
      device: {
        adbName: 'emulator-5554',
      },
    },
  },
  configurations: {
    'ios.sim.debug': {
      device: 'simulator',
      app: 'ios.debug',
    },
    // Local Android run — Detox manages emulator lifecycle
    'android.emu.debug': {
      device: 'emulator',
      app: 'android.debug',
    },
    // CI Android run — Bitrise boots emulator, Detox attaches
    'android.ci.debug': {
      device: 'ci-emulator',
      app: 'android.debug',
    },
  },
};
