import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);

  // Add expense states
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");

  // Fetch trip details
  const fetchTripDetails = async () => {
    try {
      const response = await API.get(`/trips/${tripId}`);
      setTrip(response.data);
    } catch (error) {
      alert("Error loading trip");
      navigate("/dashboard");
    }
  };

  // Fetch expenses
  const fetchExpenses = async () => {
    try {
      const response = await API.get(`/expenses/${tripId}`);
      setExpenses(response.data);
    } catch (error) {
      console.log("Error fetching expenses");
    }
  };

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const response = await API.get(`/expenses/summary/${tripId}`);
      setSummary(response.data.settlements);
    } catch (error) {
      console.log("Error fetching summary");
    }
  };

  useEffect(() => {
    fetchTripDetails();
    fetchExpenses();
    fetchSummary();
  }, []);

  // Add expense (EQUAL SPLIT)
  const addExpense = async () => {
    if (!title || !amount || !paidBy) {
      alert("All fields are required");
      return;
    }

    try {
      await API.post(`/expenses/${tripId}`, {
        title,
        totalAmount: Number(amount),
        paidBy,
        splitType: "equal"
      });

      setTitle("");
      setAmount("");
      setPaidBy("");

      fetchExpenses();
      fetchSummary();
    } catch (error) {
      alert("Error adding expense");
    }
  };

  if (!trip) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <button onClick={() => navigate("/dashboard")}>Back</button>

      <h2>{trip.name}</h2>
      <p>Currency: {trip.currency}</p>
      <p>Trip Code: {trip.tripCode}</p>

      <hr />

      <h3>Members</h3>
      <ul>
        {trip.members.map((m) => (
          <li key={m._id}>{m.name}</li>
        ))}
      </ul>

      <hr />

      {/* ADD EXPENSE SECTION */}
      <h3>Add Expense (Equal Split)</h3>

      <input
        type="text"
        placeholder="Expense Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <br /><br />

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br /><br />

      <select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
        <option value="">Paid By</option>
        {trip.members.map((m) => (
          <option key={m._id} value={m._id}>
            {m.name}
          </option>
        ))}
      </select>

      <br /><br />

      <button onClick={addExpense}>Add Expense</button>

      <hr />

      <h3>Expenses</h3>
      {expenses.length === 0 ? (
        <p>No expenses yet</p>
      ) : (
        <ul>
          {expenses.map((exp) => (
            <li key={exp._id}>
              {exp.title} – {trip.currency} {exp.totalAmount}
            </li>
          ))}
        </ul>
      )}

      <hr />

      <h3>Summary</h3>
      {summary.length === 0 ? (
        <p>All settled 🎉</p>
      ) : (
        <ul>
          {summary.map((s, index) => (
            <li key={index}>
              {s.from} pays {s.to} {trip.currency} {s.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default TripDetails;
