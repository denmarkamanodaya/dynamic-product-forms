import React, { useState } from 'react';
import ProductList from './components/ProductList';
import TopNavbar from './components/TopNavbar';
import CaseList from './components/CaseList';
import './App.css';

function App() {
  // Parse caseId from URL query string for edit mode (initial load)
  const params = new URLSearchParams(window.location.search);
  const initialCaseId = params.get('caseId');

  const [view, setView] = useState(initialCaseId ? 'form' : 'list'); // 'list' or 'form'
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);

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

  return (
    <div className="App">
      <TopNavbar currentView={view} onNavigate={handleNavigate} />

      <div className="main-content">
        {view === 'list' ? (
          <CaseList onSelectCase={handleCaseSelect} />
        ) : (
          <ProductList caseId={selectedCaseId} />
        )}
      </div>
    </div>
  );
}

export default App;
