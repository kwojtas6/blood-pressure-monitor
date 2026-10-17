import './App.css'

function App() {
  return (
    <main className="dashboard">
      <header className="header">
        <a className="brand" href="/" aria-label="Blood Pressure Monitor home">
          <span className="brand-mark" aria-hidden="true">
            +
          </span>
          <span>Pulse</span>
        </a>
        <span className="header-label">PERSONAL HEALTH</span>
      </header>

      <section className="welcome" aria-labelledby="welcome-heading">
        <p className="eyebrow">YOUR HEALTH, AT A GLANCE</p>
        <h1 id="welcome-heading">Blood pressure</h1>
        <p className="welcome-copy">
          Keep track of your readings and stay connected to your health.
        </p>
      </section>

      <section className="readings" aria-labelledby="readings-heading">
        <div className="section-heading">
          <h2 id="readings-heading">Recent readings</h2>
          <span className="reading-count">0 readings</span>
        </div>
        <div className="empty-state">
          <div className="empty-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <h3>No readings yet</h3>
          <p>Your blood pressure readings will appear here.</p>
        </div>
      </section>

      <footer className="footer">
        <span>Small steps make a difference.</span>
      </footer>
    </main>
  )
}

export default App
