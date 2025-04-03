import { useState, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const passwordRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/auth/login", { username, password });

      localStorage.setItem("token", response.data.access_token);
      login(username);

      setMessage({ type: "success", text: "Login successful" });

      setTimeout(() => navigate("/Dashboard"), 1000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Login failed" });
    }
  };

  const handleUsernameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus();
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin(e);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-96 text-white backdrop-blur-lg bg-opacity-90 border border-purple-500">
        <h2 className="text-3xl font-bold mb-4 text-center tracking-wide text-purple-400">Login</h2>

        {message && (
          <p
            className={`mb-4 text-center p-2 rounded-md bg-opacity-80 ${
              message.type === "error" ? "bg-red-600 text-white" : "bg-green-600 text-white"
            }`}
          >
            {message.text}
          </p>
        )}

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 mb-3 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleUsernameKeyDown}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all duration-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handlePasswordKeyDown}
          ref={passwordRef}
        />

        <button
          className="w-full bg-pink-500 hover:bg-pink-400 text-white p-3 rounded font-bold transition-all duration-300 shadow-lg hover:shadow-purple-500"
          onClick={handleLogin}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
