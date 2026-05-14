import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

export const useInstructorGuard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== "instructor") {
      navigate("/");
    }
  }, [user, navigate]);

  return { isAllowed: user?.role === "instructor" };
};
