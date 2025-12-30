import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";
import "../styles/tripDetails.css";

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState([]);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [customSplits, setCustomSplits] = useState({});

  // ---------- FETCH ----------
  const fetchTrip = async () => {
    const res = await API.get(`/trips/${tripId}`);
    setTrip(res.data);

    // Initialize custom split values to 0
    const init = {};
    res.data.members.forEach((m) => {
      init[m._id] = 0;
    });
    setCustomSplits(init);
  };

  const fetchExpenses = async () => {
    const res = await API.get(`/expenses/${tripId}`);
    setExpenses(res.data);
  };

  const fetchSummary = async () => {
    const res = await API.get(`/expenses/summary/${tripId}`);
    setSummary(res.data.settlements);
  };

  useEffect(() => {
    fetchTrip();
    fetchExpenses();
    fetchSummary();
  }, []);

  // ---------- HANDLERS ----------
  const handleCustomSplitChange = (userId, value) => {
    setCustomSplits({
      ...customSplits,
      [userId]: Number(value)
    });
  };

  const resetForm = () => {
    setTitle("");
    setAmount("");
    setPaidBy("");
    setSplitType("equal");

    const resetSplits = {};
    trip.members.forEach((m) => {
      resetSplits[m._id] = 0;
    });
    setCustomSplits(resetSplits);
  };

  const addExpense = async () => {
    if (!title || !amount || !paidBy) {
      alert("All fields are required");
      return;
    }

    let payload = {
      title,
      totalAmount: Number(amount),
      paidBy,
      splitType
    };

    if (splitType === "custom") {
      const splits = Object.keys(customSplits)
        .filter((uid) => customSplits[uid] > 0)
        .map((uid) => ({
          userId: uid,
          amount: customSplits[uid]
        }));

      const total = splits.reduce((sum, s) => sum + s.amount, 0);

      if (total !== Number(amount)) {
        alert("Custom split total must equal total amount");
        return;
      }

      payload.splits = splits;
    }

    await API.post(`/expenses/${tripId}`, payload);

    resetForm();
    fetchExpenses();
    fetchSummary();
  };

  if (!trip) return <p>Loading...</p>;

  return (
    <div className="trip-page">
      <div className="trip-wrapper">

        {/* HEADER */}
        <div className="trip-header">
          <div>
            <h2>{trip.name}</h2>
            <p>Currency: {trip.currency}</p>
          </div>
          <button type="button" onClick={() => navigate("/dashboard")}>
            Back
          </button>
        </div>

        {/* GRID */}
        <div className="trip-grid">

          {/* MEMBERS */}
          <div className="card">
            <h3>Members</h3>
            <ul className="member-list">
              {trip.members.map((m) => (
                <li key={m._id}>{m.name}</li>
              ))}
            </ul>
          </div>

          {/* ADD EXPENSE */}
          <div className="card">
            <h3>Add Expense</h3>

            <div className="expense-form">
              <input
                placeholder="Expense title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />

              <select
                value={paidBy}
                onChange={(e) => setPaidBy(e.target.value)}
              >
                <option value="">Paid By</option>
                {trip.members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>

              {/* SPLIT TYPE */}
              <div className="split-options">
                <label>
                  <input
                    type="radio"
                    checked={splitType === "equal"}
                    onChange={() => setSplitType("equal")}
                  />
                  Equal Split
                </label>

                <label>
                  <input
                    type="radio"
                    checked={splitType === "custom"}
                    onChange={() => setSplitType("custom")}
                  />
                  Custom Split
                </label>
              </div>

              {/* CUSTOM SPLIT */}
              {splitType === "custom" && (
                <div className="custom-split-box">
                  {trip.members.map((m) => (
                    <div className="custom-split-row" key={m._id}>
                      <span>{m.name}</span>
                      <input
                        type="number"
                        value={customSplits[m._id]}
                        onChange={(e) =>
                          handleCustomSplitChange(m._id, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}

              <button type="button" onClick={addExpense}>
                Add Expense
              </button>
            </div>
          </div>

          {/* EXPENSES */}
          <div className="card">
            <h3>Expenses</h3>
            {expenses.map((e) => (
              <div className="expense-item" key={e._id}>
                <span>{e.title}</span>
                <strong>
                  {trip.currency} {e.totalAmount}
                </strong>
              </div>
            ))}
          </div>

          {/* SUMMARY */}
          <div className="card">
            <h3>Summary</h3>
            {summary.length === 0 ? (
              <p>All settled 🎉</p>
            ) : (
              summary.map((s, i) => (
                <div className="summary-item" key={i}>
                  {s.from} pays {s.to} {trip.currency} {s.amount}
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default TripDetails;
