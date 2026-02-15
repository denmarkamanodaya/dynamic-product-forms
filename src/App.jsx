import React, { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import NavigationSidebar from './components/NavigationSidebar';
import LeftSidebar from './components/LeftSidebar';
import Login from './components/Login';
import CaseList from './components/CaseList';
import ChatWidget from './components/ChatWidget';
import CalendarWidget from './components/CalendarWidget';
import HistoryWidget from './components/HistoryWidget';
import SalesDashboard from './components/SalesDashboard';
import UserCreate from './components/UserCreate';
import ClientCreate from './components/ClientCreate';
import { NotificationProvider } from './context/NotificationContext';
import Notification from './components/Notification';
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

  const toggleChat = (status) => {
    const newStatus = status !== undefined ? status : !isChatOpen;
    setIsChatOpen(newStatus);
    if (newStatus) {
      setIsCalendarOpen(false);
      setIsHistoryOpen(false);
    }
  };

  const toggleCalendar = (status) => {
    const newStatus = status !== undefined ? status : !isCalendarOpen;
    setIsCalendarOpen(newStatus);
    if (newStatus) {
      setIsChatOpen(false);
      setIsHistoryOpen(false);
    }
  };

  const toggleHistory = (status) => {
    const newStatus = status !== undefined ? status : !isHistoryOpen;
    setIsHistoryOpen(newStatus);
    if (newStatus) {
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
          onNewCase={() => handleNavigate('form')}
        />

        <NavigationSidebar
          currentView={view}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <div className="main-layout" style={{ marginLeft: '340px', width: 'calc(100% - 340px)' }}>
          <div className="main-content">
            {view === 'list' ? (
              <CaseList onSelectCase={handleCaseSelect} />
            ) : view === 'dashboard' ? (
              <SalesDashboard />
            ) : view === 'user-create' ? (
              <UserCreate onNavigate={handleNavigate} />
            ) : view === 'client-create' ? (
              <ClientCreate onNavigate={handleNavigate} />
            ) : (
              <ProductList
                caseId={selectedCaseId}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </div>

        <ChatWidget currentUser={currentUser} isOpen={isChatOpen} onToggle={toggleChat} />
        <CalendarWidget isOpen={isCalendarOpen} onToggle={toggleCalendar} />
        <HistoryWidget isOpen={isHistoryOpen} onToggle={toggleHistory} />
        <Notification />
      </div>
    </NotificationProvider>
  );
}

export default App;
