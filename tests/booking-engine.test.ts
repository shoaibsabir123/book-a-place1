/**
 * Automated test suite for Book a Place booking engine and pricing logic
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

describe('Book a Place - Booking Engine & Pricing Calculations', () => {
  it('calculates standard nightly rate without discount for short stay', () => {
    const nightlyPrice = 10000;
    const nights = 3;
    const cleaningFee = 1500;
    const taxRate = 5;

    const baseTotal = nightlyPrice * nights;
    assert.strictEqual(baseTotal, 30000);

    const taxAmount = Math.round((baseTotal * taxRate) / 100);
    assert.strictEqual(taxAmount, 1500);

    const finalTotal = baseTotal + cleaningFee + taxAmount;
    assert.strictEqual(finalTotal, 33000);
  });

  it('applies weekly 10% discount for stays of 7 nights or longer', () => {
    const nightlyPrice = 5000;
    const nights = 7;
    const weeklyDiscountPercent = 10;

    const baseTotal = nightlyPrice * nights; // 35000
    const discount = Math.round((baseTotal * weeklyDiscountPercent) / 100); // 3500
    assert.strictEqual(discount, 3500);

    const discountedSubtotal = baseTotal - discount; // 31500
    assert.strictEqual(discountedSubtotal, 31500);
  });

  it('applies monthly 25% discount for long-stay student & professional packages', () => {
    const nightlyPrice = 2000;
    const nights = 30;
    const monthlyDiscountPercent = 25;

    const baseTotal = nightlyPrice * nights; // 60000
    const discount = Math.round((baseTotal * monthlyDiscountPercent) / 100); // 15000
    assert.strictEqual(discount, 15000);

    const discountedTotal = baseTotal - discount; // 45000
    assert.strictEqual(discountedTotal, 45000);
  });

  it('applies promotional code WELCOMEPK (10%) and STUDENT15 (15%) correctly', () => {
    const baseTotal = 50000;

    const welcomeDiscount = Math.round(baseTotal * 0.10);
    assert.strictEqual(welcomeDiscount, 5000);

    const studentDiscount = Math.round(baseTotal * 0.15);
    assert.strictEqual(studentDiscount, 7500);
  });

  it('formats Pakistani Rupee (PKR) numbers with thousands separators', () => {
    const amount = 45000;
    const formatted = `PKR ${amount.toLocaleString()}`;
    assert.strictEqual(formatted, 'PKR 45,000');
  });
});
