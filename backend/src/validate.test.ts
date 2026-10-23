import assert from "node:assert/strict";
import { test } from "node:test";
import { HttpError, validAmount, validDate, validFriendName, validOtp, validPhone } from "./validate.js";

const rejects = (fn: () => unknown) => assert.throws(fn, HttpError);

test("phone accepts 10 to 15 digits with optional +", () => {
  assert.equal(validPhone("+91 98765-43210"), "+919876543210");
  assert.equal(validPhone("9876543210"), "9876543210");
  rejects(() => validPhone("12345"));
  rejects(() => validPhone("abc"));
});

test("friend name must not be empty or too long", () => {
  assert.equal(validFriendName("  Amit "), "Amit");
  rejects(() => validFriendName("   "));
  rejects(() => validFriendName("x".repeat(101)));
});

test("amount must be a positive number, rounded to 2 decimals", () => {
  assert.equal(validAmount("1200.505"), 1200.51);
  rejects(() => validAmount(0));
  rejects(() => validAmount(-5));
  rejects(() => validAmount("abc"));
});

test("due date must be a real YYYY-MM-DD date", () => {
  assert.equal(validDate("2026-11-30"), "2026-11-30");
  rejects(() => validDate("2026-13-45"));
  rejects(() => validDate("2026-02-30"));
  rejects(() => validDate("30/11/2026"));
});

test("otp must be exactly 6 digits", () => {
  assert.equal(validOtp(" 123456 "), "123456");
  rejects(() => validOtp("12345"));
  rejects(() => validOtp("abcdef"));
});
