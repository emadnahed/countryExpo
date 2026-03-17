import { waitForCountryList, clearSearch } from '../testUtils';

describe('Search', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForCountryList();
  });

  afterEach(async () => {
    // Clear text, dismiss keyboard, restore full list
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
    // Afghanistan disappears — no countries match
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
    // Clear — handled by afterEach, but verify here too
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
    await expect(element(by.text('Japan'))).toBeVisible();
    await element(by.id('back-btn')).tap();
    await waitForCountryList(10000);
  });
});
