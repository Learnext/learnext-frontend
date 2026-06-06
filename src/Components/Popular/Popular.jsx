import React, { useEffect, useState } from "react";
import "./Popular.css";
import Item from "../Item/Item";

const API = "http://localhost:1201/api/v1";

const Popular = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch(`${API}/courses`)
      .then((res) => res.json())
      .then((data) => setCourses(data.data || [])) // BE trả về { success, data }
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="popular">
      <h1>Popular Courses</h1>
      <hr />
      <div className="popular-items">
        {courses.map((item) => (
          <Item
            key={item.id}
            id={item.id}
            title={item.title}
            thumbnail={item.thumbnailUrl}
            price={item.price}
            category={item.categoryName}
            description={item.description}
          />
        ))}
      </div>
    </div>
  );
};

export default Popular;
