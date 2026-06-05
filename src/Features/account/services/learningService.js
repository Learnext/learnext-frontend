import { requestApi, requireLogin } from "./accountApi";

export const fetchEnrollments = async () => {
  requireLogin();
  return requestApi("/learning/enrollments");
};

export const fetchCourseAccess = async (courseId) => {
  requireLogin();
  return requestApi(`/learning/courses/${courseId}/access`);
};

export const completeLesson = async (courseId, lessonId) => {
  requireLogin();
  return requestApi(`/learning/courses/${courseId}/complete`, {
    method: "POST",
    body: JSON.stringify({ lessonId }),
  });
};
