import { useState } from "react";
import { Link } from "react-router-dom";

function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (event) => {
    event.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password
    ) {
      alert(
        "Please complete all required fields."
      );

      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/signup",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email,
            password,
            phone
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.message ||
          "Unable to create account."
        );

        return;
      }

      alert(
        "Account created successfully!"
      );

      window.location.href = "/login";

    } catch (error) {
      console.error(
        "Signup error:",
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
     GOOGLE SIGN UP
  ===================================================== */

  const handleGoogleSignup = () => {
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
          Create your
          <br />
          <em>account.</em>
        </h1>

        <p>
          Save your details and make your
          next order even easier.
        </p>


        <form onSubmit={handleSignup}>

          <div className="form-row">

            <div className="form-group">
              <label>
                First Name
              </label>

              <input
                type="text"
                value={firstName}
                onChange={(event) =>
                  setFirstName(
                    event.target.value
                  )
                }
                placeholder="First name"
              />
            </div>


            <div className="form-group">
              <label>
                Last Name
              </label>

              <input
                type="text"
                value={lastName}
                onChange={(event) =>
                  setLastName(
                    event.target.value
                  )
                }
                placeholder="Last name"
              />
            </div>

          </div>


          <div className="form-group">
            <label>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@gmail.com"
            />
          </div>


          <div className="form-group">
            <label>
              Phone
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(event) =>
                setPhone(
                  event.target.value
                )
              }
              placeholder="09XXXXXXXXX"
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
                setPassword(
                  event.target.value
                )
              }
              placeholder="Create a password"
            />
          </div>


          <button
            type="submit"
            className="form-submit"
            disabled={loading}
          >
            {loading
              ? "CREATING ACCOUNT..."
              : "CREATE ACCOUNT"}
          </button>

        </form>


        <div className="form-divider">
          <span>OR</span>
        </div>


        <button
          type="button"
          className="google-button"
          onClick={handleGoogleSignup}
        >
          <span className="google-icon">
            G
          </span>

          <span>
            Continue with Google
          </span>
        </button>


        <p className="form-footer">
          Already have an account?{" "}
          <Link to="/login">
            Log in
          </Link>
        </p>

      </div>

    </section>
  );
}

export default Signup;