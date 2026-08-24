function Signup() {
  return (
    <section className="form-page">

      <div className="form-container">

        <span className="eyebrow">
          BAKE DROP MEMBERS
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

        <form>

          <label>
            Full Name
            <input
              type="text"
              placeholder="Your full name"
            />
          </label>

          <label>
            Email Address
            <input
              type="email"
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              placeholder="Create a password"
            />
          </label>

          <button
            type="submit"
            className="btn btn-gold"
          >
            Create Account
          </button>

        </form>

      </div>

    </section>
  );
}

export default Signup;