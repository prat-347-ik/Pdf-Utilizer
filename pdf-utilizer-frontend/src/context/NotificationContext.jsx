import { createContext, useContext } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
  const showSuccess = (message) => {
    toast.success(message, { position: "top-right", autoClose: 3000 });
  };

  const showError = (message) => {
    toast.error(message, { position: "top-right", autoClose: 3000 });
  };

  return (
    <NotificationContext.Provider value={{ showSuccess, showError }}>
      {children}
    </NotificationContext.Provider>
  );
};
