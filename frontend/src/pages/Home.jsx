import { Link } from "react-router-dom";

function Home() {
  return (
    <main>

      {/* ================= HERO SECTION ================= */}

      <section className="hero">
        <div className="hero-container">

          <div className="hero-content">
            <p className="hero-small-title">
              WELCOME TO BARBERBOOK
            </p>

            <h1>
              Your Style.
              <br />
              Your Barber.
              <br />
              Your Time.
            </h1>

            <p className="hero-description">
              Find professional barbers, choose your favorite
              service and book your appointment in just a few clicks.
            </p>

            <div className="hero-buttons">
              <Link to="/booking" className="btn btn-primary">
                Book Appointment
              </Link>

              <Link to="/services" className="btn btn-outline">
                View Services
              </Link>
            </div>
          </div>

          <div className="hero-image">
            <div className="hero-image-box">
              <span>✂️</span>
              <h2>Professional</h2>
              <p>Barber Services</p>
            </div>
          </div>

        </div>
      </section>


      {/* ================= FEATURES ================= */}

      <section className="features">
        <div className="container">

          <div className="section-heading">
            <p>WHY CHOOSE US</p>
            <h2>Everything You Need</h2>
          </div>

          <div className="feature-grid">

            <div className="feature-card">
              <div className="feature-icon">✂️</div>
              <h3>Expert Barbers</h3>
              <p>
                Connect with experienced and professional
                barbers.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Easy Booking</h3>
              <p>
                Choose your preferred barber, service,
                date and time.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Quality Service</h3>
              <p>
                Enjoy a comfortable experience with
                high-quality services.
              </p>
            </div>

          </div>
        </div>
      </section>


      {/* ================= SERVICES PREVIEW ================= */}

      <section className="home-services">
        <div className="container">

          <div className="section-heading">
            <p>OUR SERVICES</p>
            <h2>Popular Services</h2>
          </div>

          <div className="service-preview-grid">

            <div className="home-service-card">
              <span>✂️</span>
              <h3>Hair Cut</h3>
              <p>Professional haircut</p>
              <strong>₹200</strong>
            </div>

            <div className="home-service-card">
              <span>🧔</span>
              <h3>Beard Trim</h3>
              <p>Perfect beard styling</p>
              <strong>₹100</strong>
            </div>

            <div className="home-service-card">
              <span>💇</span>
              <h3>Hair & Beard</h3>
              <p>Complete grooming</p>
              <strong>₹250</strong>
            </div>

            <div className="home-service-card">
              <span>✨</span>
              <h3>Facial</h3>
              <p>Relaxing facial treatment</p>
              <strong>₹500</strong>
            </div>

          </div>

          <div className="center-button">
            <Link to="/services" className="btn btn-primary">
              View All Services
            </Link>
          </div>

        </div>
      </section>


      {/* ================= CTA ================= */}

      <section className="home-cta">
        <div className="container">

          <h2>Ready for a Fresh Look?</h2>

          <p>
            Book your appointment with your favorite barber today.
          </p>

          <Link to="/booking" className="btn btn-gold">
            Book Now
          </Link>

        </div>
      </section>

    </main>
  );
}

export default Home;