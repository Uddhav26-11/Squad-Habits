require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const passport = require("./config/passport");

const app = express();

app.use(cors());
app.use(express.json());

app.use(passport.initialize());

app.use("/auth", require("./routes/authRoutes"));
app.use("/squad", require("./routes/squadRoutes"));
app.use("/habit", require("./routes/habitRoutes"));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongo Connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
    res.json({
        message: "Squad Habits API"
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on ${process.env.PORT}`);
});