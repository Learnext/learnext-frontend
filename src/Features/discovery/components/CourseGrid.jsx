const CourseGrid = ({ courses, loading }) => {
  if (loading) return <p>Đang tải...</p>;
  if (!courses.length) return <p>Không tìm thấy khóa học</p>;

  return (
    <div className="course-grid">
      {courses.map((course) => (
        <div key={course.id} className="course-card">
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <span>{course.category}</span>
          <strong>{course.price?.toLocaleString("vi-VN")}đ</strong>
        </div>
      ))}
    </div>
  );
};

export default CourseGrid;
