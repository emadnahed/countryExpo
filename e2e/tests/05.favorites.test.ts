/**
 * Favorites — CRUD lifecycle (the GET / POST / DELETE pattern)
 *
 * Maps app-level actions onto the REST idiom the user described:
 *
 *   GET  favorites list  → empty initially
 *   POST (add favorite)  → creates the entry
 *   GET  favorites list  → now returns the entry (persisted via MMKV)
 *   DELETE (remove)      → removes the entry
 *   GET  favorites list  → empty again
 *
 * Each "GET" is validated by restarting the app and confirming the
 * persisted state matches expectations.
 */
import { waitForCountryList, navigateToCountry } from '../testUtils';

const COUNTRY_NAME = 'Germany';
const COUNTRY_CCA3 = 'DEU';

describe('Favorites CRUD lifecycle', () => {
  // ─── SETUP ────────────────────────────────────────────────────────────────
  describe('Setup: fresh install with no favorites', () => {
    beforeAll(async () => {
      // delete: true → reinstalls the app, wiping all MMKV data
      await device.launchApp({ delete: true });
      await waitForCountryList();
    });

    it('app starts with a clean state (no favorites persisted)', async () => {
      await expect(element(by.id('country-list'))).toBeVisible();
    });
  });

  // ─── GET (empty) ──────────────────────────────────────────────────────────
  describe('GET: favorites list is empty before any POST', () => {
    beforeAll(async () => {
      await device.launchApp({ newInstance: true });
      await waitForCountryList();
      await navigateToCountry(COUNTRY_NAME, COUNTRY_CCA3);
    });

    it('country detail screen is visible', async () => {
      await expect(element(by.id('country-name'))).toBeVisible();
      await expect(element(by.text(COUNTRY_NAME))).toBeVisible();
    });

    it('favorite button is in inactive state (not yet favorited)', async () => {
      await expect(element(by.id('favorite-btn-inactive'))).toBeVisible();
      await expect(element(by.id('favorite-btn-active'))).not.toBeVisible();
    });
  });

  // ─── POST (create) ────────────────────────────────────────────────────────
  describe('POST: tapping favorite adds the entry', () => {
    beforeAll(async () => {
      await device.launchApp({ newInstance: true });
      await waitForCountryList();
      await navigateToCountry(COUNTRY_NAME, COUNTRY_CCA3);
    });

    it('tapping the inactive favorite button activates it', async () => {
      await element(by.id('favorite-btn-inactive')).tap();
      await waitFor(element(by.id('favorite-btn-active')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('favorite button is now in active state', async () => {
      await expect(element(by.id('favorite-btn-active'))).toBeVisible();
      await expect(element(by.id('favorite-btn-inactive'))).not.toBeVisible();
    });
  });

  // ─── GET (after POST) — persistence check ─────────────────────────────────
  describe('GET: favorites list contains the entry after POST + app restart', () => {
    beforeAll(async () => {
      // Restart without delete — MMKV data survives
      await device.launchApp({ newInstance: true });
      await waitForCountryList();
      await navigateToCountry(COUNTRY_NAME, COUNTRY_CCA3);
    });

    it('favorite is still active after restarting the app (MMKV persisted)', async () => {
      await expect(element(by.id('favorite-btn-active'))).toBeVisible();
      await expect(element(by.id('favorite-btn-inactive'))).not.toBeVisible();
    });

    it('country details are still displayed correctly', async () => {
      await expect(element(by.text(COUNTRY_NAME))).toBeVisible();
      await expect(element(by.id('stat-population'))).toBeVisible();
      await expect(element(by.id('stat-region'))).toBeVisible();
    });
  });

  // ─── DELETE ───────────────────────────────────────────────────────────────
  describe('DELETE: tapping active favorite removes the entry', () => {
    beforeAll(async () => {
      await device.launchApp({ newInstance: true });
      await waitForCountryList();
      await navigateToCountry(COUNTRY_NAME, COUNTRY_CCA3);
    });

    it('tapping the active favorite button deactivates it', async () => {
      await element(by.id('favorite-btn-active')).tap();
      await waitFor(element(by.id('favorite-btn-inactive')))
        .toBeVisible()
        .withTimeout(3000);
    });

    it('favorite button returns to inactive state', async () => {
      await expect(element(by.id('favorite-btn-inactive'))).toBeVisible();
      await expect(element(by.id('favorite-btn-active'))).not.toBeVisible();
    });
  });

  // ─── GET (after DELETE) — persistence check ───────────────────────────────
  describe('GET: favorites list is empty again after DELETE + app restart', () => {
    beforeAll(async () => {
      // Restart without delete — deletion must have persisted to MMKV
      await device.launchApp({ newInstance: true });
      await waitForCountryList();
      await navigateToCountry(COUNTRY_NAME, COUNTRY_CCA3);
    });

    it('favorite remains removed after restarting the app', async () => {
      await expect(element(by.id('favorite-btn-inactive'))).toBeVisible();
      await expect(element(by.id('favorite-btn-active'))).not.toBeVisible();
    });
  });
});
