import { useState } from "react";
import API from "../api";
import "../styles/login.css";
import { useNavigate } from "react-router-dom";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const response = await API.post("/login", {
        email: email,
        password: password
      });

      localStorage.setItem("token", response.data.token);
      alert("Login successful");
      navigate("/dashboard");
      setError("");
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="email"
        placeholder="Enter email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>

      <p style={{ marginTop: "10px", textAlign: "center" }}>
  Don’t have an account? <a href="/signup">Sign up</a>
</p>
    </div>
  );
}

export default Login;
