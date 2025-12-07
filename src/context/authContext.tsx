import { createContext, useContext, useEffect, useState } from "react";
import { getMyDetails } from "../services/auth";

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: any) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      getMyDetails()
        .then((res) => {
            if(res.data) setUser(res.data);
            else setUser(null);
        })
        .catch(() => {
            setUser(null);
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};