import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Payment from "./pages/Payment";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Reservation from "./pages/Reservation";
import Signup from "./pages/Signup";
import CustomCake from "./pages/CustomCake";

import { CartProvider } from "./context/CartContext";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="app">
          <Navbar />

          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<Menu />} />
              <Route path="/about" element={<About />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/reservation" element={<Reservation />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/payment" element={<Payment />}/>
              <Route path="/custom-cake" element={<CustomCake />}/>

            </Routes>
          </main>

          <Footer />
        </div>
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;