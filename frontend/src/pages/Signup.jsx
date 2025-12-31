import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!name || !email || !password) {
      alert("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name,       // ✅ matches backend
        email,
        password
      });

      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card" style={{ maxWidth: "400px", width: "100%" }}>
        <h2>Signup</h2>

        <form onSubmit={handleSignup}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Signing up..." : "Signup"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
