#!/usr/bin/env bash
# Promueve un usuario existente a administrador por correo.
# Uso: ./scripts/promover-admin.sh usuario@ejemplo.com

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Uso: $0 <correo>"
  exit 1
fi

CORREO="$1"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB="$ROOT/inventario.db"

if [ ! -f "$DB" ]; then
  echo "No se encontró la base de datos en: $DB"
  echo "Levanta la API al menos una vez para crear inventario.db."
  exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 no está instalado."
  echo "Ejecuta manualmente:"
  echo "  UPDATE usuarios SET tipo_usuario = 'ADMIN' WHERE correo = '$CORREO';"
  exit 1
fi

echo "Promoviendo a admin: $CORREO"
RESULT="$(sqlite3 "$DB" "UPDATE usuarios SET tipo_usuario = 'ADMIN' WHERE correo = '$CORREO'; SELECT changes();")"

if [ "$RESULT" = "0" ]; then
  echo "No existe un usuario con correo '$CORREO'."
  exit 1
fi

sqlite3 -header -column "$DB" \
  "SELECT id_usuario, nombre, apellido, correo, tipo_usuario FROM usuarios WHERE correo = '$CORREO';"

echo ""
echo "Listo. El usuario debe cerrar sesión y volver a entrar para ver el rol de administrador."
