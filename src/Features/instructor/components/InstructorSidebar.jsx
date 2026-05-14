// src/Instructor/InstructorSidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import "../styles/InstructorSidebar.css";

// ─── FIX #6: Bỏ link /instructor/upload bị thừa ──────────────
// UC05 (tạo khóa học) đã được handle trong /instructor/courses
// Không có route /instructor/upload nên bỏ để tránh 404

const InstructorSidebar = () => {
  const location = useLocation();

  const navItems = [
    { to: "/instructor", label: "Dashboard", exact: true },
    { to: "/instructor/courses", label: "Khóa học", exact: false },
  ];

  const isActive = (to, exact) => {
    if (exact) return location.pathname === to;
    return location.pathname.startsWith(to);
  };

  return (
    <div className="instructor-sidebar">
      <h2>Instructor</h2>

      {navItems.map(({ to, label, exact }) => (
        <Link key={to} to={to} className={isActive(to, exact) ? "active" : ""}>
          {label}
        </Link>
      ))}
    </div>
  );
};

export default InstructorSidebar;
