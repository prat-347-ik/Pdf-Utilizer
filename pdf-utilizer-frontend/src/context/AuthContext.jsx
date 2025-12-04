import { createContext, useState, useEffect } from "react";
import axios from "axios";
// ✅ UPDATE: Import API_BASE_URL here
import { fetchUserProfile, API_BASE_URL } from "../api/apiService"; 

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // Function to verify token AND fetch latest profile data
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // Fetch REAL profile
      const userData = await fetchUserProfile(token);
      setUser(userData); 
      setLoading(false);

    } catch (error) {
      console.log("Token expired or invalid, attempting refresh...");
      
      if (refreshToken) {
        try {
          // ✅ UPDATE: Use the imported constant variable
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          
          const newToken = res.data.access_token;
          localStorage.setItem("token", newToken);
          
          // Retry fetching profile with new token
          const newUserData = await fetchUserProfile(newToken);
          setUser(newUserData);
          
        } catch (refreshErr) {
          console.error("Refresh failed:", refreshErr);
          logout(); 
        }
      } else {
        logout(); 
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData) => {
    if (typeof userData === 'string') {
       setUser({ username: userData, plan: 'free' });
    } else {
       setUser((prev) => ({
          ...prev, 
          ...userData, 
          plan: userData.plan || prev?.plan || 'free' 
       }));
    }
    setIsGuest(false);
    setLoading(false);
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    setLoading(false);
  };

  const logout = () => {
    const username = localStorage.getItem("username");
    if (username) {
        // ✅ UPDATE: Use the imported constant variable
        axios.post(`${API_BASE_URL}/auth/logout`, { username }).catch(err => console.error(err));
    }

    localStorage.clear();
    setUser(null);
    setIsGuest(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, loading, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};