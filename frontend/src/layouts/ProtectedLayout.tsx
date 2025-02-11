import { ReactNode, useEffect, useState } from "react";
import { validateToken } from "@/api/authApi";
import { Navigate } from "react-router-dom";
import { setUserInfo } from "@/store/userSlice";
import { useDispatch} from "react-redux";
import { AppDispatch } from "@/store/store";
interface ProtectedRoutesProps {
  children: ReactNode;
}
const ProtectedRoutes: React.FC<ProtectedRoutesProps> = ({ children }) => {
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenValidation = async () => {
      if (!token) {
        setIsValidUser(false);
        return;
      }
      try {
        const data = await validateToken();
        const { success, user } = data;
        dispatch(setUserInfo({ ...user, isAuthenticated: success }));
        setIsValidUser(success);
      } catch (err) {
        console.error("Token validation error:", err);
        setIsValidUser(false);
      }
    };

    tokenValidation();
  }, [dispatch]);

  if (isValidUser === null) {
    return <div>Loading...</div>;
  }

  return isValidUser ? <>{children}</> : <Navigate to="/" />;
};

export default ProtectedRoutes;
