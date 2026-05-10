// src/Instructor/InstructorLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import InstructorSidebar from "./InstructorSidebar";
import "../styles/InstructorLayout.css";

const InstructorLayout = () => {
  return (
    <div className="instructor-layout">
      <InstructorSidebar />

      <div className="instructor-content">
        <Outlet />
      </div>
    </div>
  );
};

export default InstructorLayout;
