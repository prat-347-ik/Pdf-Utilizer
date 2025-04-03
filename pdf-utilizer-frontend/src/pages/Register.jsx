import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Refs for input fields
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/auth/register", {
        username,
        email,
        password,
      });
      setMessage({ type: "success", text: response.data.message });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage({ type: "error", text: error.response?.data?.error || "Registration failed" });
    }
  };

  const handleUsernameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      emailRef.current?.focus(); // Move cursor to Email field
    }
  };

  const handleEmailKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      passwordRef.current?.focus(); // Move cursor to Password field
    }
  };

  const handlePasswordKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRegister(e); // Submit the form
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-black via-gray-900 to-teal-900">
      <div className="bg-gray-900 p-8 rounded-lg shadow-2xl w-96 text-white backdrop-blur-lg bg-opacity-90 border border-blue-500">
        <h2 className="text-3xl font-bold mb-4 text-center tracking-wide text-blue-400">Register</h2>

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
          className="w-full p-3 mb-3 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={handleUsernameKeyDown}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleEmailKeyDown}
          ref={emailRef}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border border-gray-700 bg-gray-800 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={handlePasswordKeyDown}
          ref={passwordRef}
        />

        <button
          className="w-full bg-blue-500 hover:bg-blue-400 text-white p-3 rounded font-bold transition-all duration-300 shadow-lg hover:shadow-blue-500"
          onClick={handleRegister}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default Register;
