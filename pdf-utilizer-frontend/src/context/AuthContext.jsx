import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true); // START AS TRUE

  // Function to verify or refresh token
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    const refreshToken = localStorage.getItem("refreshToken");
    const storedUsername = localStorage.getItem("username");

    // 1. If no data, stop loading, user is null.
    if (!token || !storedUsername) {
      setLoading(false);
      return;
    }

    try {
        // Optional: Call a lightweight /me endpoint to verify 'token' is valid
        // For now, we assume if it exists, it's valid, OR we try to refresh if needed.
        
        // Simple expiry check (JWT decode) could go here. 
        // Instead, let's just restore the user state.
        setUser({ username: storedUsername, plan: 'free' });
        setLoading(false);

    } catch (error) {
        // If token is invalid, try to refresh
        if (refreshToken) {
            try {
                const res = await axios.post("http://localhost:5000/auth/refresh", { refreshToken });
                localStorage.setItem("token", res.data.access_token);
                setUser({ username: storedUsername, plan: 'free' });
            } catch (refreshErr) {
                console.error("Refresh failed", refreshErr);
                logout(); // Token invalid, force logout
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
    const username = userData.username || userData;
    // Note: Tokens are set in Login.jsx, but good to ensure syncing here if needed
    setUser({ username, plan: 'free' });
    setIsGuest(false);
    setLoading(false);
  };

  const loginAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setLoading(false);
  };

  const logout = () => {
    // Call backend to revoke (Optional but recommended)
    const username = localStorage.getItem("username");
    axios.post("http://localhost:5000/auth/logout", { username }).catch(err => console.log(err));

    localStorage.clear(); // Clear all tokens
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