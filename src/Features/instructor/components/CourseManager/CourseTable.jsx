// src/Features/instructor/components/CourseManager/CourseTable.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const CourseTable = ({ courses, onEdit, onDelete, onTogglePublish }) => {
  const navigate = useNavigate();

  return (
    <div className="course-table-wrapper">
      <table className="course-table">
        <thead>
          <tr>
            <th>Khóa học</th>
            <th>Danh mục</th>
            <th>Giá</th>
            <th>Học viên</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => (
            <tr key={course.id}>
              <td>
                <div className="course-title-cell">
                  <div className="course-thumb-small">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" />
                    ) : (
                      <div className="thumb-placeholder"></div>
                    )}
                  </div>
                  <span>{course.title}</span>
                </div>
              </td>
              <td>{course.category}</td>
              <td>{Number(course.price).toLocaleString("vi-VN")}đ</td>
              <td>{course.students}</td>
              <td>
                <span
                  className={`status-badge ${
                    course.status === "published"
                      ? "status-published"
                      : "status-draft"
                  }`}
                >
                  {course.status === "published" ? "Đã đăng" : "Nháp"}
                </span>
              </td>
              <td>
                <div className="action-btns">
                  <button
                    className="btn-action btn-manage"
                    onClick={() =>
                      navigate(`/instructor/courses/${course.id}/content`)
                    }
                  >
                    Nội dung
                  </button>

                  <button
                    className="btn-action btn-publish"
                    onClick={() => onTogglePublish(course)}
                  >
                    {course.status === "published" ? "Ẩn" : "Đăng"}
                  </button>

                  <button
                    className="btn-action btn-edit"
                    onClick={() => onEdit(course)}
                  >
                    Sửa
                  </button>

                  <button
                    className="btn-action btn-delete"
                    onClick={() => onDelete(course.id)}
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;
