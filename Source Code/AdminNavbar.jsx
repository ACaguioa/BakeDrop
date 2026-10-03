import { useNavigate } from "react-router-dom";

function AdminNavbar() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("bakedrop-user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("bakedrop-token");
    localStorage.removeItem("bakedrop-user");

    navigate("/login", {
      replace: true
    });
  };

  return (
    <header className="admin-navbar">

      <div
        className="admin-navbar-logo"
        onClick={() => navigate("/admin")}
      >
        <span className="admin-logo-mark">
          B
        </span>

        <div>
          <h1>
            BAKE<span>DROP</span>
          </h1>

          <small>
            ADMIN PANEL
          </small>
        </div>
      </div>


      <nav className="admin-navbar-links">

        <button
          onClick={() => navigate("/admin")}
          className="admin-nav-link"
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate("/admin/orders")}
          className="admin-nav-link"
        >
          Orders
        </button>

        <button 
          onClick={() => navigate("/admin/rider-assignment")} 
          className="admin-nav-link" 
        > 
          Rider Assignment 
        </button>

        <button
          onClick={() => navigate("/admin/schedule")}
          className="admin-nav-link"
        >
          Schedule
        </button>

        <button
          onClick={() => navigate("/admin/products")}
          className="admin-nav-link"
        >
          Products
        </button>

      </nav>


      <div className="admin-navbar-right">

        <div className="admin-user">

          <div className="admin-user-avatar">
            {user.first_name
              ? user.first_name
                  .charAt(0)
                  .toUpperCase()
              : "A"}
          </div>

          <div className="admin-user-info">

            <strong>
              {user.first_name || "Admin"}
            </strong>

            <span>
              Administrator
            </span>

          </div>

        </div>


        <button
          className="admin-logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default AdminNavbar;