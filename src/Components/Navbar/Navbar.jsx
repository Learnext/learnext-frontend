import React, { useState, useRef, useEffect } from "react";
import "./Navbar.css";
import logo from "../../Assets/Frontend_Assets/logo.png";
import cart_icon from "../../Assets/Frontend_Assets/cart_icon.png";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../Features/auth/context/AuthContext";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);
  const location = useLocation();

  const { user, logout: authLogout } = useAuth();

  // Active menu theo route hiện tại
  const getMenu = () => {
    if (location.pathname === "/") return "Shop";
    if (location.pathname === "/business") return "Business";
    if (location.pathname === "/member") return "Member";
    return "";
  };

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = () => {
    authLogout();
    setDropdownOpen(false);
  };

  return (
    <div className="navbar">
      {/* Logo */}
      <div className="nav-logo">
        <img src={logo} alt="logo" />
        <p>SHOPPER</p>
      </div>

      {/* Menu */}
      <ul className="nav-menu">
        <li>
          <Link to="/">Shop</Link>
          {getMenu() === "Shop" && <hr />}
        </li>

        <li>
          <Link to="/business">Business</Link>
          {getMenu() === "Business" && <hr />}
        </li>

        <li>
          <Link to="/member">Member</Link>
          {getMenu() === "Member" && <hr />}
        </li>
      </ul>

      {/* Right */}
      <div className="nav-login-cart">
        {user ? (
          <div className="nav-avatar-wrapper" ref={dropdownRef}>
            {/* Avatar */}
            <div
              className="nav-avatar"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {user?.username?.charAt(0)?.toUpperCase() || "U"}
            </div>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="nav-dropdown">
                <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                  <div className="nav-dropdown-item">Trang cá nhân</div>
                </Link>
                <Link to="/orders" onClick={() => setDropdownOpen(false)}>
                  <div className="nav-dropdown-item">My orders</div>
                </Link>
                <Link to="/activate" onClick={() => setDropdownOpen(false)}>
                  <div className="nav-dropdown-item">Activate</div>
                </Link>
                <Link to="/learning" onClick={() => setDropdownOpen(false)}>
                  <div className="nav-dropdown-item">Learning</div>
                </Link>

                {/* Instructor dashboard */}
                {user?.isInstructor && (
                  <Link to="/instructor" onClick={() => setDropdownOpen(false)}>
                    <div className="nav-dropdown-item">
                      Instructor Dashboard
                    </div>
                  </Link>
                )}

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
            <button>Đăng nhập</button>
          </Link>
        )}

        {/* Cart */}
        <Link to="/cart" className="nav-cart">
          <img src={cart_icon} alt="cart" />
          <div className="nav-cart-count">0</div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
