import { Link, NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useEffect, useState } from "react";
import logo from "../assets/bdlogo.png";

function Navbar() {
  const { totalItems } = useCart();
  const navigate = useNavigate();

  const [showNavbar, setShowNavbar] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // =========================
  // CHATBOT
  // =========================

  const [chatOpen, setChatOpen] = useState(false);


  // =========================
  // DARK MODE
  // =========================

  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem(
      "bakedrop-dark-mode"
    );

    return savedMode !== "false";
  });


  // =========================
  // APPLY DARK MODE
  // =========================

  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
    }

    localStorage.setItem(
      "bakedrop-dark-mode",
      darkMode
    );
  }, [darkMode]);


  // =========================
  // HIDE NAVBAR ON SCROLL
  // =========================

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (
        currentScrollY > lastScrollY &&
        currentScrollY > 50
      ) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);


  // =========================
  // CLOSE SETTINGS WITH ESC
  // =========================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSettingsOpen(false);
        setChatOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);


  // =========================
  // SEARCH
  // =========================

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    if (!query) {
      navigate("/menu");
      return;
    }

    navigate(
      `/menu?search=${encodeURIComponent(query)}`
    );
  };


  // =========================
  // TOGGLE DARK MODE
  // =========================

  const toggleDarkMode = () => {
    setDarkMode(
      (previous) => !previous
    );
  };


  return (
    <>
      {/* =========================
          TOP CONTROLS
      ========================= */}

      <div
        className={`top-controls ${
          showNavbar
            ? "top-controls-visible"
            : "top-controls-hidden"
        }`}
      >

        {/* SETTINGS BUTTON */}

        <button
          className={`settings-button ${
            settingsOpen
              ? "settings-active"
              : ""
          }`}
          aria-label="Open settings"
          onClick={() =>
            setSettingsOpen(!settingsOpen)
          }
        >
          <span></span>
          <span></span>
          <span></span>
        </button>


        {/* SEARCH */}

        <form
          className="top-search"
          onSubmit={handleSearch}
        >

          <span className="search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button
              type="button"
              className="search-clear"
              onClick={() =>
                setSearch("")
              }
            >
              ×
            </button>
          )}

        </form>

      </div>


      {/* =========================
          SETTINGS SIDEBAR
      ========================= */}

      {settingsOpen && (
        <>
          <div
            className="settings-overlay"
            onClick={() =>
              setSettingsOpen(false)
            }
          ></div>

          <aside className="settings-panel">

            {/* HEADER */}

            <div className="settings-header">

              <div>

                <span className="eyebrow">
                  BAKEDROP
                </span>

                <h2>
                  Settings
                </h2>

              </div>

              <button
                className="settings-close"
                onClick={() =>
                  setSettingsOpen(false)
                }
              >
                ×
              </button>

            </div>


            {/* CONTENT */}

            <div className="settings-content">

              {/* DARK MODE */}

              <div className="settings-option theme-option">

                <div>

                  <strong>
                    Dark Mode
                  </strong>

                  <p>
                    Use the dark BakeDrop theme.
                  </p>

                </div>

                <button
                  className={`theme-toggle ${
                    darkMode
                      ? "theme-toggle-on"
                      : ""
                  }`}
                  onClick={toggleDarkMode}
                  aria-label="Toggle dark mode"
                >

                  <span></span>

                </button>

              </div>


              {/* ACCOUNT */}

              <div className="settings-option">

                <div>

                  <strong>
                    Account
                  </strong>

                  <p>
                    Manage your BakeDrop account.
                  </p>

                </div>

                <Link
                  to="/signup"
                  onClick={() =>
                    setSettingsOpen(false)
                  }
                >
                  Open
                </Link>

              </div>


              {/* BAG */}

              <div className="settings-option">

                <div>

                  <strong>
                    My Bag
                  </strong>

                  <p>
                    View your current orders and bag.
                  </p>

                </div>

                <Link
                  to="/cart"
                  onClick={() =>
                    setSettingsOpen(false)
                  }
                >
                  Open
                </Link>

              </div>


              {/* MENU */}

              <div className="settings-option">

                <div>

                  <strong>
                    Menu
                  </strong>

                  <p>
                    Browse all available bakery products.
                  </p>

                </div>

                <Link
                  to="/menu"
                  onClick={() =>
                    setSettingsOpen(false)
                  }
                >
                  Browse
                </Link>

              </div>


              {/* RESERVATION */}

              <div className="settings-option">

                <div>

                  <strong>
                    Reservation
                  </strong>

                  <p>
                    Schedule your pickup or delivery.
                  </p>

                </div>

                <Link
                  to="/reservation"
                  onClick={() =>
                    setSettingsOpen(false)
                  }
                >
                  Open
                </Link>

              </div>

            </div>

          </aside>
        </>
      )}


      {/* =========================
          CHATBOT PLACEHOLDER
      ========================= */}

      {chatOpen && (
        <div className="chatbot-box">

          {/* CHAT HEADER */}

          <div className="chatbot-header">

            <div>

              <span>
                BAKEDROP AI
              </span>

              <strong>
                How can we help?
              </strong>

            </div>

            <button
              type="button"
              className="chatbot-close"
              onClick={() =>
                setChatOpen(false)
              }
              aria-label="Close chat"
            >
              ×
            </button>

          </div>


          {/* CHAT BODY */}

          <div className="chatbot-body">

            <div className="chatbot-message">

              Hi! I'm BakeDrop's
              virtual assistant.

              <br />
              <br />

              Ling AI will be connected
              here soon.

            </div>

          </div>


          {/* CHAT INPUT */}

          <div className="chatbot-input">

            <input
              type="text"
              placeholder="Ask us anything..."
              disabled
            />

            <button
              type="button"
              disabled
              aria-label="Send message"
            >
              →
            </button>

          </div>

        </div>
      )}


      {/* =========================
          BOTTOM NAVBAR
      ========================= */}

      <header
        className={`navbar ${
          showNavbar
            ? "navbar-visible"
            : "navbar-hidden"
        }`}
      >

        {/* LOGO */}

        <Link
          to="/"
          className="navbar-logo"
        >

          <img
            src={logo}
            alt="BakeDrop"
          />

          <span>
            BAKEDROP
          </span>

        </Link>


        {/* NAVIGATION */}

        <nav className="navbar-links">

          <NavLink to="/">
            Home
          </NavLink>

          <NavLink to="/menu">
            Menu
          </NavLink>

          <NavLink to="/about">
            About Us
          </NavLink>

          <NavLink to="/reservation">
            Reservation
          </NavLink>

        </nav>


        {/* ACTIONS */}

        <div className="navbar-actions">

          {/* CHAT */}

          <button
            type="button"
            className={`navbar-chat ${
              chatOpen
                ? "navbar-chat-active"
                : ""
            }`}
            onClick={() =>
              setChatOpen(
                (previous) => !previous
              )
            }
            aria-label="Open BakeDrop AI chat"
          >

            <span className="chat-icon">
              💬
            </span>

            <span className="chat-text">
              Chat
            </span>

          </button>


          {/* BAG */}

          <Link
            to="/cart"
            className="cart-link"
          >

            Bag

            {totalItems > 0 && (
              <span className="cart-count">
                {totalItems}
              </span>
            )}

          </Link>


          {/* SIGN UP */}

          <Link
            to="/signup"
            className="signup-link"
          >
            Sign Up
          </Link>

        </div>

      </header>

    </>
  );
}

export default Navbar;