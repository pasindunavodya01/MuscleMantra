import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&family=Roboto:wght@300;400;700&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --primary: #ff5722;
    --secondary: #212121;
    --dark-bg: #121212;
    --light-text: #f5f5f5;
    --gray-text: #bdbdbd;
  }

  body { background: var(--dark-bg); color: var(--light-text); font-family: 'Roboto', sans-serif; }

  h1, h2, h3 { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 1px; }

  /* Navbar */
  .navbar {
    background: var(--secondary); height: 70px; position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; box-shadow: 0 2px 5px rgba(0,0,0,.5);
  }
  .nav-container {
    max-width: 1100px; margin: 0 auto; padding: 0 20px;
    display: flex; justify-content: space-between; align-items: center; width: 100%;
  }
  .logo { font-size: 1.5rem; font-weight: bold; font-family: 'Oswald', sans-serif; cursor: pointer; text-decoration: none; color: #f5f5f5; }
  .highlight { color: var(--primary); }
  .nav-links { display: flex; gap: 24px; list-style: none; }
  .nav-links a {
    color: #f5f5f5; text-decoration: none; font-size: .9rem; text-transform: uppercase;
    position: relative; transition: color .3s; cursor: pointer;
  }
  .nav-links a::after { content: ''; display: block; width: 0; height: 2px; background: var(--primary); transition: width .3s; }
  .nav-links a:hover { color: var(--primary); }
  .nav-links a:hover::after { width: 100%; }

  /* Auth layout */
  .auth-page {
    min-height: 100vh;
    background:
      linear-gradient(rgba(0,0,0,.82), rgba(0,0,0,.82)),
      url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&q=80') center/cover no-repeat fixed;
    display: flex; flex-direction: column;
  }
  .auth-container {
    flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px;
  }
  .auth-card {
    background: rgba(30,30,30,.97);
    border: 1px solid #2a2a2a;
    border-radius: 14px;
    padding: 44px 40px;
    width: 100%; max-width: 440px;
    box-shadow: 0 20px 60px rgba(0,0,0,.6);
    animation: slideUp .5s ease-out;
  }
  .auth-card h1 {
    font-size: 2rem; margin-bottom: 8px;
    display: flex; align-items: center; gap: 12px;
  }
  .auth-card h1 i { color: var(--primary); font-size: 1.8rem; }
  .auth-sub { color: var(--gray-text); margin-bottom: 32px; font-size: .95rem; }

  /* Form */
  .auth-form { display: flex; flex-direction: column; gap: 20px; }
  .form-group { display: flex; flex-direction: column; gap: 7px; }
  .form-group label { font-size: .85rem; text-transform: uppercase; letter-spacing: .8px; color: #bbb; font-weight: 700; }
  .form-group input {
    background: #1a1a1a; border: 1.5px solid #333; border-radius: 8px;
    color: #f5f5f5; font-size: 1rem; padding: 12px 14px;
    font-family: 'Roboto', sans-serif; transition: border-color .3s, box-shadow .3s; outline: none;
  }
  .form-group input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(255,87,34,.15); }
  .form-group input::placeholder { color: #555; }

  .password-wrapper { position: relative; }
  .password-wrapper input { padding-right: 44px; width: 100%; }
  .toggle-pw {
    position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
    background: none; border: none; color: #888; cursor: pointer; font-size: 1rem;
    transition: color .2s; padding: 0;
  }
  .toggle-pw:hover { color: var(--primary); }

  .form-error {
    background: rgba(255,87,34,.12); border: 1px solid rgba(255,87,34,.4);
    color: #ff8a65; padding: 10px 14px; border-radius: 7px; font-size: .9rem;
  }

  .btn-main {
    background: var(--primary); color: #fff; border: none; border-radius: 8px;
    padding: 13px; font-size: 1rem; font-weight: bold; text-transform: uppercase;
    font-family: 'Oswald', sans-serif; letter-spacing: 1px; cursor: pointer;
    transition: background .3s, transform .2s, box-shadow .3s;
    box-shadow: 0 4px 14px rgba(255,87,34,.3); margin-top: 4px;
  }
  .btn-main:hover { background: #e64a19; transform: translateY(-2px); box-shadow: 0 6px 18px rgba(255,87,34,.45); }
  .btn-main:active { transform: translateY(0); }
  .btn-main:disabled { opacity: .6; cursor: not-allowed; transform: none; }

  .auth-footer { margin-top: 24px; text-align: center; color: var(--gray-text); font-size: .9rem; line-height: 1.8; }
  .auth-footer a { color: var(--primary); text-decoration: none; font-weight: bold; }
  .auth-footer a:hover { text-decoration: underline; }
  .auth-footer small { color: #666; font-size: .78rem; }

  .demo-hint {
    margin-top: 20px; background: rgba(118,255,3,.07); border: 1px solid rgba(118,255,3,.2);
    border-radius: 8px; padding: 12px 16px; font-size: .82rem; color: #9e9e9e; line-height: 1.7;
  }
  .demo-hint strong { color: #76ff03; }

  @keyframes slideUp {
    from { opacity: 0; transform: translateY(30px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  @media (max-width: 768px) {
    .navbar {
      height: 60px;
    }
    .nav-container {
      padding: 0 12px;
    }
    .logo {
      font-size: 1.2rem;
    }
    .nav-links {
      gap: 16px;
    }
    .nav-links a {
      font-size: 0.8rem;
    }
    .auth-container {
      padding: 30px 12px;
      min-height: calc(100vh - 60px);
    }
    .auth-card {
      padding: 36px 28px;
      border-radius: 12px;
    }
    .auth-card h1 {
      font-size: 1.6rem;
      margin-bottom: 6px;
    }
    .auth-sub {
      font-size: 0.9rem;
      margin-bottom: 24px;
    }
    .form-group {
      gap: 6px;
    }
    .form-group label {
      font-size: 0.8rem;
    }
    .form-group input {
      padding: 10px 12px;
      font-size: 0.95rem;
    }
    .btn-main {
      padding: 11px;
      font-size: 0.9rem;
    }
    .demo-hint {
      font-size: 0.8rem;
      padding: 10px 12px;
    }
  }

  @media (max-width: 480px) {
    .navbar {
      height: 56px;
    }
    .nav-container {
      padding: 0 8px;
    }
    .logo {
      font-size: 1rem;
    }
    .highlight {
      display: none;
    }
    .nav-links {
      gap: 12px;
      font-size: 0.7rem;
    }
    .nav-links a {
      font-size: 0.7rem;
    }
    .auth-container {
      padding: 20px 8px;
      min-height: calc(100vh - 56px);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .auth-card {
      padding: 24px 16px;
      border-radius: 10px;
      max-width: 100%;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }
    .auth-card h1 {
      font-size: 1.3rem;
      margin-bottom: 4px;
      gap: 8px;
    }
    .auth-card h1 i {
      font-size: 1.4rem;
    }
    .auth-sub {
      font-size: 0.8rem;
      margin-bottom: 16px;
    }
    .auth-form {
      gap: 16px;
    }
    .form-group {
      gap: 4px;
    }
    .form-group label {
      font-size: 0.75rem;
    }
    .form-group input {
      padding: 8px 10px;
      font-size: 14px;
      border-radius: 6px;
    }
    .password-wrapper input {
      padding-right: 40px;
    }
    .toggle-pw {
      right: 10px;
      font-size: 0.9rem;
    }
    .btn-main {
      padding: 10px;
      font-size: 0.85rem;
      min-height: 40px;
    }
    .auth-footer {
      margin-top: 16px;
      font-size: 0.8rem;
      line-height: 1.6;
    }
    .demo-hint {
      margin-top: 14px;
      font-size: 0.75rem;
      padding: 8px 10px;
    }
  }

  /* Footer */
  .login-footer {
    background: #212121;
    border-top: 1px solid #2a2a2a;
    padding: 24px 0;
    text-align: center;
    position: relative;
  }
  .login-footer-text {
    margin: 0;
    font-size: 0.9rem;
    color: #bdbdbd;
  }
  .login-footer-eco {
    color: #22c55e;
    font-weight: 600;
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if QR code was in query params
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      
      if (code) {
        navigate(`/${user.role === "admin" ? "admin" : "member"}?code=${code}`, { replace: true });
      } else {
        navigate(user.role === "admin" ? "/admin" : "/member", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    // Check if QR code was passed from external scanner
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setQrCode(code);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const loggedInUser = await authLogin(email.trim(), password);
      // Navigate based on role with QR code if available
      const target = loggedInUser.role === "admin" ? "/admin" : "/member";
      const url = qrCode ? `${target}?code=${qrCode}` : target;
      navigate(url, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      <div className="auth-page">
        {/* Navbar */}
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="logo">
              Muscle Mantra <span className="highlight">Gym</span>
            </Link>
            <ul className="nav-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </div>
        </nav>

        {/* Auth Card */}
        <main className="auth-container">
          <div className="auth-card">
            <h1><i className="fas fa-sign-in-alt" /> Member Login</h1>
            <p className="auth-sub">Sign in to your dashboard</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email" type="email" required
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="password-wrapper">
                  <input
                    id="password"
                    type={showPw ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="toggle-pw"
                    onClick={() => setShowPw(v => !v)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    <i className={`fas ${showPw ? "fa-eye-slash" : "fa-eye"}`} />
                  </button>
                </div>
              </div>

              {error && <div className="form-error"><i className="fas fa-exclamation-circle" /> {error}</div>}

              <button type="submit" className="btn-main" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin" /> Signing In…</> : "Sign In"}
              </button>
            </form>

            <p className="auth-footer">
              Don't have an account? <Link to="/register">Register as member</Link>
            </p>

            <div className="demo-hint">
              <strong>Demo credentials</strong><br />
              Admin — admin@musclemantra.com / admin123<br />
              Member — member@musclemantra.com / member123
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="login-footer">
          <p className="login-footer-text">
            Designed and developed By <span className="login-footer-eco">Eco</span>Mind Software Solutions
          </p>
        </footer>
      </div>
    </>
  );
}