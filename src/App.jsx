import React, { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import NavigationSidebar from './components/NavigationSidebar';
import LeftSidebar from './components/LeftSidebar';
import Login from './components/Login';
import CaseList from './components/CaseList';
import MyCases from './components/MyCases';
import AIChat from './components/AIChat';
import CalendarWidget from './components/CalendarWidget';
import HistoryWidget from './components/HistoryWidget';
import SalesDashboard from './components/SalesDashboard';
import UserDirectory from './components/UserDirectory';
import ClientDirectory from './components/ClientDirectory';
import Settings from './components/Settings';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
import FireTwitPage from './components/FireTwitPage';
import { LICENSE_KEY } from './config';
import { checkLicenseStatus } from './utils/licenseManager';
import { CaseService } from './services/api';
import './App.css';

function App() {
  // ... (existing state) ...
  const params = new URLSearchParams(window.location.search);
  const initialCaseId = params.get('caseId');

  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState(initialCaseId ? 'form' : 'list'); // 'list' or 'form'
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);

  // Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState({ isValid: true });

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  useEffect(() => {
    const validateLicense = async () => {
      if (currentUser) {
        let caseCount = 0;
        try {
          // Fetch all cases to count them. 
          // Optimization: In a real app, an API endpoint returning just the count would be better.
          const response = await CaseService.list();
          const cases = Array.isArray(response) ? response : (response.data || []);
          caseCount = cases.length;
        } catch (error) {
          console.error("Failed to fetch case count for license check:", error);
          // We might want to handle this gracefully or default to 0 to avoid blocking if API fails?
          // For now, proceeding with 0 case count if fetch fails.
        }

        const status = checkLicenseStatus(LICENSE_KEY, { caseCount });
        setLicenseStatus(status);
      }
    };

    validateLicense();
  }, [currentUser]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setView('list'); // Reset view on logout
  };

  const handleNavigate = (newView) => {
    // Role-based access control
    if (['dashboard', 'user-create', 'user-list'].includes(newView)) {
      const isAdmin = ['superadmin', 'admin'].includes(currentUser?.role);
      if (!isAdmin) {
        console.warn("Unauthorized access attempt to", newView);
        return; // Prevent navigation
      }
    }

    if (newView === 'settings' && !['superadmin', 'admin'].includes(currentUser?.role)) {
      console.warn("Unauthorized access attempt to settings");
      return;
    }

    setView(newView);
    if (newView === 'list') {
      setSelectedCaseId(null);
      // Clear URL params without reloading to keep state clean
      window.history.pushState({}, '', window.location.pathname);
    } else if (newView === 'form' && !selectedCaseId) {
      // New Case
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const handleCaseSelect = (caseId) => {
    setSelectedCaseId(caseId);
    setView('form');
    // Update URL to reflect selected case (optional but good for sharing/refreshing)
    const newUrl = `${window.location.pathname}?caseId=${caseId}`;
    window.history.pushState({}, '', newUrl);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    if (!isChatOpen) {
      setIsCalendarOpen(false);
      setIsHistoryOpen(false);
    }
  };

  const toggleCalendar = () => {
    setIsCalendarOpen(!isCalendarOpen);
    if (!isCalendarOpen) {
      setIsChatOpen(false);
      setIsHistoryOpen(false);
    }
  };

  const toggleHistory = () => {
    setIsHistoryOpen(!isHistoryOpen);
    if (!isHistoryOpen) {
      setIsChatOpen(false);
      setIsCalendarOpen(false);
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <NotificationProvider>
      <div className="App">
        <LeftSidebar
          isChatOpen={isChatOpen}
          onToggleChat={() => toggleChat()}
          isCalendarOpen={isCalendarOpen}
          onToggleCalendar={() => toggleCalendar()}
          isHistoryOpen={isHistoryOpen}
          onToggleHistory={() => toggleHistory()}
          currentUser={currentUser}
          onToggleNav={() => setIsNavOpen(!isNavOpen)}
        />

        <NavigationSidebar
          currentView={view}
          onNavigate={(v) => { handleNavigate(v); setIsNavOpen(false); }}
          currentUser={currentUser}
          onLogout={handleLogout}
          isOpen={isNavOpen}
          onClose={() => setIsNavOpen(false)}
        />

        <div className="main-layout">
          <div className="main-content">
            {view === 'list' ? (
              <CaseList
                onSelectCase={handleCaseSelect}
                currentUser={currentUser}
                onNavigate={handleNavigate}
              />
            ) : view === 'dashboard' ? (
              <SalesDashboard />
            ) : view === 'my-cases' ? (
              <MyCases currentUser={currentUser} onNavigate={handleNavigate} />
            ) : view === 'user-create' || view === 'user-list' ? (
              <UserDirectory onNavigate={handleNavigate} />
            ) : view === 'client-list' || view === 'client-create' ? (
              <ClientDirectory onNavigate={handleNavigate} />
            ) : view === 'settings' ? (
              <Settings />
            ) : view === 'firetwit' ? (
              <FireTwitPage
                onNavigate={handleNavigate}
                currentUser={currentUser}
                onSelectCase={handleCaseSelect}
              />
            ) : (
              <ProductList
                caseId={selectedCaseId}
                onNavigate={handleNavigate}
                currentUser={currentUser}
              />
            )}
          </div>
        </div>

        <AIChat currentUser={currentUser} isOpen={isChatOpen} onToggle={toggleChat} />
        <CalendarWidget isOpen={isCalendarOpen} onToggle={toggleCalendar} />
        <HistoryWidget isOpen={isHistoryOpen} onToggle={toggleHistory} />
        <Notification />

        {/* License Overlay */}
        {!licenseStatus.isValid && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white'
          }}>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '2rem',
              borderRadius: '8px',
              textAlign: 'center',
              border: '1px solid #ef4444',
              maxWidth: '500px'
            }}>
              <h2 style={{ color: '#ef4444', marginTop: 0 }}>License Inactive</h2>
              <p>{licenseStatus.message || "Your license is no longer active. Please contact support."}</p>

              <button
                onClick={handleLogout}
                className="glass-btn secondary"
                style={{ marginTop: '1.5rem', fontSize: '0.9rem', padding: '0.5rem 1rem' }}
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </NotificationProvider>
  );
}

export default App;
