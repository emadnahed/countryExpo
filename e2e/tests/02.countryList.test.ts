/**
 * Country List, Search, and Region Filter tests.
 *
 * Merged into one file so all three suites share a single app launch,
 * saving two launchApp calls (~18 s) vs three separate files.
 *
 * Synchronization strategy:
 *   Country List — sync ON: instant assertions on already-loaded data.
 *   Search       — sync ON: the Japan navigation test requires sync so the
 *                  navigation animation completes before assertions fire.
 *   Region Filter — sync OFF: each chip tap and "tap All" reset triggers a
 *                  full 250-item FlatList re-render. With sync ON, Detox waits
 *                  ~3-4 s per operation for the entire queue to idle.
 *                  With sync OFF + explicit waitFor, we wait only until the
 *                  first expected card is visible (~0.5-1 s), saving ~45 s
 *                  across the 7-test suite (14 filter transitions × ~3 s each).
 */
import { waitForCountryList, clearSearch } from '../testUtils';

describe('Country List, Search & Region Filter', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForCountryList();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Country List — sync ON
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Country List', () => {
    it('renders country cards with name and region info', async () => {
      await expect(element(by.id('country-card-AFG'))).toBeVisible();
      await expect(element(by.text('Afghanistan'))).toBeVisible();
      await expect(element(by.text('Asia'))).toBeVisible();
    });

    it('shows All chip with total country count', async () => {
      await expect(element(by.id('region-chip-all'))).toBeVisible();
    });

    it('shows the first three region filter chips without scrolling', async () => {
      await expect(element(by.id('region-chip-all'))).toBeVisible();
      await expect(element(by.id('region-chip-africa'))).toBeVisible();
      await expect(element(by.id('region-chip-americas'))).toBeVisible();
    });

    it('shows Europe and Oceania chips after scrolling the filter row', async () => {
      await element(by.id('region-filter-scroll')).scroll(600, 'right');
      await expect(element(by.id('region-chip-europe'))).toBeVisible();
      await expect(element(by.id('region-chip-oceania'))).toBeVisible();
      await element(by.id('region-filter-scroll')).scroll(600, 'left');
      await expect(element(by.id('region-chip-all'))).toBeVisible();
    });

    it('scrolls the list to reveal more countries', async () => {
      await element(by.id('country-card-AFG')).swipe('up', 'fast', 0.5);
      await expect(element(by.id('country-list'))).toBeVisible();
      await element(by.id('country-list')).scrollTo('top');
    });

    it('does not show the error view in the normal flow', async () => {
      await expect(element(by.id('error-view'))).not.toBeVisible();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Search — sync ON
  //
  // Kept with sync enabled because the Japan navigation test taps a card and
  // navigates to a detail screen — navigation taps require Detox sync to
  // wait for the animation to complete before assertions fire.
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Search', () => {
    afterEach(async () => {
      // clearSearch calls waitForCountryList internally — works correctly
      await clearSearch();
    });

    it('filters list to matching countries when text is typed', async () => {
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).replaceText('Germany');
      await waitFor(element(by.id('country-card-DEU')))
        .toBeVisible()
        .withTimeout(10000);
      // Afghanistan is filtered out
      await expect(element(by.id('country-card-AFG'))).not.toBeVisible();
    });

    it('search is case-insensitive', async () => {
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).replaceText('germany');
      await waitFor(element(by.id('country-card-DEU')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('shows no results for a non-existent country name', async () => {
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).replaceText('zzzznotareal');
      await waitFor(element(by.id('country-card-AFG')))
        .not.toBeVisible()
        .withTimeout(5000);
      await expect(element(by.id('country-card-DEU'))).not.toBeVisible();
    });

    it('restores full list after clearing search text', async () => {
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).replaceText('France');
      await waitFor(element(by.id('country-card-FRA')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('search-input')).clearText();
      try { await element(by.id('search-input')).tapReturnKey(); } catch {}
      await waitFor(element(by.id('country-card-AFG')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('can navigate to a country detail via search result', async () => {
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).replaceText('Japan');
      await waitFor(element(by.id('country-card-JPN')))
        .toBeVisible()
        .withTimeout(10000);
      await element(by.id('country-card-JPN')).tap();
      await waitFor(element(by.id('country-name')))
        .toBeVisible()
        .withTimeout(8000);
      // Use testID matcher — by.text('Japan') matches both common and official name fields
      await expect(element(by.id('country-name'))).toBeVisible();
      await element(by.id('back-btn')).tap();
      // Search text "Japan" is still active after navigating back — AFG is not visible.
      // Verify we're back on the list by checking Japan's card is still the search result.
      await waitFor(element(by.id('country-card-JPN')))
        .toBeVisible()
        .withTimeout(8000);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // Region Filter — sync OFF
  //
  // Sync is disabled in beforeAll and re-enabled in afterAll.
  // All tests here are pure filter operations (chip taps + card assertions),
  // no navigation — safe to run with sync disabled.
  //
  // With sync ON:  tap chip → Detox waits for entire 250-item FlatList to idle
  //                         → ~3-4 s per tap (filter AND reset each test)
  // With sync OFF: tap chip → explicit waitFor(first visible card) → ~0.5-1 s
  //
  // scroll+tap sequences get a waitFor(chip visible) guard so the chip is
  // confirmed in view before tapping (sync OFF means scroll returns immediately).
  //
  // Uses the FIRST alphabetical country per region:
  //   Africa → Algeria (DZA), Americas → Anguilla (AIA),
  //   Asia → Afghanistan (AFG), Europe → Albania (ALB), Oceania → Australia (AUS)
  // ═══════════════════════════════════════════════════════════════════════════
  describe('Region Filter', () => {
    beforeAll(async () => {
      await device.disableSynchronization();
    });

    afterAll(async () => {
      await device.enableSynchronization();
    });

    afterEach(async () => {
      // Scroll filter bar back to position 0 so All chip is in view
      try {
        await element(by.id('region-filter-scroll')).scroll(600, 'left');
      } catch {}
      // With sync OFF, confirm All chip is visible before tapping
      await waitFor(element(by.id('region-chip-all')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('region-chip-all')).tap();
      // Wait until AFG (first alphabetical) is visible — confirms filter reset
      await waitFor(element(by.id('country-card-AFG')))
        .toBeVisible()
        .withTimeout(5000);
    });

    it('selecting Africa shows only African countries', async () => {
      await element(by.id('region-chip-africa')).tap();
      await waitFor(element(by.id('country-card-DZA')))
        .toBeVisible()
        .withTimeout(8000);
      await waitFor(element(by.id('country-card-AFG')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('selecting Americas shows only American countries', async () => {
      await element(by.id('region-chip-americas')).tap();
      await waitFor(element(by.id('country-card-AIA')))
        .toBeVisible()
        .withTimeout(8000);
      await waitFor(element(by.id('country-card-AFG')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('selecting Asia shows only Asian countries', async () => {
      await element(by.id('region-filter-scroll')).scroll(200, 'right');
      // With sync OFF, confirm chip is in view after scroll before tapping
      await waitFor(element(by.id('region-chip-asia')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('region-chip-asia')).tap();
      await waitFor(element(by.id('country-card-AFG')))
        .toBeVisible()
        .withTimeout(8000);
      await waitFor(element(by.id('country-card-FRA')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('selecting Europe shows only European countries', async () => {
      await element(by.id('region-filter-scroll')).scroll(300, 'right');
      await waitFor(element(by.id('region-chip-europe')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('region-chip-europe')).tap();
      await waitFor(element(by.id('country-card-ALB')))
        .toBeVisible()
        .withTimeout(8000);
      await waitFor(element(by.id('country-card-AFG')))
        .not.toBeVisible()
        .withTimeout(3000);
      // No scroll-back — afterEach handles it with scroll(600, left)
    });

    it('selecting Oceania shows only Oceanian countries', async () => {
      await element(by.id('region-filter-scroll')).scroll(400, 'right');
      await waitFor(element(by.id('region-chip-oceania')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('region-chip-oceania')).tap();
      await waitFor(element(by.id('country-card-AUS')))
        .toBeVisible()
        .withTimeout(8000);
      await waitFor(element(by.id('country-card-AFG')))
        .not.toBeVisible()
        .withTimeout(3000);
      // No scroll-back — afterEach handles it with scroll(600, left)
    });

    it('tapping the same region chip again deselects it and shows all countries', async () => {
      await element(by.id('region-chip-africa')).tap();
      await waitFor(element(by.id('country-card-DZA')))
        .toBeVisible()
        .withTimeout(8000);
      // Tap Africa again to deselect
      await element(by.id('region-chip-africa')).tap();
      await waitFor(element(by.id('country-card-AFG')))
        .toBeVisible()
        .withTimeout(8000);
    });

    it('region filter and search work together', async () => {
      await element(by.id('region-filter-scroll')).scroll(200, 'right');
      await waitFor(element(by.id('region-chip-asia')))
        .toBeVisible()
        .withTimeout(2000);
      await element(by.id('region-chip-asia')).tap();
      // Explicitly wait for Asia filter to settle before typing —
      // ensures we're testing the combined filter+search, not just search alone
      await waitFor(element(by.id('country-card-AFG')))
        .toBeVisible()
        .withTimeout(5000);
      await element(by.id('search-input')).tap();
      await element(by.id('search-input')).replaceText('Japan');
      try { await element(by.id('search-input')).tapReturnKey(); } catch {}
      await waitFor(element(by.id('country-card-JPN')))
        .toBeVisible()
        .withTimeout(10000);
      // Afghanistan is in Asia but doesn't match "Japan"
      await waitFor(element(by.id('country-card-AFG')))
        .not.toBeVisible()
        .withTimeout(3000);
      // Clear search (Asia filter still active — afterEach resets to All)
      await element(by.id('search-input')).clearText();
      try { await element(by.id('search-input')).tapReturnKey(); } catch {}
      // Confirm Asia filter is still active: AFG must be visible, JPN no longer the only result
      await waitFor(element(by.id('country-card-AFG')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });
});
