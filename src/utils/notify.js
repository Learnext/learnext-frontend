import { Store } from "react-notifications-component";

const showNotification = (type, title, message) => {
  Store.addNotification({
    title,
    message,
    type,
    insert: "top",
    container: "top-right",
    dismiss: {
      duration: 3200,
      onScreen: true,
      pauseOnHover: true,
    },
  });
};

export const notifySuccess = (message, title = "Thành công") => {
  showNotification("success", title, message);
};

export const notifyError = (message, title = "Lỗi") => {
  showNotification("danger", title, message);
};

export const notifyInfo = (message, title = "Thông báo") => {
  showNotification("info", title, message);
};
