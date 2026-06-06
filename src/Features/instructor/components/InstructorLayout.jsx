// src/Instructor/InstructorLayout.jsx

import React from "react";
import { Outlet, useNavigate } from "react-router-dom";

import InstructorSidebar from "./InstructorSidebar";

import "../styles/InstructorLayout.css";

const InstructorLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="instructor-layout">
      <InstructorSidebar />

      <div className="instructor-content">
        {/* Header */}
        <div className="instructor-topbar">
          <button className="back-home-btn" onClick={() => navigate("/")}>
            ← Quay lại trang chủ
          </button>
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default InstructorLayout;
