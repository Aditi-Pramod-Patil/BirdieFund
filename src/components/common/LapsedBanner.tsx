import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CreditCard, X } from 'lucide-react';
import { SubscriptionStatus } from '../../types';

interface LapsedBannerProps {
  subscriptionStatus: SubscriptionStatus;
  onRenew: () => void;
  onDismiss?: () => void;
}

/**
 * Dismissable alert banner displayed at the top of the subscriber dashboard
 * when the subscription is lapsed, canceled, or inactive. Includes a prominent
 * "Renew Now" CTA button to redirect the user to the pricing/checkout flow.
 */
export const LapsedBanner: React.FC<LapsedBannerProps> = ({
  subscriptionStatus,
  onRenew,
  onDismiss,
}) => {
  const [isDismissed, setIsDismissed] = React.useState(false);

  // Only show for non-active statuses
  if (subscriptionStatus === 'active' || subscriptionStatus === 'none' || isDismissed) {
    return null;
  }

  const statusConfig: Record<
    string,
    { label: string; message: string; bgClass: string; borderClass: string; iconColor: string }
  > = {
    lapsed: {
      label: 'Payment Lapsed',
      message:
        'Your subscription payment has lapsed. Renew now to restore access to your dashboard, scores, and draw entries.',
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
      iconColor: 'text-amber-600',
    },
    canceled: {
      label: 'Subscription Canceled',
      message:
        'Your subscription has been canceled. You can still re-subscribe to regain access to all subscriber features.',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-200',
      iconColor: 'text-rose-600',
    },
    inactive: {
      label: 'Subscription Inactive',
      message:
        'Your account is currently inactive. Subscribe to unlock your personal dashboard, score tracking, and monthly draw entries.',
      bgClass: 'bg-slate-50',
      borderClass: 'border-slate-200',
      iconColor: 'text-slate-600',
    },
  };

  const config = statusConfig[subscriptionStatus] || statusConfig.inactive;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25 }}
        className={`relative ${config.bgClass} ${config.borderClass} border rounded-xl px-4 py-3 mb-4`}
      >
        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-md bg-white/60 hover:bg-white text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          aria-label="Dismiss subscription alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-start gap-3 pr-8">
          {/* Icon */}
          <div
            className={`w-9 h-9 rounded-lg bg-white border ${config.borderClass} flex items-center justify-center ${config.iconColor} flex-shrink-0 mt-0.5`}
          >
            <AlertTriangle className="w-4.5 h-4.5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`text-xs font-bold ${config.iconColor} uppercase tracking-wide`}>
                {config.label}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-2.5">
              {config.message}
            </p>
            <button
              onClick={onRenew}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg btn-cobalt text-xs font-semibold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <CreditCard className="w-3.5 h-3.5" />
              Renew Subscription
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
