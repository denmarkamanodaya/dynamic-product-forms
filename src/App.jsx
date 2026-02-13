import React from 'react';
import ProductList from './components/ProductList';
import Sidebar from './components/Sidebar';

function App() {
  // Parse caseId from URL query string for edit mode
  const params = new URLSearchParams(window.location.search);
  const caseId = params.get('caseId');

  return (
    <div className="App">
      <Sidebar />
      <ProductList caseId={caseId} />
    </div>
  );
}

export default App;
