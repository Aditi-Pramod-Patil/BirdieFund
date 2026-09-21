import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Toast } from './components/common/Toast';
import { AuthModal } from './components/common/AuthModal';
import { StripeCheckoutModal } from './components/common/StripeCheckoutModal';
import { LapsedBanner } from './components/common/LapsedBanner';
import { LandingPage } from './components/landing/LandingPage';
import { SubscriberDashboard } from './components/subscriber/SubscriberDashboard';
import { CharityDirectory } from './components/charities/CharityDirectory';
import { AdminControlPanel } from './components/admin/AdminControlPanel';
import { HowItWorksView } from './components/public/HowItWorksView';
import { PrizePoolsView } from './components/public/PrizePoolsView';

const MainLayout: React.FC = () => {
  const { currentRole, currentUser, showToast } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isStripeOpen, setIsStripeOpen] = useState(false);

  // ROUTE GUARD MIDDLEWARE: Restrict /dashboard to active subscribers and /admin strictly to role = 'admin'
  const handleTabChange = (tab: string) => {
    // 1. Guard /admin: strictly restricted to users with role = 'admin'
    if (tab === 'admin') {
      if (currentRole !== 'admin') {
        // Redirect authenticated non-admin subscribers to dashboard with 403-style error
        if (currentRole === 'subscriber') {
          showToast('⛔ 403 Forbidden: Administrator role required. Redirecting to your dashboard.');
          setCurrentTab('dashboard');
        } else {
          showToast('Access Denied: Administrator role required for Executive Portal.');
        }
        return;
      }
    }

    // 2. Guard /dashboard, scores, draws, claim-winnings: restricted to authenticated, active subscribers
    if (tab === 'dashboard' || tab === 'scores' || tab === 'draws' || tab === 'claim-winnings') {
      // Not authenticated
      if (currentRole !== 'subscriber' && currentRole !== 'admin') {
        showToast('Active subscriber membership required to access the dashboard.');
        setIsAuthOpen(true);
        return;
      }
      // Subscriber with inactive/lapsed/canceled subscription -> redirect to pricing
      if (currentRole === 'subscriber' && currentUser.subscriptionStatus !== 'active') {
        showToast('Your subscription is currently inactive. Please renew to access your scorecard tracker.');
        setCurrentTab('pricing');
        setIsStripeOpen(true);
        return;
      }
    }

    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Keep active tab synchronized when user switches demo roles
  const prevRoleRef = React.useRef(currentRole);
  useEffect(() => {
    if (prevRoleRef.current !== currentRole) {
      prevRoleRef.current = currentRole;
      if (currentRole === 'admin' && currentTab !== 'charities') {
        setCurrentTab('admin');
      } else if (currentRole === 'subscriber' && (currentTab === 'home' || currentTab === 'pricing' || currentTab === 'admin')) {
        setCurrentTab('dashboard');
      } else if (currentRole === 'visitor' && (currentTab === 'dashboard' || currentTab === 'scores' || currentTab === 'draws' || currentTab === 'admin')) {
        setCurrentTab('home');
      }
    }
  }, [currentRole, currentTab]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-blue-100 selection:text-blue-800 font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={handleTabChange}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenStripe={() => setIsStripeOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <LandingPage
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenStripe={() => setIsStripeOpen(true)}
            onExploreCharities={() => handleTabChange('charities')}
          />
        )}

        {currentTab === 'how-it-works' && (
          <HowItWorksView
            onOpenStripe={() => setIsStripeOpen(true)}
            onExploreCharities={() => handleTabChange('charities')}
          />
        )}

        {currentTab === 'charities' && (
          <CharityDirectory onOpenStripe={() => setIsStripeOpen(true)} />
        )}

        {currentTab === 'prize-pools' && (
          <PrizePoolsView onOpenStripe={() => setIsStripeOpen(true)} />
        )}

        {currentTab === 'pricing' && (
          <LandingPage
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenStripe={() => setIsStripeOpen(true)}
            onExploreCharities={() => handleTabChange('charities')}
          />
        )}

        {(currentTab === 'dashboard' || currentTab === 'scores' || currentTab === 'draws') && (
          <>
            {/* Lapsed Subscription Banner — shown when subscription is not active */}
            {currentRole === 'subscriber' && currentUser.subscriptionStatus !== 'active' && (
              <div className="max-w-7xl mx-auto px-4 pt-4">
                <LapsedBanner
                  subscriptionStatus={currentUser.subscriptionStatus}
                  onRenew={() => setIsStripeOpen(true)}
                />
              </div>
            )}
            <SubscriberDashboard
              onOpenStripe={() => setIsStripeOpen(true)}
              onExploreCharities={() => handleTabChange('charities')}
            />
          </>
        )}

        {currentTab === 'admin' && <AdminControlPanel />}
      </main>

      {/* Global Footer */}
      <Footer setCurrentTab={handleTabChange} />

      {/* Toast Notification Container */}
      <Toast />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onOpenStripe={() => setIsStripeOpen(true)}
      />

      {/* Stripe Payment Simulator Modal */}
      <StripeCheckoutModal
        isOpen={isStripeOpen}
        onClose={() => setIsStripeOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
