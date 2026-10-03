
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  /* =====================================================
     REDIRECT USER BASED ON ROLE
  ===================================================== */

  const redirectByRole = (user) => {
    if (user?.role === "admin") {
      navigate("/admin", {
        replace: true
      });
    } else {
      navigate("/", {
        replace: true
      });
    }
  };


  /* =====================================================
     HANDLE GOOGLE LOGIN REDIRECT
  ===================================================== */

  useEffect(() => {
    const token = searchParams.get("token");
    const userParam = searchParams.get("user");
    const googleError = searchParams.get("google");

    if (googleError === "failed") {
      alert("Google login failed. Please try again.");
      return;
    }

    if (token && userParam) {
      try {
        const user = JSON.parse(
          decodeURIComponent(userParam)
        );

        localStorage.setItem(
          "bakedrop-token",
          token
        );

        localStorage.setItem(
          "bakedrop-user",
          JSON.stringify(user)
        );

        alert("Google login successful!");

        redirectByRole(user);

      } catch (error) {
        console.error(
          "Google login data error:",
          error
        );

        alert(
          "Something went wrong while completing Google login."
        );
      }
    }
  }, [searchParams, navigate]);


  /* =====================================================
     NORMAL LOGIN
  ===================================================== */

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      alert(
        "Please enter your email and password."
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Login failed."
        );

        return;
      }

      localStorage.setItem(
        "bakedrop-token",
        data.token
      );

      localStorage.setItem(
        "bakedrop-user",
        JSON.stringify(data.user)
      );

      alert("Login successful!");

      // ADMIN → ADMIN DASHBOARD
      // CUSTOMER → HOME
      redirectByRole(data.user);

    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      alert(
        "Unable to connect to the server."
      );

    } finally {
      setLoading(false);
    }
  };


  /* =====================================================
     GOOGLE LOGIN
  ===================================================== */

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:5000/api/auth/google";
  };


  return (
    <section className="form-page">

      <div className="form-container">

        <span className="eyebrow">
          BAKEDROP MEMBERS
        </span>

        <h1>
          Welcome
          <br />
          <em>back.</em>
        </h1>

        <p>
          Log in to continue your
          BakeDrop experience.
        </p>


        <form onSubmit={handleLogin}>

          <div className="form-group">
            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="you@gmail.com"
            />
          </div>


          <div className="form-group">
            <label>
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
            />
          </div>


          <button
            type="submit"
            className="form-submit"
            disabled={loading}
          >
            {loading
              ? "LOGGING IN..."
              : "LOG IN"}
          </button>

        </form>


        <div className="form-divider">
          <span>OR</span>
        </div>


        <button
          type="button"
          className="google-button"
          onClick={handleGoogleLogin}
        >
          <span className="google-icon">
            G
          </span>

          <span>
            Continue with Google
          </span>
        </button>


        <p className="form-footer">
          Don't have an account?{" "}
          <Link to="/signup">
            Sign up
          </Link>
        </p>

      </div>

    </section>
  );
}

export default Login;