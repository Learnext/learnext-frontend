export const INSTRUCTORS = {
  "gv1@test.com": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
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
