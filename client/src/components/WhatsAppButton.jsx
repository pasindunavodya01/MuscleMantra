import React from "react";
import { openWhatsApp } from "../utils/whatsapp";

const PRIMARY = "#ff5722";
const SECONDARY = "#212121";

const whatsappStyles = `
  .whatsapp-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background: #25D366;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 600;
    font-family: 'Roboto', sans-serif;
    transition: all 0.3s;
    text-decoration: none;
    box-shadow: 0 2px 8px rgba(37, 211, 102, 0.3);
  }

  .whatsapp-btn:hover {
    background: #20ba5a;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.4);
  }

  .whatsapp-btn:active {
    transform: translateY(0);
  }

  .whatsapp-btn i {
    font-size: 1.1rem;
  }

  /* Floating WhatsApp Button */
  .whatsapp-floating {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #25D366;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    transition: all 0.3s;
  }

  .whatsapp-floating:hover {
    background: #20ba5a;
    transform: scale(1.1);
    box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4);
  }

  /* Card variant for contact info */
  .whatsapp-card {
    background: #181818;
    border: 1px solid #252525;
    border-radius: 12px;
    padding: 22px 24px;
    display: flex;
    align-items: flex-start;
    gap: 18px;
    transition: border-color 0.3s, transform 0.3s, box-shadow 0.3s;
    text-decoration: none;
    color: inherit;
    cursor: pointer;
  }

  .whatsapp-card:hover {
    border-color: #25D366;
    transform: translateX(6px);
    box-shadow: -4px 0 0 #25D366, 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  .whatsapp-icon-wrap {
    width: 46px;
    height: 46px;
    flex-shrink: 0;
    background: rgba(37, 211, 102, 0.12);
    border: 1px solid rgba(37, 211, 102, 0.25);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    color: #25D366;
    transition: background 0.3s;
  }

  .whatsapp-card:hover .whatsapp-icon-wrap {
    background: rgba(37, 211, 102, 0.22);
  }

  .whatsapp-info-label {
    font-family: 'Oswald', sans-serif;
    font-size: 0.7rem;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #666;
    margin-bottom: 4px;
  }

  .whatsapp-info-value {
    font-size: 0.97rem;
    color: #e0e0e0;
    line-height: 1.5;
  }

  /* Modal for announcement */
  .whatsapp-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .whatsapp-modal {
    background: ${SECONDARY};
    border-radius: 12px;
    padding: 32px;
    max-width: 500px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
  }

  .whatsapp-modal h3 {
    margin-bottom: 20px;
    color: #fff;
    font-family: 'Oswald', sans-serif;
  }

  .whatsapp-modal-close {
    position: absolute;
    top: 16px;
    right: 16px;
    background: none;
    border: none;
    color: #bdbdbd;
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.3s;
  }

  .whatsapp-modal-close:hover {
    color: #fff;
  }

  .whatsapp-form-group {
    margin-bottom: 20px;
  }

  .whatsapp-label {
    display: block;
    color: #bdbdbd;
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .whatsapp-input,
  .whatsapp-textarea {
    width: 100%;
    background: #1a1a1a;
    border: 1px solid #2a2a2a;
    border-radius: 6px;
    color: #fff;
    padding: 10px 14px;
    font-size: 0.95rem;
    font-family: 'Roboto', sans-serif;
    transition: all 0.3s;
  }

  .whatsapp-input:focus,
  .whatsapp-textarea:focus {
    outline: none;
    border-color: #25D366;
    box-shadow: 0 0 0 3px rgba(37, 211, 102, 0.1);
  }

  .whatsapp-textarea {
    resize: vertical;
    min-height: 120px;
  }

  .whatsapp-modal-footer {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .whatsapp-btn-submit {
    flex: 1;
    background: #25D366;
    color: white;
    border: none;
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
  }

  .whatsapp-btn-submit:hover {
    background: #20ba5a;
    transform: translateY(-2px);
  }

  .whatsapp-btn-cancel {
    flex: 1;
    background: #2a2a2a;
    color: #bdbdbd;
    border: none;
    padding: 12px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.3s;
  }

  .whatsapp-btn-cancel:hover {
    background: #3a3a3a;
  }

  @media (max-width: 768px) {
    .whatsapp-floating {
      bottom: 16px;
      right: 16px;
      width: 48px;
      height: 48px;
      font-size: 1.2rem;
    }

    .whatsapp-modal {
      padding: 24px;
    }
  }
`;

