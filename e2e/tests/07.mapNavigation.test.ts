import { waitForCountryList } from '../testUtils';

describe('Map Navigation', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForCountryList();
  });

  it('tapping the map button navigates to the Map screen', async () => {
    await element(by.id('map-btn')).tap();
    await waitFor(element(by.id('map-view')))
      .toBeVisible()
      .withTimeout(10000);
  });

  it('map empty state is NOT shown when countries are loaded', async () => {
    await expect(element(by.id('map-empty'))).not.toBeVisible();
  });

  it('back button returns to the country list', async () => {
    await element(by.id('back-btn')).tap();
    await waitForCountryList(10000);
  });

  it('navigating to map again still renders the map', async () => {
    await element(by.id('map-btn')).tap();
    await waitFor(element(by.id('map-view')))
      .toBeVisible()
      .withTimeout(10000);
    await element(by.id('back-btn')).tap();
    await waitForCountryList(10000);
  });
});
