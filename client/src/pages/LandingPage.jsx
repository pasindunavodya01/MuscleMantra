


import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { WhatsAppContactCard } from "../components/WhatsAppButton";
import { getGymWhatsAppLink } from "../utils/whatsapp";

const PRIMARY = "#ff5722";
const SECONDARY = "#212121";
const DARK_BG = "#121212";
const ACCENT_GREEN = "#76ff03";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&family=Roboto:wght@300;400;700&display=swap');
  @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --primary: #ff5722;
    --secondary: #212121;
    --dark-bg: #121212;
    --light-text: #f5f5f5;
    --gray-text: #bdbdbd;
    --accent-green: #76ff03;
  }

  body { background: var(--dark-bg); color: var(--light-text); overflow-x: hidden; }

  h1,h2,h3 { font-family: 'Oswald', sans-serif; text-transform: uppercase; letter-spacing: 1px; }
  body, p, span, a, li { font-family: 'Roboto', sans-serif; }

  /* Navbar */
  .navbar {
    background: var(--secondary);
    height: 70px;
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 5px rgba(0,0,0,.5);
  }
  .nav-container {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  .logo { font-size: 1.5rem; font-weight: bold; font-family: 'Oswald', sans-serif; cursor: pointer; }
  .highlight { color: var(--primary); }
  .nav-menu { display: flex; align-items: center; list-style: none; gap: 20px; }
  .nav-menu a {
    text-decoration: none; color: #f5f5f5; font-size: .9rem; text-transform: uppercase;
    position: relative; transition: color .3s; cursor: pointer;
  }
  .nav-menu a::after {
    content: ''; display: block; width: 0; height: 2px;
    background: var(--primary); transition: width .3s;
  }
  .nav-menu a:hover { color: var(--primary); }
  .nav-menu a:hover::after { width: 100%; }
 .btn-nav {
  background: var(--primary);
  color: #fff !important;
  padding: 8px 16px;
  border-radius: 5px;
  font-weight: bold;
  transition: all .3s;
  white-space: nowrap;
  display: inline-block;
}
  .ticker-wrap { overflow: hidden; background: #f5a623; padding: 10px 0; }
  .ticker-inner { display: flex; width: max-content; animation: ticker 28s linear infinite; }
  .ticker-item { color: #0a0a0a; font-family: 'Barlow Condensed', sans-serif; font-weight: 900; font-size: 13px; letter-spacing: 3px; text-transform: uppercase; padding: 0 40px; white-space: nowrap; }
  @keyframes ticker { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
          
  }
  .btn-nav:hover { background: #e64a19 !important; transform: translateY(-2px); }
  .menu-toggle { display: none; cursor: pointer; background: none; border: none; }
  .bar { display: block; width: 25px; height: 3px; background: white; margin: 5px 0; transition: all .3s; }

  /* Hero */
  .hero {
      height: calc(100vh - 70px - 37px);
    background: linear-gradient(rgba(0,0,0,.72),rgba(0,0,0,.72)),
      url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80') center/cover no-repeat;
    display: flex; flex-direction: column; justify-content: center;
    align-items: center; text-align: center; padding: 0 20px;
  }
  .hero h1 { font-size: 3.5rem; margin-bottom: 20px; animation: fadeInUp 1s ease-out; }
  .hero p { font-size: 1.2rem; margin-bottom: 30px; color: #ddd; animation: fadeInUp 1s ease-out .5s backwards; }
  .rating-badge { margin-bottom: 30px; font-size: 1.1rem; color: var(--accent-green); animation: fadeInUp 1s ease-out .7s backwards; }
  .btn-main {
    display: inline-block; background: var(--primary); color: #fff;
    padding: 12px 28px; border-radius: 5px; font-weight: bold;
    text-transform: uppercase; cursor: pointer; border: none;
    box-shadow: 0 4px 6px rgba(0,0,0,.2); transition: all .3s;
    animation: fadeInUp 1s ease-out .9s backwards; font-family: 'Roboto', sans-serif;
    font-size: 1rem; text-decoration: none;
  }
  .btn-main:hover { background: #e64a19; transform: translateY(-3px); box-shadow: 0 6px 8px rgba(0,0,0,.4); }

  /* Sections */
  .section-padding { padding: 60px 0; }
  .section-dark { background: var(--secondary); }
  .container { max-width: 1100px; margin: 0 auto; padding: 0 20px; }
  .section-title {
    font-size: 2.5rem; text-align: center; margin-bottom: 40px;
    position: relative; padding-bottom: 15px;
  }
  .section-title::after {
    content: ''; position: absolute; bottom: 0; left: 50%;
    transform: translateX(-50%); width: 80px; height: 4px; background: var(--primary);
  }

  /* About */
  .about-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(250px,1fr)); gap: 30px; text-align: center; }
  .about-card {
    background: #1e1e1e; padding: 30px; border-radius: 10px;
    box-shadow: 0 4px 6px rgba(0,0,0,.3); transition: transform .3s, box-shadow .3s;
  }
  .about-card:hover { transform: translateY(-10px); box-shadow: 0 10px 20px rgba(0,0,0,.5); }
  .about-card i { font-size: 3rem; color: var(--primary); margin-bottom: 20px; display: block; transition: transform .3s; }
  .about-card:hover i { transform: scale(1.2); }
  .about-card h3 { margin-bottom: 15px; font-size: 1.5rem; }
  .about-card p { color: var(--gray-text, #bdbdbd); line-height: 1.7; }

  /* Facilities */
  .facilities-list { display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; }
  .facility-item {
    background: #333; padding: 15px 25px; border-radius: 50px;
    display: flex; align-items: center; gap: 10px; font-size: 1.1rem;
    transition: transform .3s, background .3s;
  }
  .facility-item:hover { transform: scale(1.05); background: #444; }
  .facility-item i { color: var(--accent-green); }

  /* Gallery */
  .gallery-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(300px,1fr)); gap: 20px; }
  .gallery-item {
    position: relative; overflow: hidden; border-radius: 10px;
    height: 250px; cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,.3);
  }
  .gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform .5s; }
  .gallery-item:hover img { transform: scale(1.1); }

  /* Modal */
  .image-modal {
    display: none; position: fixed; z-index: 1000; top: 0; left: 0;
    width: 100%; height: 100%; background: rgba(0,0,0,.95);
    align-items: center; justify-content: center;
  }
  .image-modal.active { display: flex; }
  .image-modal img { max-width: 90%; max-height: 90%; object-fit: contain; border-radius: 8px; box-shadow: 0 0 30px rgba(255,87,34,.3); }
  .modal-close {
    position: absolute; top: 20px; right: 40px; font-size: 50px;
    color: white; cursor: pointer; transition: color .3s, transform .3s;
    background: none; border: none; line-height: 1; font-weight: 300;
  }
  .modal-close:hover { color: var(--primary); transform: rotate(90deg); }

  /* Reviews */
  .reviews-grid {
    display: flex; gap: 24px; overflow-x: auto; padding: 12px 6px;
    -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory;
    scroll-behavior: smooth; align-items: flex-start;
  }
  .reviews-grid::-webkit-scrollbar { height: 4px; }
  .reviews-grid::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 2px; }
  .review-card {
    background: var(--secondary); padding: 30px; border-radius: 10px;
    flex: 0 0 33.333%; max-width: 33.333%;
    box-shadow: 0 4px 6px rgba(0,0,0,.3); scroll-snap-align: start;
    transition: transform .3s, box-shadow .3s;
  }
  .review-card:hover { transform: translateY(-8px) scale(1.03); box-shadow: 0 12px 30px rgba(0,0,0,.6); }
  .stars { color: #ffc107; margin-bottom: 15px; font-size: 1.1rem; }
  .review-text { font-style: italic; margin-bottom: 20px; color: #ddd; line-height: 1.7; }
  .review-author { font-weight: bold; text-align: right; color: var(--primary); }

  /* Contact */
  .contact-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
  .contact-info p { margin-bottom: 20px; font-size: 1.1rem; line-height: 1.7; }
  .contact-info i { color: var(--primary); width: 25px; }
  .hours { margin-top: 30px; background: #333; padding: 20px; border-radius: 10px; transition: transform .3s; }
  .hours:hover { transform: scale(1.02); }
  .hours h3 { margin-bottom: 15px; }
  .hours ul { list-style: none; }
  .hours ul li {
    display: flex; justify-content: space-between;
    padding: 8px 0; border-bottom: 1px solid #444;
  }
  .hours ul li:last-child { border-bottom: none; }
  .hours ul li span { color: var(--primary); font-weight: bold; }
  .map-container iframe { width: 100%; height: 450px; border-radius: 10px; border: 0; }
  .contact-info a { color: white; }

  /* Footer */
  footer { background: #000; padding: 20px 0; text-align: center; border-top: 1px solid #333; }
  .social-links { margin-top: 10px; }
  .social-links a {
    color: white; margin: 0 10px; font-size: 1.3rem;
    transition: color .3s, transform .3s; display: inline-block;
  }
  .social-links a:hover { color: var(--primary); transform: translateY(-3px); }

  /* Animations */
  @keyframes fadeInUp {
    from { opacity: 0; transform: translate3d(0,40px,0); }
    to   { opacity: 1; transform: translate3d(0,0,0); }
  }
  .fade-in { opacity: 0; transform: translateY(30px); transition: all .8s ease-out; }
  .fade-in.visible { opacity: 1; transform: translateY(0); }

  /* Responsive */
  @media (max-width: 768px) {
    .menu-toggle { display: block; }
    .nav-menu {
      position: fixed; left: -100%; top: 70px; flex-direction: column;
      background: var(--secondary); width: 100%; text-align: center;
      transition: .3s; box-shadow: 0 10px 10px rgba(0,0,0,.5);
      padding: 20px 0 40px;
    }
    .nav-menu.open { left: 0; }
    .hero h1 { font-size: 2rem; }
    .gallery-grid { grid-template-columns: repeat(auto-fit,minmax(160px,1fr)); gap: 12px; }
    .gallery-item { height: 180px; }
    .contact-wrapper { grid-template-columns: 1fr; gap: 20px; }
    .review-card { flex: 0 0 50%; max-width: 50%; }
    .map-container iframe { height: 300px; }
  }
  @media (max-width: 480px) {
    .hero h1 { font-size: 1.6rem; line-height: 1.1; }
    .gallery-item { height: 140px; }
    .review-card { flex: 0 0 100%; max-width: 100%; }
  }
`;

const reviews = [
  { text: "This gym is perfect for a good workout. Great community feeling, amazing trainers who will help you. Cheap entry only 1000. Good music. Open air.", author: "Jeffery Wise" },
  { text: "Hands down one of the best gyms I've come across. The space is very spacious, allowing you to work out comfortably. They have all-new, top-quality equipment.", author: "Chaami de Silva" },
  { text: "I purchased a very affordable day pass for a week and was blown away by how amazing this gym is.", author: "Jill Wheeler" },
  { text: "I've been going to Muscle Mantra for the past two months, and I genuinely love the experience! The gym has high-quality equipment, a clean and motivating environment, and everything is well maintained.", author: "Nadiya H" },
  { text: "It was the best gym that I came across in my month of being in Sri Lanka. The equipment seemed pretty new and there was a good variety. Highly recommend this place if you want to get a solid workout in while in Negombo.", author: "Cameron Keyser" },
  { text: "The gym offers a clean and well-maintained environment, with brand new and top-notch machines. The supportive and knowledgeable trainers genuinely care about your progress.", author: "Rusara Kithsahan" },
  { text: "Great gym with a fab variety of equipment! All clean, fairly new and everything you need for a good leg day. Day pass is great value too — would definitely recommend!", author: "Ellie C" },
  { text: "Muscle Mantra sets the bar high for hygiene and maintenance. The gym is always spotless, and the staff is incredibly friendly and welcoming. A great place to work out!", author: "BlueSwirl Corporation" },
];

const galleryImages = [
  // "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
  // "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
  // "https://images.unsplash.com/photo-1580261450046-d0a30080dc9b?w=600&q=80",
  // "https://images.unsplash.com/photo-1581009137042-c552e485697a?w=600&q=80",
  // "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80",
  // "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&q=80",
  // "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=600&q=80",
  // "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600&q=80",
  // "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=600&q=80",
  // "https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?w=600&q=80",
  // "https://images.unsplash.com/photo-1599058945522-28d584b6f0ff?w=600&q=80",
  // "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=600&q=80",

  "/images/gym-1.jpeg",
  "/images/gym-2.jpeg",
  "/images/gym-3.jpeg",
  "/images/gym-4.jpeg",
  "/images/gym-5.jpeg",
  "/images/gym-6.jpeg",
  "/images/gym-7.jpeg",
  "/images/gym-8.jpeg",
  "/images/gym-9.jpeg",
  "/images/gym-10.jpeg",
  "/images/gym-11.jpeg",
  "/images/gym-12.jpeg",
  
];

function useFadeIn() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function FadeIn({ children, style }) {
  const ref = useFadeIn();
  return <div ref={ref} className="fade-in" style={style}>{children}</div>;
}

function Stars() {
  return (
    <div className="stars">
      {[...Array(5)].map((_, i) => <i key={i} className="fas fa-star" />)}
    </div>
  );
}

// Contact Section Component
function useFadeInContact() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { el.classList.add("cs-visible"); obs.disconnect(); }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

const contactStyles = `
.cs-section {
  background: #0e0e0e;
  padding: 100px 0 80px;
  position: relative;
  overflow: hidden;
}
/* subtle diagonal stripe texture */
.cs-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(-55deg,transparent,transparent 40px,rgba(255,87,34,0.03) 40px,rgba(255,87,34,0.03) 41px);
  pointer-events: none;
}
.cs-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
}
/* Section header */
.cs-header {
  text-align: center;
  margin-bottom: 64px;
}
.cs-eyebrow {
  font-family: 'Oswald', sans-serif;
  font-size: .75rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #ff5722;
  margin-bottom: 14px;
}
.cs-title {
  font-family: 'Oswald', sans-serif;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  text-transform: uppercase;
  letter-spacing: 2px;
  color: #f5f5f5;
  line-height: 1;
}
.cs-title span { color: #ff5722; }
.cs-divider {
  width: 60px; height: 3px;
  background: linear-gradient(90deg, #ff5722, transparent);
  margin: 20px auto 0;
  border-radius: 2px;
}
/* Two-column layout */
.cs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: stretch;
}
/* ── Left column: info cards ── */
.cs-info-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cs-info-card {
  background: #181818;
  border: 1px solid #252525;
  border-radius: 12px;
  padding: 22px 24px;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  transition: border-color .3s, transform .3s, box-shadow .3s;
  text-decoration: none;
  color: inherit;
}
.cs-info-card:hover {
  border-color: #ff5722;
  transform: translateX(6px);
  box-shadow: -4px 0 0 #ff5722, 0 8px 24px rgba(0,0,0,.4);
}
.cs-icon-wrap {
  width: 46px; height: 46px; flex-shrink: 0;
  background: rgba(255,87,34,.12);
  border: 1px solid rgba(255,87,34,.25);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem; color: #ff5722;
  transition: background .3s;
}
.cs-info-card:hover .cs-icon-wrap { background: rgba(255,87,34,.22); }
.cs-info-label {
  font-family: 'Oswald', sans-serif;
  font-size: .7rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #666;
  margin-bottom: 4px;
}
.cs-info-value {
  font-size: .97rem;
  color: #e0e0e0;
  line-height: 1.5;
}
.cs-info-value a { color: #e0e0e0; text-decoration: none; }
.cs-info-value a:hover { color: #ff5722; }
/* Hours card */
.cs-hours-card {
  background: #181818;
  border: 1px solid #252525;
  border-radius: 12px;
  padding: 24px;
  flex: 1;
}
.cs-hours-title {
  font-family: 'Oswald', sans-serif;
  font-size: 1rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #ff5722;
  margin-bottom: 18px;
  display: flex; align-items: center; gap: 10px;
}
.cs-hours-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #222;
  font-size: .9rem;
}
.cs-hours-row:last-child { border-bottom: none; }
.cs-day { color: #888; }
.cs-time {
  color: #f5f5f5;
  font-weight: 600;
  font-family: 'Oswald', sans-serif;
  letter-spacing: .5px;
}
.cs-open-badge {
  font-size: .65rem;
  background: rgba(118,255,3,.15);
  color: #76ff03;
  border: 1px solid rgba(118,255,3,.3);
  border-radius: 20px;
  padding: 2px 8px;
  font-family: 'Oswald', sans-serif;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-left: 8px;
}
/* ── Right column: map ── */
.cs-map-col {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #252525;
  box-shadow: 0 20px 60px rgba(0,0,0,.5);
  min-height: 480px;
}
.cs-map-col::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 16px;
  box-shadow: inset 0 0 0 1px rgba(255,87,34,.15);
  z-index: 2;
  pointer-events: none;
}
.cs-map-col iframe {
  width: 100%; height: 100%;
  min-height: 480px;
  border: 0; display: block;
  filter: invert(90%) hue-rotate(180deg) saturate(0.6) brightness(0.9);
}
.cs-map-overlay {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,.7));
  padding: 20px 24px;
  z-index: 3;
}
.cs-map-label {
  font-family: 'Oswald', sans-serif;
  font-size: .75rem;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #ff5722;
  margin-bottom: 4px;
}
.cs-map-addr {
  color: #ddd;
  font-size: .9rem;
}
/* Fade-in animation */
.cs-fadein { opacity: 0; transform: translateY(28px); transition: opacity .7s ease, transform .7s ease; }
.cs-fadein.cs-visible { opacity: 1; transform: translateY(0); }
.cs-fadein.cs-delay-1 { transition-delay: .15s; }
.cs-fadein.cs-delay-2 { transition-delay: .3s; }
/* Responsive */
@media (max-width: 768px) {
  .cs-section { padding: 70px 0 60px; }
  .cs-grid { grid-template-columns: 1fr; }
  .cs-map-col { min-height: 320px; }
  .cs-map-col iframe { min-height: 320px; }
}
`;

// Helper to check if gym is currently open
function getOpenStatus() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun,6=Sat
  const hour = now.getHours() + now.getMinutes() / 60;
  if (day === 0) return hour >= 8.5 && hour < 13;      // Sunday
  return hour >= 6 && hour < 22;                        // Mon–Sat
}

function ContactSection() {
  const col1 = useFadeInContact();
  const col2 = useFadeInContact();
  const isOpen = getOpenStatus();

  return (
    <>
      <style>{contactStyles}</style>
      <section id="contact" className="cs-section">
        <div className="cs-container">
          {/* Header */}
          <div className="cs-header">
            <p className="cs-eyebrow">Find Us</p>
            <h2 className="cs-title">Come <span>Train</span> With Us</h2>
            <div className="cs-divider" />
          </div>

          <div className="cs-grid">
            {/* ── Left: Info + Hours ── */}
            <div ref={col1} className="cs-fadein cs-info-col">
              {/* Address */}
              <a
                className="cs-info-card"
                href="https://maps.google.com/?q=Muscle+Mantra+Gym+Negombo"
                target="_blank" rel="noopener noreferrer"
              >
                <div className="cs-icon-wrap">
                  <i className="fas fa-map-marker-alt" />
                </div>
                <div>
                  <div className="cs-info-label">Address</div>
                  <div className="cs-info-value">163-1, Chilaw Rd<br />Negombo, Sri Lanka</div>
                </div>
              </a>

              {/* Phone */}
              <a className="cs-info-card" href="tel:+94767933556">
                <div className="cs-icon-wrap">
                  <i className="fas fa-phone-alt" />
                </div>
                <div>
                  <div className="cs-info-label">Phone</div>
                  <div className="cs-info-value">+94 76 793 3556</div>
                </div>
              </a>

              {/* Email */}
              <a className="cs-info-card" href="mailto:musclemantragym@gmail.com">
                <div className="cs-icon-wrap">
                  <i className="fas fa-envelope" />
                </div>
                <div>
                  <div className="cs-info-label">Email</div>
                  <div className="cs-info-value">musclemantragym@gmail.com</div>
                </div>
              </a>

              {/* WhatsApp */}
              <WhatsAppContactCard
                link={getGymWhatsAppLink("Hi! I'd like to know more about Muscle Mantra Gym.")}
                phone="+94 76 793 3556"
                label="WhatsApp"
              />

              {/* Hours */}
              <div className="cs-hours-card">
                <div className="cs-hours-title">
                  <i className="far fa-clock" /> Opening Hours
                  {isOpen
                    ? <span className="cs-open-badge">Open Now</span>
                    : <span className="cs-open-badge" style={{ color: "#ff5722", borderColor: "rgba(255,87,34,.3)", background: "rgba(255,87,34,.1)" }}>Closed</span>
                  }
                </div>
                {[
                  { day: "Monday – Friday", time: "06:00 AM – 10:00 PM" },
                  { day: "Saturday",        time: "06:00 AM – 10:00 PM" },
                  { day: "Sunday",          time: "08:30 AM – 01:00 PM" },
                ].map(({ day, time }) => (
                  <div className="cs-hours-row" key={day}>
                    <span className="cs-day">{day}</span>
                    <span className="cs-time">{time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Map ── */}
            <div ref={col2} className="cs-fadein cs-delay-2 cs-map-col">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3958.175962306734!2d79.84592337272787!3d7.220760375007893!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2ef001e947321%3A0x5d3d5dd8278070b1!2sMuscle%20Mantra%20Gym!5e0!3m2!1sen!2slk!4v1769088231634!5m2!1sen!2slk"
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Muscle Mantra Gym Location"
              />
              <div className="cs-map-overlay">
                <div className="cs-map-label">Our Location</div>
                <div className="cs-map-addr">163-1, Chilaw Rd, Negombo, Sri Lanka</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function MuscleMantreGym() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalSrc, setModalSrc] = useState(null);
  const reviewsRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // Auto-scroll reviews
  useEffect(() => {
    const el = reviewsRef.current;
    if (!el) return;
    let interval;
    const cardWidth = () => {
      const c = el.querySelector(".review-card");
      return c ? c.offsetWidth + 24 : 360;
    };
    const advance = () => {
      const half = el.scrollWidth / 2;
      el.scrollBy({ left: cardWidth(), behavior: "smooth" });
      setTimeout(() => { if (el.scrollLeft >= half) el.scrollLeft -= half; }, 600);
    };
    interval = setInterval(advance, 3200);
    el.addEventListener("mouseenter", () => clearInterval(interval));
    el.addEventListener("mouseleave", () => { clearInterval(interval); interval = setInterval(advance, 3200); });
    return () => clearInterval(interval);
  }, []);

  const handleReviewPointerDown = (e) => {
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = reviewsRef.current.scrollLeft;
    reviewsRef.current.setPointerCapture?.(e.pointerId);
  };
  const handleReviewPointerMove = (e) => {
    if (!isDragging.current) return;
    reviewsRef.current.scrollLeft = scrollLeft.current + (startX.current - e.clientX);
  };
  const handleReviewPointerUp = () => { isDragging.current = false; };

  const scrollTo = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <style>{styles}</style>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo" onClick={() => scrollTo("home")}>
            Muscle Mantra <span className="highlight">Gym</span>
          </div>
          <button className="menu-toggle" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
            <span className="bar" /><span className="bar" /><span className="bar" />
          </button>
          <ul className={`nav-menu${menuOpen ? " open" : ""}`}>
            {["home","about","facilities","gallery","reviews","contact"].map(s => (
              <li key={s}><a onClick={() => scrollTo(s)}>{s}</a></li>
            ))}
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/login" className="btn-nav">Join as Member</Link></li>
          </ul>
        </div>
      </nav>

      {/* Hero */}
      <section id="home" className="hero">
        <h1>Unleash Your Potential at <span className="highlight">Muscle Mantra</span></h1>
        <p>Negombo's Premier Fitness Destination. Spacious. Professional. Affordable.</p>
        <div className="rating-badge">
          <i className="fas fa-star" /> 4.8 Rating from 500+ Reviews
        </div>
        <a className="btn-main" onClick={() => scrollTo("contact")}>Get Started Today</a>
      </section>

        {/* Ticker */}
       <div className="ticker-wrap">
         <div className="ticker-inner">
           {["Top Equipment","Community Vibe","Open Air Workout","Professional Trainers","Affordable Rates","Free Filtered Water","Clean & Hygienic","Good Music"].concat(
             ["Top Equipment","Community Vibe","Open Air Workout","Professional Trainers","Affordable Rates","Free Filtered Water","Clean & Hygienic","Good Music"]
           ).map((t, i) => <span key={i} className="ticker-item">◆ {t}</span>)}
         </div>
       </div>

      {/* About */}
      <section id="about" className="section-padding">
        <div className="container">
          <FadeIn><h2 className="section-title">Why Choose Us?</h2></FadeIn>
          <div className="about-grid">
            {[
              { icon: "fa-dumbbell", title: "Top Equipment", text: "All-new, top-quality gym equipment including free weights, resistance machines, and cardio stations." },
              { icon: "fa-users", title: "Community Vibe", text: "Friendly community feeling with amazing trainers who are ready to support your fitness journey." },
              { icon: "fa-wind", title: "Spacious & Airy", text: "A spacious workout area with an open-air setup for a fresh and comfortable workout environment." },
            ].map((card, i) => (
              <FadeIn key={i} style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="about-card">
                  <i className={`fas ${card.icon}`} />
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section id="facilities" className="section-dark section-padding">
        <div className="container">
          <FadeIn><h2 className="section-title">Facilities & Features</h2></FadeIn>
          <div className="facilities-list">
            {["Spacious Workout Zones","Professional Trainers","Cardio & Strength Machines","Free Filtered Water","Good Music & Vibe","Affordable Rates"].map((f, i) => (
              <FadeIn key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="facility-item">
                  <i className="fas fa-check-circle" /><span>{f}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="section-padding">
        <div className="container">
          <FadeIn><h2 className="section-title">Photo & Video Gallery</h2></FadeIn>
          <div className="gallery-grid">
            {galleryImages.map((src, i) => (
              <div key={i} className="gallery-item" onClick={() => setModalSrc(src)}>
                <img src={src} alt={`Gym photo ${i + 1}`} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {modalSrc && (
        <div className="image-modal active" onClick={(e) => { if (e.target === e.currentTarget) setModalSrc(null); }}>
          <button className="modal-close" onClick={() => setModalSrc(null)}>&times;</button>
          <img src={modalSrc} alt="Zoomed" />
        </div>
      )}

      {/* Reviews */}
      <section id="reviews" className="section-padding">
        <div className="container">
          <FadeIn><h2 className="section-title">What Our Members Say</h2></FadeIn>
          <div
            className="reviews-grid"
            ref={reviewsRef}
            onPointerDown={handleReviewPointerDown}
            onPointerMove={handleReviewPointerMove}
            onPointerUp={handleReviewPointerUp}
            onPointerLeave={handleReviewPointerUp}
          >
            {[...reviews, ...reviews].map((r, i) => (
              <div key={i} className="review-card">
                <Stars />
                <p className="review-text">"{r.text}"</p>
                <p className="review-author">- {r.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <ContactSection />

      {/* Footer */}
      <footer>
        <div className="container">
          <p>&copy; 2026 Muscle Mantra Gym. All Rights Reserved.</p>
          <div className="social-links">
            <a href="https://www.facebook.com/Musclemantragym/mentions/" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f" /></a>
            <a href="https://www.instagram.com/musclemantragym" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram" /></a>
            <a href="https://www.google.com/maps/place/Muscle+Mantra+Gym" target="_blank" rel="noopener noreferrer"><i className="fab fa-google" /></a>
            <a href="https://wa.me/94767933556" target="_blank" rel="noopener noreferrer"><i className="fab fa-whatsapp" /></a>
            <a href="mailto:musclemantragym@gmail.com"><i className="fas fa-envelope" /></a>
          </div>
        </div>
      </footer>
    </>
  );
}