/**
 * WhatsAppButton Component
 * @param {Object} props - Component props
 * @param {string} props.message - Message to send
 * @param {string} props.label - Button label
 * @param {string} props.variant - 'default' | 'outline' | 'floating'
 * @param {string} props.onClick - Custom click handler (optional)
 * @param {boolean} props.showIcon - Show WhatsApp icon
 * @param {string} props.className - Additional CSS classes
 */
export const WhatsAppButton = ({
  message = "Hi! I'd like to contact the gym",
  label = "Contact on WhatsApp",
  variant = "default",
  onClick,
  showIcon = true,
  className = "",
  link,
}) => {
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    } else if (link) {
      openWhatsApp(link);
    }
  };

  if (variant === "floating") {
    return (
      <>
        <style>{whatsappStyles}</style>
        <button
          className={`whatsapp-floating ${className}`}
          onClick={handleClick}
          title="Contact us on WhatsApp"
          aria-label="Contact us on WhatsApp"
        >
          <i className="fab fa-whatsapp" />
        </button>
      </>
    );
  }

  return (
    <>
      <style>{whatsappStyles}</style>
      <button
        className={`whatsapp-btn ${className}`}
        onClick={handleClick}
      >
        {showIcon && <i className="fab fa-whatsapp" />}
        {label}
      </button>
    </>
  );
};

/**
 * WhatsAppContactCard - Card format for contact sections
 */
export const WhatsAppContactCard = ({ link, phone = "+94 76 793 3556", label = "WhatsApp" }) => {
  return (
    <>
      <style>{whatsappStyles}</style>
      <button
        className="whatsapp-card"
        onClick={() => openWhatsApp(link)}
        style={{ background: "inherit", padding: "22px 24px" }}
      >
        <div className="whatsapp-icon-wrap">
          <i className="fab fa-whatsapp" />
        </div>
        <div>
          <div className="whatsapp-info-label">{label}</div>
          <div className="whatsapp-info-value">{phone}</div>
        </div>
      </button>
    </>
  );
};

/**
 * WhatsAppAnnouncementModal - Modal for sending announcements
 */
export const WhatsAppAnnouncementModal = ({ isOpen, onClose, onSend, loading = false }) => {
  const [message, setMessage] = React.useState("");
  const [recipients, setRecipients] = React.useState("All Members");

  const handleSend = () => {
    if (!message.trim()) {
      alert("Please write an announcement message");
      return;
    }
    onSend(message, recipients);
    setMessage("");
    setRecipients("All Members");
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{whatsappStyles}</style>
      <div className="whatsapp-modal-overlay" onClick={onClose}>
        <div className="whatsapp-modal" onClick={(e) => e.stopPropagation()}>
          <button className="whatsapp-modal-close" onClick={onClose}>
            &times;
          </button>
          <h3>📢 Send Announcement via WhatsApp</h3>

          <div className="whatsapp-form-group">
            <label className="whatsapp-label">Recipients</label>
            <input
              type="text"
              className="whatsapp-input"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="e.g., All Members, Group A, etc."
            />
          </div>

          <div className="whatsapp-form-group">
            <label className="whatsapp-label">Announcement Message</label>
            <textarea
              className="whatsapp-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your announcement here..."
            />
            <small style={{ color: "#888", marginTop: "8px", display: "block" }}>
              ℹ️ Click 'Send' to compose the message on WhatsApp
            </small>
          </div>

          <div className="whatsapp-modal-footer">
            <button
              className="whatsapp-btn-submit"
              onClick={handleSend}
              disabled={loading}
            >
              {loading ? "Preparing..." : "Send via WhatsApp"}
            </button>
            <button className="whatsapp-btn-cancel" onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default WhatsAppButton;
