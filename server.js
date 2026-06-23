require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234",
    database: "paccess"
});

db.connect((err) => {

    if (err) {
        console.log("Error conectando MySQL ❌");
        console.log(err);
        return;
    }

    console.log("MySQL conectado ✅");

});
app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/public/register.html");
});

app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/public/login.html");
});
app.listen(3000, () => {
    console.log("Servidor corriendo en puerto 3000 🚀");
});
app.post("/register", (req, res) => {

    const { nombre, email, password } = req.body;

    const sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";

    db.query(sql, [nombre, email, password], (err) => {

        if(err){
            return res.status(500).json({
                error:"Error al registrar usuario"
            });
        }

        res.json({
            message:"Usuario registrado correctamente 🚀"
        });

    });

});