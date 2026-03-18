/**
 * Country Detail Screen and Map Navigation tests.
 *
 * Merged into one file so both suites share a single app launch,
 * saving one launchApp call (~9 s) vs two separate files.
 *
 * Flow:
 *   1. Launch once → country list visible
 *   2. Country Detail — beforeAll navigates to Germany; afterAll taps back
 *      and calls clearSearch so the list is clean for Map Navigation
 *   3. Map Navigation — starts from the country list, same session
 */
import { waitForCountryList, navigateToCountry, clearSearch } from '../testUtils';

describe('Country Detail Screen and Map Navigation', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForCountryList();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Country Detail Screen
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Country Detail Screen', () => {
    beforeAll(async () => {
      // Germany has borders, languages, currencies — good all-round test subject
      await navigateToCountry('Germany', 'DEU');
    });

    afterAll(async () => {
      // Tap back to return to the list, then clear the "Germany" search text
      // left by navigateToCountry — Map Navigation tests need AFG visible.
      await element(by.id('back-btn')).tap();
      await clearSearch();
    });

    it('shows the country name', async () => {
      await expect(element(by.id('country-name'))).toBeVisible();
      await expect(element(by.text('Germany'))).toBeVisible();
    });

    it('shows population stat', async () => {
      await expect(element(by.id('stat-population'))).toBeVisible();
    });

    it('shows region stat', async () => {
      await expect(element(by.id('stat-region'))).toBeVisible();
      await expect(element(by.text('Europe'))).toBeVisible();
    });

    it('shows Geography & Culture section', async () => {
      // startPositionY=0.5 avoids the home-indicator edge that the default 0.95 hits
      await element(by.id('detail-scroll')).scroll(200, 'down', NaN, 0.5);
      await expect(element(by.text('Geography & Culture'))).toBeVisible();
    });

    it('shows capital info row', async () => {
      await expect(element(by.text('Berlin'))).toBeVisible();
    });

    it('shows language info row', async () => {
      await expect(element(by.text('German'))).toBeVisible();
    });

    it('shows Shares Borders With section', async () => {
      await element(by.id('detail-scroll')).scroll(300, 'down', NaN, 0.5);
      await expect(element(by.text('Shares Borders With'))).toBeVisible();
    });

    it('shows border country chips', async () => {
      // Germany borders Austria (AUT), France (FRA), Poland (POL), etc.
      await expect(element(by.id('border-chip-AUT'))).toBeVisible();
      await expect(element(by.id('border-chip-FRA'))).toBeVisible();
    });

    it('tapping a border chip navigates to that country', async () => {
      await element(by.id('border-chip-AUT')).tap();
      await waitFor(element(by.id('country-name')))
        .toBeVisible()
        .withTimeout(5000);
      await expect(element(by.text('Austria'))).toBeVisible();
    });

    it('back button returns to previous country detail', async () => {
      await element(by.id('back-btn')).tap();
      // Prior scroll tests left the view at ~500pt down — country-name is off-screen.
      // border-chip-AUT is visible at that scroll position and is Germany-specific
      // (Austria does not border itself, so this chip only exists on Germany's screen).
      await waitFor(element(by.id('border-chip-AUT')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Map Navigation
  // (countryDetail afterAll returns to a clean list before these tests run)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Map Navigation', () => {
    it('tapping the map button navigates to the Map screen', async () => {
      await element(by.id('map-btn')).tap();
      // Disable sync AFTER the tap: the navigation itself needs sync to complete
      // the animation. Disabling immediately after prevents the Leaflet WebView's
      // tile-loading work items from blocking waitFor indefinitely.
      await device.disableSynchronization();
      await waitFor(element(by.id('map-search-bar')))
        .toBeVisible()
        .withTimeout(10000);
      // Keep sync disabled — the WebView remains active for the next two tests
    });

    it('map empty state is NOT shown when countries are loaded', async () => {
      await expect(element(by.id('map-empty'))).not.toBeVisible();
    });

    it('back button returns to the country list', async () => {
      await element(by.id('back-btn')).tap();
      // Re-enable sync now that we're back on the native country list
      await device.enableSynchronization();
      await waitForCountryList(10000);
    });

    it('navigating to map again still renders the map', async () => {
      await element(by.id('map-btn')).tap();
      await device.disableSynchronization();
      await waitFor(element(by.id('map-search-bar')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('back-btn')).tap();
      await device.enableSynchronization();
      await waitForCountryList(10000);
    });
  });
});
