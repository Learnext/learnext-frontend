import React from "react";
import "./Item.css";
import { Link } from "react-router-dom";

const Item = (props) => {
  return (
    <Link className="item" to={`/products/${props.id}`}>
      <img src={props.image} alt="" />
      <p>{props.name}</p>
      {props.instructorName && <span>{props.instructorName}</span>}
      <div className="item-price">
        <div className="item-price-new">${props.new_price}</div>
        {props.old_price && <div className="item-price-old">${props.old_price}</div>}
      </div>
    </Link>
  );
};

export default Item;
