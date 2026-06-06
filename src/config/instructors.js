export const INSTRUCTORS = {
  "teacher@gmail.com": "11111111-1111-1111-1111-111111111111",
  "admin@gmail.com": "22222222-2222-2222-2222-222222222222",
};

export const instructorHeaders = (isJson = false) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const instructorId = INSTRUCTORS[user.email] || user.id || "";

  return {
    "X-Instructor-Id": instructorId,
    ...(isJson && { "Content-Type": "application/json" }),
  };
};
