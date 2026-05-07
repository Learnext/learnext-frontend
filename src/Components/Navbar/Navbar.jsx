import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import logo from "../Assets/Frontend_Assets/logo.png";
import cart_icon from "../Assets/Frontend_Assets/cart_icon.png";
import { Link } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const Navbar = () => {
  const [menu, setMenu] = useState("Shop");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout: authLogout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const logout = () => {
    authLogout(); // ✅ context tự xóa localStorage + update state
    setDropdownOpen(false);
  };

  return (
    <div className="navbar">
      <div className="nav-logo">
        <img src={logo} alt="" />
        <p>SHOPPER</p>
      </div>

      <ul className="nav-menu">
        <li onClick={() => setMenu("Shop")}>
          <Link to="/">Shop</Link>
          {menu === "Shop" && <hr />}
        </li>
        <li onClick={() => setMenu("Business")}>
          <Link to="/business">Business</Link>
          {menu === "Business" && <hr />}
        </li>
        <li onClick={() => setMenu("Member")}>
          <Link to="/member">Member</Link>
          {menu === "Member" && <hr />}
        </li>
      </ul>

      <div className="nav-login-cart">
        {user ? ( // ✅ dùng user từ context thay vì localStorage.getItem(...)
          <div className="nav-avatar-wrapper" ref={dropdownRef}>
            <div
              className="nav-avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </div>

            {dropdownOpen && (
              <div className="nav-dropdown">
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                  <div className="nav-dropdown-item">Trang cá nhân</div>
                </Link>
                <Link to="/support" onClick={() => setDropdownOpen(false)}>
                  <div className="nav-dropdown-item">Hỗ trợ</div>
                </Link>
                <hr className="nav-dropdown-hr" />
                <div
                  className="nav-dropdown-item nav-dropdown-logout"
                  onClick={logout}
                >
                  Đăng xuất
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login">
            <button>Login</button>
          </Link>
        )}

        <Link to="/cart" className="nav-cart">
          <img src={cart_icon} alt="" />
          <div className="nav-cart-count">0</div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
