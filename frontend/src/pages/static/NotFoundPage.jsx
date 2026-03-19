import { Link, useNavigate } from "react-router-dom";
import { TriangleAlert, ArrowLeft, Home } from "lucide-react";
import { useEffect, useState } from "react";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Create floating particles
    const newParticles = [];
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5,
      });
    }
    setParticles(newParticles);

    // Add keyboard event listener
    const handleKeyPress = (e) => {
      if (e.key === "Escape") {
        navigate(-1);
      }
      if (e.key === "h" || e.key === "H") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [navigate]);

  return (
    <div className="notfound-container">
      {/* Animated particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animation: `float ${particle.duration}s linear ${particle.delay}s infinite`,
          }}
        />
      ))}

      <div className="notfound-card">
        <div className="notfound-icon">
          <TriangleAlert size={56} strokeWidth={1.5} />
        </div>
        <p className="notfound-code">404</p>
        <h1>Page Not Found</h1>
        <p className="notfound-subtitle">
          The page you're looking for doesn't exist or has been moved to another location.
        </p>
        <div className="notfound-actions">
          <Link to="/" className="notfound-btn primary">
            <Home size={20} />
            Go to Homepage
          </Link>
          <button
            type="button"
            className="notfound-btn ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
        <p style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#999',
          opacity: 0.7
        }}>
          Press <kbd>Esc</kbd> to go back • Press <kbd>H</kbd> for homepage
        </p>
      </div>
    </div>
  );
}