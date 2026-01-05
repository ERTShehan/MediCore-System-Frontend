import { createContext, useContext, useEffect } from "react";
import { loadUser, setCredentials } from "../redux/slices/authSlice";
import { useAppDispatch, useAppSelector } from "../redux/store";

// Define the shape of the context to match what pages expect
interface AuthContextType {
  user: any;
  loading: boolean;
  setUser: (user: any) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: any) => {
  const dispatch = useAppDispatch();
  
  // Select data directly from Redux Store
  const { user, loading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Dispatch the thunk to load user details on app start
    dispatch(loadUser());
  }, [dispatch]);

  // Wrapper function to update Redux state (matches the old setUser API)
  const setUserWrapper = (userData: any) => {
    if (userData) {
      dispatch(setCredentials(userData));
    } else {

      dispatch(setCredentials(userData)); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: setUserWrapper, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};