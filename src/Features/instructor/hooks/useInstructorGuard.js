import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";

export const useInstructorGuard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const instructorId = localStorage.getItem("instructorId");

  useEffect(() => {
    if (!user || !instructorId) {
      navigate("/");
    }
  }, [user, instructorId, navigate]);

  return {
    isAllowed: !!user && !!instructorId,
  };
};
