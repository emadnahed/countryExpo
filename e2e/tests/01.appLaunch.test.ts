import { waitForCountryList } from '../testUtils';

describe('App Launch', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true, launchArgs: { E2E: '1' } });
  });

  it('shows search bar on launch', async () => {
    await expect(element(by.id('search-input'))).toBeVisible();
  });

  it('shows the All region chip', async () => {
    await expect(element(by.id('region-chip-all'))).toBeVisible();
  });

  it('shows the map navigation button', async () => {
    await expect(element(by.id('map-btn'))).toBeVisible();
  });

  it('shows skeleton loader then transitions to country list', async () => {
    await waitForCountryList(30000);
  });

  it('renders at least one country card after loading', async () => {
    // Afghanistan (AFG) is always first alphabetically — confirmed by waitForCountryList
    await expect(element(by.id('country-card-AFG'))).toBeVisible();
  });
});
