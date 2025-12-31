const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
//const cors = require("cors");

const app = express();
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://trip-calculator-mern.netlify.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());


const authRoutes = require("./routes/authRoutes");
const expenseRoutes = require("./routes/expenseRoutes");
const tripRoutes = require("./routes/tripRoutes");





//app.use(cors());




mongoose
  .connect("mongodb://localhost:27017/tripcalculator")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

app.use("/api/auth/register", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/trips", tripRoutes);


app.get("/", (req, res) => {
  res.send("Backend is running");
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
