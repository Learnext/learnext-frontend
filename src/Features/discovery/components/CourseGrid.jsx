const CourseGrid = ({ courses, loading }) => {
  if (loading) return <p>Đang tải...</p>;

  if (!courses.length) {
    return <p>Không tìm thấy khóa học</p>;
  }

  return (
    <div className="course-grid">
      {courses.map((course) => (
        <div key={course.id} className="course-card">
          <h3>{course.title}</h3>

          <p>{course.description}</p>

          <span>{course.categoryName}</span>

          <strong>{Number(course.price || 0).toLocaleString("vi-VN")}đ</strong>
        </div>
      ))}
    </div>
  );
};

export default CourseGrid;
