import React from "react";
import "./hero.css";

import hero1_image from "../Assets/Frontend_Assets/hero1_image.jpg";
const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-right">
        <img src={hero1_image} alt="" />
      </div>
    </div>
  );
};

export default Hero;
