import { requestApi, requireLogin } from "./accountApi";

export const activateCourse = async (code) => {
  requireLogin();
  return requestApi("/activations/activate", {
    method: "POST",
    body: JSON.stringify({ code }),
  });
};
