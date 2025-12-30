import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [tripName, setTripName] = useState("");
  const [currency, setCurrency] = useState("");
  const [joinCode, setJoinCode] = useState("");

  // Fetch user trips
  const fetchTrips = async () => {
    try {
      const res = await API.get("/trips/my-trips");
      setTrips(res.data);
    } catch (err) {
      console.error("Fetch trips error:", err);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  // CREATE TRIP
  const createTrip = async () => {
    if (!tripName.trim() || !currency.trim()) {
      alert("Trip name and currency required");
      return;
    }

    try {
      await API.post("/trips/create", {
        name: tripName.trim(),
        currency: currency.trim()
      });

      setTripName("");
      setCurrency("");
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || "Create trip failed");
    }
  };

  // JOIN TRIP
  const joinTrip = async () => {
    if (!joinCode.trim()) {
      alert("Trip code required");
      return;
    }

    try {
      await API.post("/trips/join", {
        tripCode: joinCode.trim()
      });

      setJoinCode("");
      fetchTrips();
    } catch (err) {
      alert(err.response?.data?.message || "Join trip failed");
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-wrapper">

        {/* HEADER */}
        <div className="dashboard-header">
          <h2>Dashboard</h2>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>

        {/* CREATE / JOIN */}
        <div className="dashboard-top">

          {/* CREATE TRIP */}
          <div className="card form-card">
            <h3>Create Trip</h3>
            <input
              placeholder="Trip Name"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
            />
            <input
              placeholder="Currency (INR, USD...)"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
            <button type="button" onClick={createTrip}>
              Create Trip
            </button>
          </div>

          {/* JOIN TRIP */}
          <div className="card form-card">
            <h3>Join Trip</h3>
            <input
              placeholder="Enter Trip Code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button type="button" onClick={joinTrip}>
              Join Trip
            </button>
          </div>

        </div>

        {/* TRIPS LIST */}
        <div className="trips-section">
          <h3>Your Trips</h3>

          {trips.length === 0 ? (
            <p>No trips yet</p>
          ) : (
            <div className="trips-grid">
              {trips.map((trip) => (
                <div
                  key={trip._id}
                  className="trip-card"
                  onClick={() => navigate(`/trip/${trip._id}`)}
                >
                  <h4>{trip.name}</h4>
                  <p className="trip-meta">
                    Currency: {trip.currency}
                  </p>
                  <p className="trip-meta">
                    Code: {trip.tripCode}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default Dashboard;
