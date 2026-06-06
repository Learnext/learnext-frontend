const InstructorSection = ({ authUser, formData, changeHandler, editing }) => {
  // SỬA Ở ĐÂY: Dùng isInstructor
  if (!authUser?.isInstructor) return null;

  return (
    <div className="form-section instructor-section">
      <h3>Thông tin chuyên môn giảng viên</h3>
      <input
        name="expertise"
        value={formData.expertise || ""}
        onChange={changeHandler}
        disabled={!editing}
        placeholder="Ví dụ: Backend Developer, Data Scientist..."
      />
    </div>
  );
};

export default InstructorSection;
