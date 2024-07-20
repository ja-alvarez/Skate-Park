CREATE TABLE participantes (
    id SERIAL PRIMARY KEY,
    foto VARCHAR(100) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(125) NOT NULL UNIQUE,
    password VARCHAR(30) NOT NULL,
    experiencia smallint NOT NULL,
    especialidad VARCHAR(25),
    estado VARCHAR(15) NOT NULL DEFAULT 'En revisión',
    admin BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO participantes (foto, nombre, email, password, experiencia, estado, admin ) VALUES 
('avatars/IMG_Andres_240720-030828.jpeg', 'Andrés', 'andres@gmail.com', 'admin', 0, 'Aprobado', true);

SELECT * FROM participantes;

