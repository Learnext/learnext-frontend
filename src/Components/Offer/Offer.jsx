import React from "react";
import "./Offer.css";

const Offer = () => {
  return (
    <div className="offers">
      <div className="offers-left">
        <span className="offer-badge">🔥 Khóa học nổi bật</span>

        <h1>
          Học công nghệ <br />
          cùng chuyên gia
        </h1>

        <p>
          ReactJS, NodeJS, UI/UX, AI và hàng trăm khóa học chất lượng cao dành
          cho developer hiện đại.
        </p>

        <div className="offer-buttons">
          <button className="offer-primary">Khám phá ngay</button>

          <button className="offer-secondary">Xem khóa học</button>
        </div>

        <div className="offer-stats">
          <div>
            <h3>10K+</h3>
            <span>Học viên</span>
          </div>

          <div>
            <h3>120+</h3>
            <span>Khóa học</span>
          </div>

          <div>
            <h3>4.9★</h3>
            <span>Đánh giá</span>
          </div>
        </div>
      </div>

      <div className="offers-right">
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop"
          alt="online-learning"
        />
      </div>
    </div>
  );
};

export default Offer;
