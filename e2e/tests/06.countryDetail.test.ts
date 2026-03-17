import { waitForCountryList, navigateToCountry } from '../testUtils';

describe('Country Detail Screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitForCountryList();
    // Germany has borders, languages, currencies — good all-round test subject
    await navigateToCountry('Germany', 'DEU');
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
    await element(by.id('detail-scroll')).scroll(200, 'down');
    await expect(element(by.text('Geography & Culture'))).toBeVisible();
  });

  it('shows capital info row', async () => {
    await expect(element(by.text('Berlin'))).toBeVisible();
  });

  it('shows language info row', async () => {
    await expect(element(by.text('German'))).toBeVisible();
  });

  it('shows Shares Borders With section', async () => {
    await element(by.id('detail-scroll')).scroll(300, 'down');
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
    await waitFor(element(by.text('Germany')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
