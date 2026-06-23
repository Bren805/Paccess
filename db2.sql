CREATE DATABASE RegistroEventosDeportivos;
USE RegistroEventosDeportivos;
CREATE TABLE EventoDeportivo (
    id_evento INT PRIMARY KEY,
    nombre_evento VARCHAR(100),
    fecha DATE,
    lugar VARCHAR(100),
    tipo_deporte VARCHAR(50)
);

CREATE TABLE Equipo (
    id_equipo INT PRIMARY KEY,
    nombre_equipo VARCHAR(100),
    ciudad VARCHAR(100),
    pais VARCHAR(50)
);

CREATE TABLE Jugador (
    id_jugador INT PRIMARY KEY,
    nombre VARCHAR(50),
    apellido VARCHAR(50),
    fecha_nacimiento DATE,
    posicion VARCHAR(30),
    id_equipo INT,
    FOREIGN KEY (id_equipo) REFERENCES Equipo(id_equipo)
);

CREATE TABLE Partido (
    id_partido INT PRIMARY KEY,
    id_evento INT,
    fecha DATE,
    hora TIME,
    id_equipo_local INT,
    id_equipo_visitante INT,
    FOREIGN KEY (id_evento) REFERENCES EventoDeportivo(id_evento),
    FOREIGN KEY (id_equipo_local) REFERENCES Equipo(id_equipo),
    FOREIGN KEY (id_equipo_visitante) REFERENCES Equipo(id_equipo)
);

CREATE TABLE Resultado (
    id_resultado INT PRIMARY KEY,
    id_partido INT,
    goles_local INT,
    goles_visitante INT,
    ganador VARCHAR(100),
    FOREIGN KEY (id_partido) REFERENCES Partido(id_partido)
);

CREATE TABLE EstadisticaJugador (
    id_estadistica INT PRIMARY KEY,
    id_jugador INT,
    id_partido INT,
    minutos_jugados INT,
    goles INT,
    asistencias INT,
    tarjetas VARCHAR(20),
    FOREIGN KEY (id_jugador) REFERENCES Jugador(id_jugador),
    FOREIGN KEY (id_partido) REFERENCES Partido(id_partido)
);




