import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isGuest, setIsGuest] = useState(false); // New State for Guest Mode

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem("username");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      // User is logged in
      setUser({ username: storedUser, plan: 'free' }); // Default to free for now
      setIsGuest(false);
    } else {
      // No user found, default to null (will require login or guest selection)
      setUser(null);
      setIsGuest(false);
    }
  }, []);

  // Login function called by Login.jsx
  const login = (userData) => {
    // Handle if userData is just a string (username) or an object
    const username = typeof userData === 'string' ? userData : userData.username;
    
    localStorage.setItem("username", username);
    // Token is usually set in Login.jsx, but good to have sync logic if needed
    
    setUser({ username, plan: 'free' }); // You can fetch real plan from DB later
    setIsGuest(false);
  };

  // New function for "Continue as Guest"
  const loginAsGuest = () => {
    setIsGuest(true);
    setUser(null); // Guests don't have user profiles
  };

  const logout = () => {
    localStorage.removeItem("username");
    localStorage.removeItem("token");
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider value={{ user, isGuest, login, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};