import { useEffect, useState } from "react";
import { completeLesson, fetchCourseAccess, fetchEnrollments } from "../services/learningService";
import "../styles/AccountPages.css";

const Learning = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [selected, setSelected] = useState(null);
  const [lessonId, setLessonId] = useState("");
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    fetchEnrollments()
      .then((data) => {
        setEnrollments(data || []);
        setStatus("");
      })
      .catch((error) => setStatus(error.message === "LOGIN_REQUIRED" ? "Login required" : error.message));
  }, []);

  const openAccess = async (courseId) => {
    setStatus("Loading access...");
    try {
      setSelected(await fetchCourseAccess(courseId));
      setStatus("");
    } catch (error) {
      setStatus(error.message);
    }
  };

  const markComplete = async () => {
    if (!selected?.courseId || !lessonId) {
      return;
    }
    setStatus("Saving progress...");
    try {
      await completeLesson(selected.courseId, lessonId);
      setLessonId("");
      setStatus("Lesson completed");
    } catch (error) {
      setStatus(error.message);
    }
  };

  return (
    <main className="account-page">
      <section className="account-panel">
        <h1>Learning</h1>
        {status && <p className="account-status">{status}</p>}
        <div className="account-list">
          {enrollments.map((enrollment) => (
            <article key={enrollment.id} className="account-row">
              <div>
                <strong>{enrollment.courseTitle}</strong>
                <span>{new Date(enrollment.createdAt).toLocaleDateString()}</span>
              </div>
              <button onClick={() => openAccess(enrollment.courseId)}>Open</button>
            </article>
          ))}
        </div>
        {selected && (
          <div className="account-subpanel">
            <h2>{selected.courseTitle}</h2>
            <p>Access granted</p>
            <div className="account-inline-form">
              <input value={lessonId} onChange={(event) => setLessonId(event.target.value)} placeholder="Lesson UUID" />
              <button onClick={markComplete}>Complete lesson</button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default Learning;
