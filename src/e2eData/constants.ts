/**
 * Shared constants for E2E fixture mode.
 *
 * The iOS app reads E2E_MODE_KEY via Settings.get() (NSUserDefaults).
 * Detox injects it at launch time via launchArgs: { [E2E_MODE_KEY]: E2E_MODE_VALUE }.
 *
 * e2e/ tests cannot import from src/ (different tsconfig, no path aliases),
 * so the launchArgs strings in those files must match these values manually.
 * If you rename either constant, update all device.launchApp() calls in e2e/tests/.
 */
export const E2E_MODE_KEY = 'E2E';
export const E2E_MODE_VALUE = '1';
