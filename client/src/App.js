import React from 'react';
import Layout from './components/Layout';
import ProductList from './components/ProductList';
import './App.css';

function App() {
  return (
    <Layout>
      {/* Content for the page will go here */}
      <ProductList />
    </Layout>
  );
}

export default App;
