import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Payment from "./pages/Payment";
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import About from "./pages/About";
import Cart from "./pages/Cart";
import Reservation from "./pages/Reservation";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Account from "./pages/Account";
import MyOrders from "./pages/MyOrders";
import CustomCake from "./pages/CustomCake";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSchedule from "./pages/admin/AdminSchedule";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminRiderAssignment from "./pages/admin/AdminRiderAssignment";

import { CartProvider } from "./context/CartContext";

import "./App.css";


// =====================================================
// APP CONTENT
// =====================================================

function AppContent() {
  const location = useLocation();

  // Hide customer Navbar/Footer on admin pages
  const isAdminPage =
    location.pathname.startsWith("/admin");

  return (
    <div className="app">

      {/* =================================================
          CUSTOMER NAVBAR
      ================================================= */}

      {!isAdminPage && (
        <Navbar />
      )}


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main>

        <Routes>

          {/* =================================================
              CUSTOMER ROUTES
          ================================================= */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/menu"
            element={<Menu />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          <Route
            path="/my-orders"
            element={<MyOrders />}
          />

          <Route
            path="/account"
            element={<Account />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/payment"
            element={<Payment />}
          />

          <Route
            path="/custom-cake"
            element={<CustomCake />}
          />

          <Route
            path="/reservation"
            element={<Reservation />}
          />


          {/* =================================================
              ADMIN ROUTES
          ================================================= */}

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/schedule"
            element={<AdminSchedule />}
          />

          <Route
            path="/admin/orders"
            element={<AdminOrders />}
          />

          <Route
            path="/admin/products"
            element={<AdminProducts />}
          />

          <Route
            path="/admin/rider-assignment"
            element={<AdminRiderAssignment />}
          />

        </Routes>

      </main>


      {/* =================================================
          CUSTOMER FOOTER
      ================================================= */}

      {!isAdminPage && (
        <Footer />
      )}

    </div>
  );
}


// =====================================================
// APP
// =====================================================

function App() {
  return (
    <BrowserRouter>

      <CartProvider>

        <AppContent />

      </CartProvider>

    </BrowserRouter>
  );
}

export default App;