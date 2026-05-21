const InstructorSection = ({ authUser, formData, changeHandler, editing }) => {
  if (authUser.role !== "instructor") return null;

  return (
    <div className="form-section instructor-section">
      <h3>Thông tin học viên</h3>

      <input
        name="expertise"
        value={formData.expertise}
        onChange={changeHandler}
        disabled={!editing}
      />
    </div>
  );
};

export default InstructorSection;
