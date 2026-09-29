import React, { useState } from 'react';
import { PRICING_PLANS } from '../../data/pricingPlansData';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  selectedPlanId = 'plus',
}) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [activePlan, setActivePlan] = useState<string>(selectedPlanId);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleStartTrial = () => {
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-subscription" onClick={(e) => e.stopPropagation()}>
        <button className="drawer-close-btn" onClick={onClose} aria-label="Close modal">
          ✕
        </button>

        {success ? (
          <div className="trial-success-box">
            <span style={{ fontSize: '3.5rem' }}>✨</span>
            <h2>Welcome to Veyra Hackathon PLUS!</h2>
            <p>Your 7-day all-access trial has been activated. Unlimited hackathons and masterclasses unlocked.</p>
          </div>
        ) : (
          <>
            <div className="subscription-header">
              <span className="badge-coursera-plus" style={{ margin: '0 auto 0.75rem auto' }}>
                <span className="plus-star">★</span> VEYRA PLUS PASS
              </span>
              <h2>Invest in Your Engineering Career with Unlimited Access</h2>
              <p>
                Join 120,000+ engineers building award-winning hackathon projects, earning verified credentials, and landing high-paying roles.
              </p>

              {/* Billing Cycle Toggle */}
              <div className="billing-cycle-toggle">
                <button
                  className={`toggle-btn ${billingCycle === 'annual' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('annual')}
                >
                  Annual (Save 32%)
                  <span className="save-chip">Best Value</span>
                </button>
                <button
                  className={`toggle-btn ${billingCycle === 'monthly' ? 'active' : ''}`}
                  onClick={() => setBillingCycle('monthly')}
                >
                  Monthly Billed
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            <div className="plans-cards-grid">
              {PRICING_PLANS.map((plan) => {
                const isSelected = activePlan === plan.id;
                const price = billingCycle === 'annual' ? plan.priceYear : plan.priceMonth;
                const period = billingCycle === 'annual' ? '/ year' : '/ month';

                return (
                  <div
                    key={plan.id}
                    className={`plan-modal-card ${plan.isPopular ? 'popular' : ''} ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() => setActivePlan(plan.id)}
                  >
                    {plan.isPopular && <div className="card-popular-banner">MOST POPULAR</div>}
                    <h3>{plan.name}</h3>
                    <p className="plan-tagline">{plan.tagline}</p>

                    <div className="plan-price-display">
                      <span className="plan-amount">{price}</span>
                      <span className="plan-period">{period}</span>
                    </div>

                    <ul className="plan-features-list">
                      {plan.features.slice(0, 5).map((f, idx) => (
                        <li key={idx} className={f.included ? 'included' : 'excluded'}>
                          <span className="check-bullet">{f.included ? '✓' : '—'}</span>
                          <span>
                            {f.name}
                            {f.detail && <small className="feature-sub">{f.detail}</small>}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <button
                      className={`btn-plan-select ${plan.isPopular ? 'btn-popular' : ''}`}
                      onClick={handleStartTrial}
                    >
                      {plan.ctaText}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="subscription-footer-guarantee">
              <span>🔒 14-day money-back guarantee</span>
              <span>•</span>
              <span>Cancel anytime online in 1-click</span>
              <span>•</span>
              <span>No commitments</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
