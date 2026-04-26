import React from "react";
import "./Offer.css";
import exclusive_image from "../Assets/Frontend_Assets/exclusive_image.png";
const Offer = () => {
  return (
    <div className="offers">
      <div className="offers-left">
        <h1>EXclusive Offer</h1>
        <h1>Offer for you</h1>
        <p>Only on best sellers</p>
        <button>Check Now</button>
      </div>
      <div className="offers-right">
        <img src={exclusive_image} alt="" />
      </div>
    </div>
  );
};

export default Offer;
