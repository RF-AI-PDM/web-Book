import type { SubscriptionInfo } from '../types';

export function hasActiveSubscription(subscription: SubscriptionInfo, now = Date.now()): boolean {
  return (subscription.tier === 'vip_monthly' || subscription.tier === 'vip_yearly')
    && subscription.isActive === true
    && typeof subscription.expiresAt === 'string'
    && Date.parse(subscription.expiresAt) > now;
}
