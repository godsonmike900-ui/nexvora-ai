import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MainDashboard } from './components/dashboard/MainDashboard';
import { AIAssistantView } from './components/assistant/AIAssistantView';
import { MarketingStudioView } from './components/marketing/MarketingStudioView';
import { BusinessWriterView } from './components/writer/BusinessWriterView';
import { InvoiceManagerView } from './components/invoice/InvoiceManagerView';
import { SalesExpenseView } from './components/finance/SalesExpenseView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { SettingsView } from './components/settings/SettingsView';
import { LegalView } from './components/legal/LegalView';
import { Footer } from './components/layout/Footer';
import { PricingModal } from './components/pricing/PricingModal';
import { AuthModal } from './components/auth/AuthModal';
import { ShortcutsModal } from './components/common/ShortcutsModal';
import { DownloadAppModal } from './components/common/DownloadAppModal';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthScreen } from './components/auth/AuthScreen';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const AppContent: React.FC = () => {
  const {
    user,
    activeView,
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    isDownloadModalOpen,
    setIsDownloadModalOpen,
  } = useApp();
  useKeyboardShortcuts();

  // If unauthenticated, display the dedicated mobile & web onboarding interface
  if (!user) {
    return (
      <div className="min-h-screen bg-[#050811] text-slate-100 font-sans selection:bg-cyan-500 selection:text-black">
        <AuthScreen />
        <DownloadAppModal
          isOpen={isDownloadModalOpen}
          onClose={() => setIsDownloadModalOpen(false)}
        />
        <ToastContainer />
      </div>
    );
  }

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <MainDashboard />;
      case 'assistant':
        return <AIAssistantView />;
      case 'marketing':
        return <MarketingStudioView />;
      case 'writer':
        return <BusinessWriterView />;
      case 'invoices':
        return <InvoiceManagerView />;
      case 'finance':
        return <SalesExpenseView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'settings':
        return <SettingsView />;
      case 'legal':
        return <LegalView />;
      default:
        return <MainDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex flex-col justify-between pb-16 lg:pb-0">
          <div className="flex-1">
            {renderCurrentView()}
          </div>
          <Footer />
        </main>
      </div>
      <MobileBottomNav />
      <PricingModal />
      <AuthModal />
      <ShortcutsModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
