/**
 * Region filter tests.
 * Uses the FIRST alphabetical country per region to avoid off-screen cards:
 *   Africa   → Algeria (DZA)
 *   Americas → Anguilla (AIA) — first alphabetically in Americas
 *   Asia     → Afghanistan (AFG) — also the first country overall
 *   Europe   → Albania (ALB)
 *   Oceania  → Australia (AUS)
 *
 * Negative checks use Afghanistan (AFG/Asia) for non-Asia regions,
 * and France (FRA/Europe) for Asia.
 */
import { waitForCountryList } from '../testUtils';

describe('Region Filter', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForCountryList();
  });

  afterEach(async () => {
    // Scroll filter bar back to the left before resetting region
    try {
      await element(by.id('region-filter-scroll')).scroll(400, 'left');
    } catch {}
    // Reset to "All" after each test
    await element(by.id('region-chip-all')).tap();
    await waitForCountryList(15000);
  });

  it('selecting Africa shows only African countries', async () => {
    await element(by.id('region-chip-africa')).tap();
    // Algeria is the first African country alphabetically
    await waitFor(element(by.id('country-card-DZA')))
      .toBeVisible()
      .withTimeout(8000);
    // Afghanistan (Asia) must be gone
    await expect(element(by.id('country-card-AFG'))).not.toBeVisible();
  });

  it('selecting Americas shows only American countries', async () => {
    await element(by.id('region-chip-americas')).tap();
    // Anguilla is the first American territory alphabetically
    await waitFor(element(by.id('country-card-AIA')))
      .toBeVisible()
      .withTimeout(8000);
    // Afghanistan (Asia) must be gone
    await expect(element(by.id('country-card-AFG'))).not.toBeVisible();
  });

  it('selecting Asia shows only Asian countries', async () => {
    await element(by.id('region-chip-asia')).tap();
    // Afghanistan is the first Asian country alphabetically
    await waitFor(element(by.id('country-card-AFG')))
      .toBeVisible()
      .withTimeout(8000);
    // France (Europe) must be gone
    await expect(element(by.id('country-card-FRA'))).not.toBeVisible();
  });

  it('selecting Europe shows only European countries', async () => {
    // Europe chip may need a scroll to be visible
    await element(by.id('region-filter-scroll')).scroll(300, 'right');
    await element(by.id('region-chip-europe')).tap();
    // Albania is first European country alphabetically (excluding Åland Islands edge case)
    await waitFor(element(by.id('country-card-ALB')))
      .toBeVisible()
      .withTimeout(8000);
    // Afghanistan (Asia) must be gone
    await expect(element(by.id('country-card-AFG'))).not.toBeVisible();
    // Scroll back for afterEach
    await element(by.id('region-filter-scroll')).scroll(300, 'left');
  });

  it('selecting Oceania shows only Oceanian countries', async () => {
    await element(by.id('region-filter-scroll')).scroll(400, 'right');
    await element(by.id('region-chip-oceania')).tap();
    // Australia is the first Oceanian country alphabetically
    await waitFor(element(by.id('country-card-AUS')))
      .toBeVisible()
      .withTimeout(8000);
    // Afghanistan (Asia) must be gone
    await expect(element(by.id('country-card-AFG'))).not.toBeVisible();
    await element(by.id('region-filter-scroll')).scroll(400, 'left');
  });

  it('tapping the same region chip again deselects it and shows all countries', async () => {
    await element(by.id('region-chip-africa')).tap();
    await waitFor(element(by.id('country-card-DZA')))
      .toBeVisible()
      .withTimeout(8000);
    // Tap Africa again to deselect
    await element(by.id('region-chip-africa')).tap();
    // Full list should restore — Afghanistan is back
    await waitFor(element(by.id('country-card-AFG')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('region filter and search work together', async () => {
    await element(by.id('region-chip-asia')).tap();
    await element(by.id('search-input')).tap();
    await element(by.id('search-input')).typeText('Japan');
    await waitFor(element(by.id('country-card-JPN')))
      .toBeVisible()
      .withTimeout(10000);
    // Afghanistan is in Asia but doesn't match "Japan"
    await expect(element(by.id('country-card-AFG'))).not.toBeVisible();
    // Clear search
    await element(by.id('search-input')).clearText();
    try { await element(by.id('search-input')).tapReturnKey(); } catch {}
  });
});
