require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname + "/public"));

// =========================
// CONEXIÓN MYSQL
// =========================

const db = mysql.createConnection({
host: process.env.DB_HOST,
user: process.env.DB_USER,
password: process.env.DB_PASSWORD,
database: process.env.DB_NAME
});

db.connect((err) => {

if (err) {
    console.log("Error conectando MySQL ❌");
    console.log(err);
    return;
}

console.log("MySQL conectado ✅");

});

// =========================
// PÁGINAS
// =========================

app.get("/register", (req, res) => {

res.sendFile(__dirname + "/public/register.html");

});

app.get("/login", (req, res) => {

res.sendFile(__dirname + "/public/login.html");

});

// =========================
// REGISTRO
// =========================

app.post("/register", (req, res) => {

const {
    nombre,
    email,
    password
} = req.body;

const sql = "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)";

db.query(
    sql,
    [nombre, email, password],
    (err) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Error al registrar usuario"
            });

        }

        res.json({
            message: "Usuario registrado correctamente 🚀"
        });

    }
);

});

// =========================
// LOGIN
// =========================

app.post("/login", (req, res) => {

const {
    email,
    password
} = req.body;

const sql = "SELECT * FROM usuarios WHERE email = ? AND password = ?";

db.query(
    sql,
    [email, password],
    (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Error en el servidor"
            });

        }

        if (results.length === 0) {

            return res.status(401).json({
                error: "Correo o contraseña incorrectos"
            });

        }

        res.json({
            message: "Login correcto",
            usuario: {
                id: results[0].id,
                nombre: results[0].nombre,
                email: results[0].email
            }
        });

    }
);

});

// =========================
// CARRITO
// =========================

// Obtener carrito del usuario

app.get("/carrito/:usuario_id", (req, res) => {

const usuario_id = req.params.usuario_id;

const sql = "SELECT * FROM carrito WHERE usuario_id = ?";

db.query(
    sql,
    [usuario_id],
    (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Error obteniendo el carrito"
            });

        }

        res.json(results);

    }
);

});

// =========================
// AGREGAR AL CARRITO
// =========================

app.post("/carrito", (req, res) => {

const {
    usuario_id,
    producto_id,
    nombre,
    precio
} = req.body;

const sql = "SELECT * FROM carrito WHERE usuario_id = ? AND producto_id = ?";

db.query(
    sql,
    [usuario_id, producto_id],
    (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Error comprobando el carrito"
            });

        }


        // Si el producto ya está en el carrito

        if (results.length > 0) {

            const nuevoTotal =
                results[0].cantidad + 1;

            const updateSql =
                "UPDATE carrito SET cantidad = ? WHERE id = ?";

            db.query(
                updateSql,
                [nuevoTotal, results[0].id],
                (err) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            error: "Error actualizando el carrito"
                        });

                    }

                    res.json({
                        message: "Cantidad actualizada"
                    });

                }
            );

            return;

        }


        // Si el producto no existe en el carrito

        const insertSql =
            "INSERT INTO carrito (usuario_id, producto_id, nombre, precio, cantidad) VALUES (?, ?, ?, ?, 1)";

        db.query(
            insertSql,
            [
                usuario_id,
                producto_id,
                nombre,
                precio
            ],
            (err) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        error: "Error agregando al carrito"
                    });

                }

                res.json({
                    message: "Producto agregado al carrito"
                });

            }
        );

    }
);

});

// =========================
// ELIMINAR DEL CARRITO
// =========================

app.delete("/carrito/:id", (req, res) => {

const id = req.params.id;

const sql =
    "DELETE FROM carrito WHERE id = ?";

db.query(
    sql,
    [id],
    (err) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Error eliminando producto"
            });

        }

        res.json({
            message: "Producto eliminado"
        });

    }
);

});

// =========================
// VACIAR CARRITO
// =========================

app.delete("/carrito/usuario/:usuario_id", (req, res) => {

const usuario_id =
    req.params.usuario_id;

const sql =
    "DELETE FROM carrito WHERE usuario_id = ?";

db.query(
    sql,
    [usuario_id],
    (err) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Error vaciando carrito"
            });

        }

        res.json({
            message: "Carrito vacío"
        });

    }
);

});
// =========================
// CUENTA
// =========================

// Obtener datos de cuenta

