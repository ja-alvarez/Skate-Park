CREATE TABLE participantes (
    id SERIAL PRIMARY KEY,
    foto VARCHAR(100) DEFAULT 'sin_foto.jpeg',
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(125) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    experiencia smallint NOT NULL, -- DEFAULT 0 CHECK (experiencia >=0)
    especialidad VARCHAR(25),
    estado VARCHAR(15) NOT NULL DEFAULT 'En revisión', -- bolean* DEFAULT false 
    admin BOOLEAN NOT NULL DEFAULT false
);

INSERT INTO participantes (foto, nombre, email, password, experiencia, estado, admin ) VALUES 
('avatars/IMG_Andres_240720-030828.jpeg', 'Andrés', 'andres@gmail.com', 'admin', 0, 'Aprobado', true);

SELECT * FROM participantes;

