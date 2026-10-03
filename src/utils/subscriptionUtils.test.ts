import { describe, expect, it } from 'vitest';
import { hasActiveSubscription } from './subscriptionUtils';

describe('verified subscription eligibility', () => {
  it('requires an active unexpired VIP subscription', () => {
    const now = Date.parse('2026-10-03');
    expect(hasActiveSubscription({ tier: 'vip_monthly', isActive: true, expiresAt: '2026-11-03' }, now)).toBe(true);
    for (const subscription of [
      { tier: 'vip_monthly', isActive: false, expiresAt: '2026-11-03' },
      { tier: 'vip_monthly', isActive: true, expiresAt: '2026-09-03' },
      { tier: 'vip_monthly', isActive: true },
      { tier: 'vip_yearly', isActive: true, expiresAt: 'invalid' },
      { tier: 'free', isActive: true, expiresAt: '2026-11-03' },
    ] as const) expect(hasActiveSubscription(subscription, now)).toBe(false);
  });
});
