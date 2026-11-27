// Mocking supabase client
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(() => ({})),
}));

import { isCurrentUserOwner } from "../functions/auth";

describe("Auth RBAC", () => {
  beforeEach(() => {
    // Mock window and localStorage properly
    const store: Record<string, string> = {};
    Object.defineProperty(global, 'window', {
      value: {
        localStorage: {
          getItem: (key: string) => store[key] || null,
          setItem: (key: string, value: string) => { store[key] = value; },
          clear: () => { Object.keys(store).forEach(k => delete store[k]); }
        }
      },
      writable: true
    });
    Object.defineProperty(global, 'localStorage', {
      value: (global as any).window.localStorage,
      writable: true
    });
  });

  test("isCurrentUserOwner returns true for owner account_type", () => {
    localStorage.setItem("user_session", JSON.stringify({ account_type: "owner" }));
    expect(isCurrentUserOwner()).toBe(true);
  });

  test("isCurrentUserOwner returns true for Owner role", () => {
    localStorage.setItem("user_session", JSON.stringify({ role: "Owner" }));
    expect(isCurrentUserOwner()).toBe(true);
  });

  test("isCurrentUserOwner returns false for regular worker", () => {
    localStorage.setItem("user_session", JSON.stringify({ account_type: "coworker", role: "Staff" }));
    expect(isCurrentUserOwner()).toBe(false);
  });
});
