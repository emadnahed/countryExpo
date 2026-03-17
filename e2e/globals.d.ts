/**
 * Minimal Jest lifecycle globals for E2E tests.
 * We intentionally do NOT redeclare `expect` here because Detox provides
 * its own `expect` global in globals.d.ts with the correct Detox matchers.
 * Including @types/jest would shadow Detox's expect, breaking .toBeVisible() etc.
 */
declare function describe(name: string, fn: () => void): void;
declare function describe(name: string, fn: () => Promise<void>): void;
declare namespace describe {
  function only(name: string, fn: () => void): void;
  function skip(name: string, fn: () => void): void;
}

declare function it(name: string, fn: () => void | Promise<void>, timeout?: number): void;
declare function test(name: string, fn: () => void | Promise<void>, timeout?: number): void;
declare namespace it {
  function only(name: string, fn: () => void | Promise<void>): void;
  function skip(name: string, fn: () => void | Promise<void>): void;
}

declare function beforeAll(fn: () => void | Promise<void>, timeout?: number): void;
declare function beforeEach(fn: () => void | Promise<void>, timeout?: number): void;
declare function afterAll(fn: () => void | Promise<void>, timeout?: number): void;
declare function afterEach(fn: () => void | Promise<void>, timeout?: number): void;
