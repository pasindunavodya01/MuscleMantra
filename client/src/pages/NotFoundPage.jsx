import React from "react";
import { Link } from "react-router-dom";

const styles = `
  .not-found-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: calc(100vh - 70px);
    background: linear-gradient(135deg, #121212 0%, #1e1e1e 100%);
    padding: 20px;
    font-family: 'Roboto', sans-serif;
  }

  

  .not-found-content {
    text-align: center;
    max-width: 600px;
    animation: fadeInUp 0.8s ease-out;
  }

  .not-found-number {
    font-size: 8rem;
    font-weight: 700;
    font-family: 'Oswald', sans-serif;
    background: linear-gradient(135deg, #ff5722 0%, #e64a19 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0;
    letter-spacing: 2px;
    animation: bounce 1s ease-in-out infinite;
  }

  .not-found-title {
    font-size: 2.5rem;
    font-weight: 600;
    font-family: 'Oswald', sans-serif;
    color: #f5f5f5;
    margin: 20px 0;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .not-found-description {
    font-size: 1.1rem;
    color: #bdbdbd;
    margin: 30px 0;
    line-height: 1.6;
  }

  .not-found-icon {
    font-size: 4rem;
    color: #76ff03;
    margin: 20px 0;
  }

  .not-found-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    flex-wrap: wrap;
    margin-top: 40px;
  }

  .btn-primary {
    background: #ff5722;
    color: #fff;
    padding: 14px 32px;
    border: none;
    border-radius: 5px;
    font-weight: 700;
    font-size: 1rem;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 0.5px;
  }

  .btn-primary:hover {
    background: #e64a19;
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(255, 87, 34, 0.3);
  }

  .btn-secondary {
    background: transparent;
    color: #76ff03;
    padding: 14px 32px;
    border: 2px solid #76ff03;
    border-radius: 5px;
    font-weight: 700;
    font-size: 1rem;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.3s ease;
    text-decoration: none;
    display: inline-block;
    font-family: 'Roboto', sans-serif;
    letter-spacing: 0.5px;
  }

  .btn-secondary:hover {
    background: #76ff03;
    color: #121212;
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(118, 255, 3, 0.3);
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    .not-found-number {
      font-size: 5rem;
    }

    .not-found-title {
      font-size: 1.8rem;
    }

    .not-found-description {
      font-size: 1rem;
    }

    .not-found-buttons {
      flex-direction: column;
      align-items: center;
    }

    .btn-primary, .btn-secondary {
      width: 100%;
    }
  }
`;

export default function NotFoundPage() {
  return (
    <>
      <style>{styles}</style>
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="not-found-number">404</div>
          <div className="not-found-icon">⚠️</div>
          <h2 className="not-found-title">Page Not Found</h2>
          <p className="not-found-description">
            Sorry, the page you're looking for doesn't exist or has been moved. 
            Let's get you back on track!
          </p>
          <div className="not-found-buttons">
            <Link className="btn-primary" to="/">
              Go Home
            </Link>
            <Link className="btn-secondary" to="/login">
              Login
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

