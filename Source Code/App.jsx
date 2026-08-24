// App.jsx
import React, { useState } from 'react';
import Menu from './components/Menu';
import Cart from './components/Cart';
import Reservation from './components/Reservation';
import './App.css';

function App() {
  const [cart, setCart] = useState([]);
  const [currentPage, setCurrentPage] = useState('menu');

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <div className="App">
      {currentPage === 'menu' && (
        <Menu addToCart={addToCart} setCurrentPage={setCurrentPage} />
      )}
      
      {currentPage === 'cart' && (
        <Cart 
          cart={cart} 
          removeFromCart={removeFromCart} 
          clearCart={clearCart} 
          setCurrentPage={setCurrentPage} 
        />
      )}

      {currentPage === 'reservation' && (
        <Reservation setCurrentPage={setCurrentPage} />
      )}
    </div>
  );
}

export default App;