app.get("/cuenta/:usuario_id", (req, res) => {

const usuario_id = req.params.usuario_id;

const datos = {};


// DATOS PERSONALES

db.query(
    "SELECT telefono FROM datos_cuenta WHERE usuario_id = ?",
    [usuario_id],
    (err, resultados) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Error obteniendo datos personales"
            });

        }

        datos.telefono =
            resultados.length > 0
                ? resultados[0].telefono
                : "";


// DIRECCIÓN

        db.query(
            "SELECT direccion, ciudad, provincia, codigo_postal FROM direcciones WHERE usuario_id = ?",
            [usuario_id],
            (err, resultados) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        error: "Error obteniendo dirección"
                    });

                }

                datos.direccion =
                    resultados.length > 0
                        ? resultados[0]
                        : {};


// MÉTODO DE PAGO

                db.query(
                    "SELECT tipo, titular, numero_tarjeta, vencimiento, cvv FROM metodos_pago WHERE usuario_id = ?",
                    [usuario_id],
                    (err, resultados) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                error: "Error obteniendo método de pago"
                            });

                        }

                        datos.pago =
                            resultados.length > 0
                                ? resultados[0]
                                : {};

                        res.json(datos);

                    }
                );

            }
        );

    }
);

});


// =========================
// GUARDAR DATOS DE CUENTA
// =========================

app.post("/cuenta", (req, res) => {

const {
    usuario_id,
    telefono,

    direccion,
    ciudad,
    provincia,
    codigo_postal,

    tipo,
    titular,
    numero_tarjeta,
    vencimiento,
    cvv

} = req.body;


// DATOS PERSONALES

db.query(
    "SELECT id FROM datos_cuenta WHERE usuario_id = ?",
    [usuario_id],
    (err, resultados) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Error comprobando datos de cuenta"
            });

        }


        if (resultados.length > 0) {

            db.query(
                "UPDATE datos_cuenta SET telefono = ? WHERE usuario_id = ?",
                [telefono, usuario_id]
            );

        }
        else {

            db.query(
                "INSERT INTO datos_cuenta (usuario_id, telefono) VALUES (?, ?)",
                [usuario_id, telefono]
            );

        }


// DIRECCIÓN

        db.query(
            "SELECT id FROM direcciones WHERE usuario_id = ?",
            [usuario_id],
            (err, resultados) => {

                if (err) {

                    console.log(err);

                    return res.status(500).json({
                        error: "Error comprobando dirección"
                    });

                }


                if (resultados.length > 0) {

                    db.query(
                        `UPDATE direcciones
                         SET direccion = ?, ciudad = ?, provincia = ?, codigo_postal = ?
                         WHERE usuario_id = ?`,
                        [
                            direccion,
                            ciudad,
                            provincia,
                            codigo_postal,
                            usuario_id
                        ]
                    );

                }
                else {

                    db.query(
                        `INSERT INTO direcciones
                         (usuario_id, direccion, ciudad, provincia, codigo_postal)
                         VALUES (?, ?, ?, ?, ?)`,
                        [
                            usuario_id,
                            direccion,
                            ciudad,
                            provincia,
                            codigo_postal
                        ]
                    );

                }


// MÉTODO DE PAGO

                db.query(
                    "SELECT id FROM metodos_pago WHERE usuario_id = ?",
                    [usuario_id],
                    (err, resultados) => {

                        if (err) {

                            console.log(err);

                            return res.status(500).json({
                                error: "Error comprobando método de pago"
                            });

                        }


                        if (resultados.length > 0) {

                            db.query(
                                `UPDATE metodos_pago
                                 SET tipo = ?, titular = ?, numero_tarjeta = ?, vencimiento = ?, cvv = ?
                                 WHERE usuario_id = ?`,
                                [
                                    tipo,
                                    titular,
                                    numero_tarjeta,
                                    vencimiento,
                                    cvv,
                                    usuario_id
                                ]
                            );

                        }
                        else {

                            db.query(
                                `INSERT INTO metodos_pago
                                 (usuario_id, tipo, titular, numero_tarjeta, vencimiento, cvv)
                                 VALUES (?, ?, ?, ?, ?, ?)`,
                                [
                                    usuario_id,
                                    tipo,
                                    titular,
                                    numero_tarjeta,
                                    vencimiento,
                                    cvv
                                ]
                            );

                        }


                        res.json({
                            message: "Datos guardados correctamente"
                        });

                    }
                );

            }
        );

    }
);

});

// =========================
// SERVIDOR
// =========================

app.listen(3000, () => {

    console.log(
        "Servidor corriendo en puerto 3000 🚀"
    );

});
