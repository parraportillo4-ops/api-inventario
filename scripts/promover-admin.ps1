param(
    [Parameter(Mandatory = $true, HelpMessage = "Correo del usuario a promover")]
    [string]$Correo
)

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$dbPath = Join-Path $projectRoot "inventario.db"

if (-not (Test-Path $dbPath)) {
    Write-Error "No se encontró la base de datos en: $dbPath`nLevanta la API al menos una vez para crear inventario.db."
}

$escapedCorreo = $Correo.Replace("'", "''")
$sql = @"
UPDATE usuarios SET tipo_usuario = 'ADMIN' WHERE correo = '$escapedCorreo';
SELECT id_usuario, nombre, apellido, correo, tipo_usuario FROM usuarios WHERE correo = '$escapedCorreo';
"@

$sqlite3 = Get-Command sqlite3 -ErrorAction SilentlyContinue

if ($sqlite3) {
    Write-Host "Promoviendo a admin: $Correo"
    $result = $sql | & sqlite3 $dbPath
    if (-not $result) {
        Write-Error "No existe un usuario con correo '$Correo'."
    }
    Write-Host "Listo. Usuario actualizado:"
    Write-Host $result
    Write-Host "`nEl usuario debe cerrar sesión y volver a entrar para ver el rol de administrador."
    exit 0
}

Write-Host "sqlite3 no está instalado en el PATH." -ForegroundColor Yellow
Write-Host ""
Write-Host "Opción A — ejecuta este SQL en DB Browser for SQLite o en la consola sqlite3:"
Write-Host ""
Write-Host "  UPDATE usuarios SET tipo_usuario = 'ADMIN' WHERE correo = '$Correo';"
Write-Host ""
Write-Host "Opción B — instala sqlite3 y vuelve a correr:"
Write-Host "  .\scripts\promover-admin.ps1 -Correo '$Correo'"
Write-Host ""
Write-Host "Base de datos: $dbPath"
exit 1
