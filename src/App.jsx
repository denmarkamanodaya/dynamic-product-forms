import React, { useState, useEffect } from 'react';
import ProductList from './components/ProductList';
import TopNavbar from './components/TopNavbar';
import CaseList from './components/CaseList';
import Login from './components/Login';
import ChatWidget from './components/ChatWidget';
import './App.css';

function App() {
  // Parse caseId from URL query string for edit mode (initial load)
  const params = new URLSearchParams(window.location.search);
  const initialCaseId = params.get('caseId');

  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState(initialCaseId ? 'form' : 'list'); // 'list' or 'form'
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);

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

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App">
      <TopNavbar
        currentView={view}
        onNavigate={handleNavigate}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="main-content">
        {view === 'list' ? (
          <CaseList onSelectCase={handleCaseSelect} />
        ) : (
          <ProductList caseId={selectedCaseId} />
        )}
      </div>

      <ChatWidget currentUser={currentUser} />
    </div>
  );
}

export default App;
