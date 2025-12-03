const express = require("express");
const dbConnect = require("../src/config/db");
const routes = require("../src/routes/routes");
const http = require("http")

const app = express();
dbConnect();

app.use(express.json());   
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.send("Hello, there!!")
});

app.use("/", routes);

const server = http.createServer(app);
server.listen(3000, () => {
    console.log("okay, server is running!!")
})

