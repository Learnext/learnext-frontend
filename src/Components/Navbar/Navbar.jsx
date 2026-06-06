import React, { useState, useRef, useEffect, useMemo } from "react";
import "./Navbar.css";

import logo from "../../Assets/Frontend_Assets/logo.png";
import cart_icon from "../../Assets/Frontend_Assets/cart_icon.png";
import { fetchCartService } from "../../Features/cart/services/cartService";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Features/auth/context/AuthContext";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  const [activeCat, setActiveCat] = useState(null);
  const [keyword, setKeyword] = useState("");

  const [courses, setCourses] = useState([]);

  const dropdownRef = useRef(null);
  const megaRef = useRef(null);

  const navigate = useNavigate();
  const [cartCount, setCartCount] = useState(0);

  const { user, logout: authLogout } = useAuth();

  // Load courses từ backend
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await fetch("http://localhost:5000/courses");

        const data = await res.json();

        setCourses(data);
      } catch (err) {
        console.error("Lỗi load courses:", err);
      }
    };

    loadCourses();
  }, []);

  // Build categories động từ courses
  const categories = useMemo(() => {
    const unique = [...new Set(courses.map((c) => c.category))];

    return unique.map((cat) => ({
      id: cat,
      name: cat,

      groups: courses
        .filter((c) => c.category === cat)
        .map((course) => ({
          title: course.title,
          desc: course.description,
          courseId: course.id,
        })),
    }));
  }, [courses]);

  useEffect(() => {
    const loadCart = async () => {
      const data = await fetchCartService();
      setCartCount(data.length);
    };

    loadCart();

    window.addEventListener("cartUpdated", loadCart);

    return () => {
      window.removeEventListener("cartUpdated", loadCart);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }

      if (megaRef.current && !megaRef.current.contains(e.target)) {
        setMegaOpen(false);
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

    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();

    if (!keyword.trim()) return;

    navigate(`/search?q=${encodeURIComponent(keyword)}`);

    setKeyword("");
  };

  const currentSub =
    categories.find((c) => c.id === activeCat) || categories[0];

  return (
    <div className="navbar">
      {/* Logo */}
      <Link to="/" className="nav-logo">
        <img src={logo} alt="logo" />
        <p>LearnNext</p>
      </Link>

      {/* Danh mục & Mega Menu */}
      <div className="mega-wrapper" ref={megaRef}>
        <button className="nav-cat-btn" onClick={() => setMegaOpen(!megaOpen)}>
          <span className="cat-icon"></span>
          Danh mục
        </button>

        {megaOpen && (
          <div className="mega-menu open">
            {/* LEFT */}
            <div className="mega-left">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`mega-cat ${
                    (activeCat || categories[0]?.id) === cat.id ? "active" : ""
                  }`}
                  onMouseEnter={() => setActiveCat(cat.id)}
                >
                  <span className="cat-name-text">{cat.name}</span>

                  <span className="cat-arrow">›</span>
                </div>
              ))}
            </div>

            {/* RIGHT */}
            <div className="mega-right">
              <div className="mega-right-header">{currentSub?.name}</div>

              <div className="mega-groups-grid">
                {currentSub?.groups.map((group, index) => (
                  <div
                    key={index}
                    className="mega-group-item"
                    onClick={() => {
                      navigate(`/course/${group.courseId}`);

                      setMegaOpen(false);
                    }}
                  >
                    <div className="group-title">{group.title}</div>

                    {group.desc && (
                      <div className="group-desc">{group.desc}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search */}
      <form className="nav-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Tìm khóa học, giảng viên..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <button type="submit"></button>
      </form>

      {/* Right */}
      <div className="nav-login-cart">
        <ul className="nav-menu">
          {user && !user.isInstructor && (
            <li>
              <Link to="/my-courses">Khóa học của tôi</Link>
            </li>
          )}
        </ul>

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
                {!user.isInstructor && (
                  <Link to="/my-courses" onClick={() => setDropdownOpen(false)}>
                    <div className="nav-dropdown-item">Khóa học của tôi</div>
                  </Link>
                )}

                <Link to="/profile" onClick={() => setDropdownOpen(false)}>
                  <div className="nav-dropdown-item">Trang cá nhân</div>
                </Link>

                {user?.isInstructor && (
                  <Link to="/instructor" onClick={() => setDropdownOpen(false)}>
                    <div className="nav-dropdown-item">Dashboard</div>
                  </Link>
                )}

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
            <button className="login-btn">Đăng nhập</button>
          </Link>
        )}

        {/* Cart */}
        <Link to="/cart" className="nav-cart">
          <img src={cart_icon} alt="cart" />

          <div className="nav-cart-count">{cartCount}</div>
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
