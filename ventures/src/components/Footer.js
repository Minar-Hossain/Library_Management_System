function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        <h2 className="footer-title">VENTURES</h2>

        <p className="footer-text">
          © {new Date().getFullYear()} Premium Shoe Store. <br />
          All rights reserved by Minar Hossain.
        </p>

        <div className="footer-socials">

          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            <FacebookIcon />
          </a>

          <a href="https://youtube.com" target="_blank" rel="noreferrer">
            <YouTubeIcon />
          </a>

          <a href="https://x.com" target="_blank" rel="noreferrer">
            <XIcon />
          </a>

          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            <InstagramIcon />
          </a>

        </div>

      </div>

      {/* CSS */}
      <style>{`
        .footer {
          background: #0f0f0f;
          color: #fff;
          padding: 40px 20px;
          margin-top: 50px;
          text-align: center;
        }

        .footer-container {
          max-width: 900px;
          margin: auto;
        }

        .footer-title {
          margin-bottom: 10px;
          letter-spacing: 2px;
        }

        .footer-text {
          font-size: 14px;
          opacity: 0.8;
          margin-bottom: 20px;
        }

        .footer-socials {
          display: flex;
          justify-content: center;
          gap: 18px;
        }

        .footer-socials a {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #1c1c1c;
          transition: 0.3s ease;
        }

        .footer-socials a:hover {
          background: #ffffff;
          transform: translateY(-3px);
        }

        .footer-socials svg {
          width: 20px;
          height: 20px;
          fill: white;
        }

        .footer-socials a:hover svg {
          fill: black;
        }
      `}</style>
    </footer>
  );
}

/* ===== ICONS (No library needed) ===== */

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M22 12a10 10 0 10-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12H17l-.4 3h-2.3v7A10 10 0 0022 12z"/>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M23.5 7.2s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.1-1C17.6 3.5 12 3.5 12 3.5h0s-5.6 0-8.6.4c-.4 0-1.3.1-2.1 1C.7 5.6.5 7.2.5 7.2S.3 9 .3 10.8v2.4c0 1.8.2 3.6.2 3.6s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.3.4 7.3.4s5.6 0 8.6-.4c.4 0 1.3-.1 2.1-1 .6-.7.8-2.3.8-2.3s.2-1.8.2-3.6v-2.4c0-1.8-.2-3.6-.2-3.6zM9.8 15.2V8.8l6.2 3.2-6.2 3.2z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.8l-5.3-6.6L4.9 22H2l7.3-8.4L1 2h6.9l4.8 6L18.9 2zm-1.2 18h1.7L7.1 4H5.3l12.4 16z"/>
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm10 2H7a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3zm-5 4.5A4.5 4.5 0 1112 19a4.5 4.5 0 010-9zm0 2A2.5 2.5 0 1014.5 12 2.5 2.5 0 0012 8.5zM18 6.5a1 1 0 11-1 1 1 1 0 011-1z"/>
    </svg>
  );
}

export default Footer;