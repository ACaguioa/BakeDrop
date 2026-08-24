import SectionTitle from "../components/SectionTitle";
import hero from "../assets/hero.jpg";

function About() {
  return (
    <div className="page">

      <section className="page-header">
        <SectionTitle
          eyebrow="OUR STORY"
          title="Made with intention."
          description="BakeDrop was created around one simple idea: beautiful food should still feel personal."
          center
        />
      </section>

      <section className="about-story section">

        <div className="about-image">
          <img src={hero} alt="Freshly baked bread" />
        </div>

        <div className="about-content">

          <span className="eyebrow">
            THE BAKE DROP PHILOSOPHY
          </span>

          <h2>
            A bakery built
            <br />
            <em>around people.</em>
          </h2>

          <p>
            BakeDrop brings together familiar Filipino
            favorites and modern artisan baking.
          </p>

          <p>
            Every product is prepared with attention to
            texture, flavor, presentation, and freshness.
            Whether you're ordering a simple box of
            pandesal or a cake for a special celebration,
            we want every order to feel thoughtfully made.
          </p>

        </div>

      </section>

      <section className="values-section section">

        <div>
          <span>01</span>
          <h3>Freshness</h3>
          <p>
            Baked fresh and prepared with care.
          </p>
        </div>

        <div>
          <span>02</span>
          <h3>Craft</h3>
          <p>
            Thoughtful baking from preparation to presentation.
          </p>
        </div>

        <div>
          <span>03</span>
          <h3>Heart</h3>
          <p>
            Made to become part of your special moments.
          </p>
        </div>

      </section>

    </div>
  );
}

export default About;