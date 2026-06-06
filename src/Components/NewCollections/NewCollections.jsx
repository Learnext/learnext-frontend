import React, { useEffect, useState } from "react";
import "./NewCollections.css";
import Item from "../Item/Item";
import { fetchDiscoveryCourses } from "../../Features/discovery/services/discoveryService";

const NewCollections = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDiscoveryCourses();

        // lấy 8 khóa mới nhất
        const latest = [...data].reverse().slice(0, 8);

        setCourses(latest);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <section className="new-collections">
      <div className="section-header">
        <span className="section-badge">Khóa học mới</span>

        <h2>Khám phá các khóa học mới nhất</h2>

        <p>
          Cập nhật những khóa học chất lượng cao từ các giảng viên hàng đầu.
        </p>
      </div>

      <div className="collections">
        {courses.map((course) => (
          <Item key={course.id} {...course} />
        ))}
      </div>
    </section>
  );
};

export default NewCollections;
