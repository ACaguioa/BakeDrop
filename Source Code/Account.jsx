
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Account() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const savedUser =
      localStorage.getItem("bakedrop-user");

    if (!savedUser) {
      navigate("/login");
      return;
    }

    try {
      setUser(
        JSON.parse(savedUser)
      );
    } catch (error) {
      console.error(
        "Invalid user data:",
        error
      );

      localStorage.removeItem(
        "bakedrop-user"
      );

      localStorage.removeItem(
        "bakedrop-token"
      );

      navigate("/login");
    }
  }, [navigate]);


  // =====================================================
  // SIGN OUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem(
      "bakedrop-token"
    );

    localStorage.removeItem(
      "bakedrop-user"
    );

    navigate("/login");
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (!user) {
    return null;
  }


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <section className="account-page">

      <div className="account-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <span className="eyebrow">
          BAKEDROP MEMBERS
        </span>

        <h1>
          My <em>account.</em>
        </h1>

        <p className="account-subtitle">
          Manage your BakeDrop account
          and personal information.
        </p>


        {/* =================================================
            ACCOUNT HEADER CARD
        ================================================= */}

        <div className="account-card">

          <div className="account-avatar">
            {user.first_name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <div className="account-info">

            <h2>
              {user.first_name}{" "}
              {user.last_name}
            </h2>

            <p className="account-email">
              {user.email}
            </p>

          </div>

        </div>


        {/* =================================================
            ACCOUNT DETAILS
        ================================================= */}

        <div className="account-details">

          <div className="account-detail">

            <span>
              First Name
            </span>

            <strong>
              {user.first_name || "—"}
            </strong>

          </div>


          <div className="account-detail">

            <span>
              Last Name
            </span>

            <strong>
              {user.last_name || "—"}
            </strong>

          </div>


          <div className="account-detail">

            <span>
              Email
            </span>

            <strong>
              {user.email || "—"}
            </strong>

          </div>


          <div className="account-detail">

            <span>
              Account Type
            </span>

            <strong>
              {user.role || "customer"}
            </strong>

          </div>

        </div>


        {/* =================================================
            ACCOUNT ACTIONS
        ================================================= */}

        <div className="account-actions">

          <button
            type="button"
            className="account-button"
            onClick={() =>
              navigate("/my-orders")
            }
          >
            My Orders
          </button>


          <button
            type="button"
            className="account-button logout-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>

        </div>

      </div>

    </section>
  );
}

export default Account;
