const features = [
  {
    icon: "✓",
    title: "Trusted & Secure",
    text: "100% secure payments and customer privacy",
  },
  {
    icon: "◇",
    title: "Best Price",
    text: "Quality products at the best prices",
  },
  {
    icon: "▣",
    title: "Fast Delivery",
    text: "Quick delivery across Bangladesh",
  },
  {
    icon: "↻",
    title: "Easy Returns",
    text: "Hassle-free return within 7 days",
  },
  {
    icon: "◯",
    title: "Customer Support",
    text: "We are here to help you anytime",
  },
];

const values = [
  {
    icon: "♙",
    title: "Customer First",
    text: "We put our customers at the heart of everything we do.",
  },
  {
    icon: "◇",
    title: "Honesty & Transparency",
    text: "We believe in honest communication and fair practices.",
  },
  {
    icon: "♡",
    title: "Quality & Care",
    text: "We ensure quality in products and service.",
  },
  {
    icon: "♧",
    title: "Community First",
    text: "We grow together and support local communities.",
  },
];

export default function About() {
  return (
    <main className="about-page">

      {/* ================= HERO ================= */}
      <section className="about-hero">
        <div className="about-container about-hero-grid">

          <div className="about-hero-content">
            <div className="about-eyebrow">
              ABOUT PONNOMELA
            </div>

            <h1>
              Everyday essentials,
              <br />
              <span>thoughtfully chosen.</span>
            </h1>

            <p className="about-hero-text">
              Ponnomela is a Bangladeshi online marketplace built to make
              your daily life easier. We curate quality products, fair prices,
              and a smooth shopping experience you can trust.
            </p>

            <div className="hero-mini-features">
              <div>
                <span className="mini-icon">✓</span>
                <div>
                  <strong>Trusted</strong>
                  <small>Quality Products</small>
                </div>
              </div>

              <div>
                <span className="mini-icon">◇</span>
                <div>
                  <strong>Best Price</strong>
                  <small>Everyday</small>
                </div>
              </div>

              <div>
                <span className="mini-icon">▣</span>
                <div>
                  <strong>Fast Delivery</strong>
                  <small>Across Bangladesh</small>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ================= OUR STORY ================= */}
      <section className="about-story">
        <div className="about-container story-grid">

          <div className="story-image-wrap">
            <img
              src="/uploads/our_story_img.webp"
              alt="Ponnomela team and warehouse"
            />
          </div>

          <div className="story-content">
            <div className="about-eyebrow">
              OUR STORY
            </div>

            <h2>
              A simple idea to serve
              <br />
              better every day
            </h2>

            <p>
              Ponnomela began with a simple belief – shopping should be easy,
              affordable, and reliable for everyone.
            </p>

            <p>
              From everyday household items to trending products, we handpick
              each item with care and work with trusted suppliers to ensure the
              best quality.
            </p>

            <p>
              We are proudly Bangladesh-focused and committed to supporting
              local businesses and communities.
            </p>

            <div className="story-signature">
              <span>With care,</span>
              <strong>Ponnomela Team</strong>
              <small>Building trust. Delivering happiness.</small>
            </div>
          </div>

        </div>
      </section>

      {/* ================= WHY CHOOSE US ================= */}
      <section className="why-section">
        <div className="about-container">

          <div className="section-heading centered">
            <div className="about-eyebrow">
              WHY CHOOSE PONNOMELA
            </div>

            <h2>
              Shopping made easy, safe & reliable
            </h2>
          </div>

          <div className="feature-grid">
            {features.map((feature, index) => (
              <div className="feature-card" key={index}>
                <div className="feature-icon">
                  {feature.icon}
                </div>

                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="stats-section">
        <div className="about-container stats-grid">

          <div className="stat-item">
            <span className="stat-icon">♧</span>
            <div>
              <strong>50,000+</strong>
              <small>Happy Customers</small>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">▢</span>
            <div>
              <strong>10,000+</strong>
              <small>Products</small>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">◇</span>
            <div>
              <strong>500+</strong>
              <small>Trusted Partners</small>
            </div>
          </div>

          <div className="stat-item">
            <span className="stat-icon">☆</span>
            <div>
              <strong>4.8/5</strong>
              <small>Customer Rating</small>
            </div>
          </div>

        </div>
      </section>

      {/* ================= OUR VALUES ================= */}
      <section className="values-section">
        <div className="about-container values-grid">

          <div className="values-content">
            <div className="about-eyebrow">
              OUR VALUES
            </div>

            <h2>
              What drives us every day
            </h2>

            <div className="values-list">
              {values.map((value, index) => (
                <div className="value-item" key={index}>

                  <div className="value-icon">
                    {value.icon}
                  </div>

                  <div>
                    <h3>{value.title}</h3>
                    <p>{value.text}</p>
                  </div>

                </div>
              ))}
            </div>
          </div>

          <div className="values-image-wrap">
            <img
              src="/uploads/our_valuse_img.webp"
              alt="Ponnomela team"
            />
          </div>

        </div>
      </section>

    </main>
  );
}