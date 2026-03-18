/**
 * Shared E2E helpers.
 * Detox globals (device, element, by, waitFor, expect) are injected
 * by the testEnvironment — no imports needed.
 */

/**
 * Wait for the countries FlatList AND for the first country card to appear.
 * The FlatList container becomes visible immediately, but we need actual data
 * (country-card-AFG = Afghanistan, first alphabetically) to confirm loading.
 */
export async function waitForCountryList(timeout = 30000): Promise<void> {
  await waitFor(element(by.id('country-list')))
    .toBeVisible()
    .withTimeout(timeout);
  // Afghanistan is always first alphabetically — wait for it to confirm data loaded
  await waitFor(element(by.id('country-card-AFG')))
    .toBeVisible()
    .withTimeout(timeout);
}

/**
 * Type in the search bar to filter, then tap the matching card.
 * Uses a 10s timeout for the card — data is always loaded before this is called.
 */
export async function navigateToCountry(name: string, cca3: string): Promise<void> {
  await element(by.id('search-input')).tap();
  await element(by.id('search-input')).clearText();
  await element(by.id('search-input')).replaceText(name);
  await waitFor(element(by.id(`country-card-${cca3}`)))
    .toBeVisible()
    .withTimeout(10000);
  await element(by.id(`country-card-${cca3}`)).tap();
  await waitFor(element(by.id('country-name')))
    .toBeVisible()
    .withTimeout(8000);
}

/**
 * Clear search text, dismiss keyboard, and wait for the full list to restore.
 */
export async function clearSearch(): Promise<void> {
  await element(by.id('search-input')).clearText();
  // Dismiss keyboard so the list is fully visible for Detox visibility checks
  try {
    await element(by.id('search-input')).tapReturnKey();
  } catch {
    // keyboard may already be dismissed
  }
  await waitForCountryList(8000);
}
