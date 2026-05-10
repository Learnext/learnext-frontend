import React from "react";
import "./Footers.css";
import footer_logo from "../../assets/Frontend_Assets/logo.png";
import instagram_icon from "../../assets/Frontend_Assets/instagram_icon.png";
import pintester_icon from "../../assets/Frontend_Assets/pintester_icon.png";
import whatsapp_icon from "../../assets/Frontend_Assets/whatsapp_icon.png";

const Footers = () => {
  return (
    <div className="footers">
      <div className="footer-logo">
        <img src={footer_logo} alt="footer-logo" />
        <p>SHOPPER</p>
      </div>
      <ul className="footer-links">
        <li>Company</li>
        <li>Products</li>
        <li>Offices</li>
        <li>About</li>
        <li>Contact</li>
      </ul>
      <div className="footer-social-icon">
        <div className="footer-icons-container">
          <img src={instagram_icon} alt="instagram-icon" />
        </div>
        <div className="footer-icons-container">
          <img src={pintester_icon} alt="pinterest-icon" />
        </div>
        <div className="footer-icons-container">
          <img src={whatsapp_icon} alt="whatsapp-icon" />
        </div>
      </div>
      <div className="footer-coppyright">
        <hr />
        <p>© 2026 SHOPPER. All rights reserved.</p>
      </div>
    </div>
  );
};

export default Footers;
