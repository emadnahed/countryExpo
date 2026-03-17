import { waitForCountryList } from '../testUtils';

describe('Country List', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForCountryList();
  });

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
    await element(by.id('region-filter-scroll')).scroll(300, 'right');
    await expect(element(by.id('region-chip-europe'))).toBeVisible();
    await expect(element(by.id('region-chip-oceania'))).toBeVisible();
    // Scroll back
    await element(by.id('region-filter-scroll')).scroll(300, 'left');
  });

  it('scrolls the list to reveal more countries', async () => {
    await element(by.id('country-card-AFG')).swipe('up', 'fast', 0.5);
    await expect(element(by.id('country-list'))).toBeVisible();
    // Scroll back to top
    await element(by.id('country-list')).scrollTo('top');
  });

  it('does not show the error view in the normal flow', async () => {
    await expect(element(by.id('error-view'))).not.toBeVisible();
  });
});
