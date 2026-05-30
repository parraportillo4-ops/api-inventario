-- Promueve un usuario existente a administrador por correo.
-- Reemplaza el correo de ejemplo antes de ejecutar.

UPDATE usuarios
SET tipo_usuario = 'ADMIN'
WHERE correo = 'usuario@ejemplo.com';

-- Verifica el cambio:
SELECT id_usuario, nombre, apellido, correo, tipo_usuario
FROM usuarios
WHERE correo = 'usuario@ejemplo.com';
