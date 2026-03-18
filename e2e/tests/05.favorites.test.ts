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
 * Persistence is verified by restarting the app (MMKV survives a newInstance
 * restart but is wiped by delete: true). Only two restarts are needed:
 *   1. After POST  — verify the add persisted
 *   2. After DELETE — verify the remove persisted
 *
 * This means 3 app launches instead of 6:
 *   Phase A (delete: true) — fresh install, GET-empty, POST
 *   Phase B (newInstance)  — GET-after-POST persistence check, DELETE
 *   Phase C (newInstance)  — GET-after-DELETE persistence check
 */
import { waitForCountryList, navigateToCountry } from '../testUtils';

const COUNTRY_NAME = 'Germany';
const COUNTRY_CCA3 = 'DEU';

describe('Favorites CRUD lifecycle', () => {
  // ─── PHASE A: fresh install → GET-empty → POST ────────────────────────────
  describe('Phase A: fresh install — verify empty state then add favorite', () => {
    beforeAll(async () => {
      // delete: true → reinstalls the app, wiping all MMKV data
      await device.launchApp({ delete: true, launchArgs: { E2E: '1' } });
      await waitForCountryList();
      await navigateToCountry(COUNTRY_NAME, COUNTRY_CCA3);
    });

    it('app starts with a clean state — country detail screen is reachable', async () => {
      await expect(element(by.id('country-name'))).toBeVisible();
      await expect(element(by.text(COUNTRY_NAME))).toBeVisible();
    });

    it('favorite button is in inactive state (GET-empty: not yet favorited)', async () => {
      await expect(element(by.id('favorite-btn-inactive'))).toBeVisible();
      await expect(element(by.id('favorite-btn-active'))).not.toBeVisible();
    });

    it('tapping the inactive favorite button activates it (POST)', async () => {
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

  // ─── PHASE B: GET-after-POST persistence check + DELETE ───────────────────
  describe('Phase B: verify POST persisted, then remove favorite (DELETE)', () => {
    beforeAll(async () => {
      // Restart without delete — MMKV data from Phase A survives
      await device.launchApp({ newInstance: true, launchArgs: { E2E: '1' } });
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

    it('tapping the active favorite button deactivates it (DELETE)', async () => {
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

  // ─── PHASE C: GET-after-DELETE persistence check ──────────────────────────
  describe('Phase C: verify DELETE persisted after app restart', () => {
    beforeAll(async () => {
      // Restart without delete — deletion must have persisted to MMKV
      await device.launchApp({ newInstance: true, launchArgs: { E2E: '1' } });
      await waitForCountryList();
      await navigateToCountry(COUNTRY_NAME, COUNTRY_CCA3);
    });

    it('favorite remains removed after restarting the app', async () => {
      await expect(element(by.id('favorite-btn-inactive'))).toBeVisible();
      await expect(element(by.id('favorite-btn-active'))).not.toBeVisible();
    });
  });
});
