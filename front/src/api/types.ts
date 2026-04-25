export type Usuario = {
  idUsuario: number
  nombre: string
  apellido: string
  tipoUsuario: string
  telefono: string
  correo: string
  ubicacion: string
}

export type Producto = {
  idProducto: number
  nombreProducto: string
  descripcion: string
  unidadMedida: string
}

export type Inventario = {
  idInventario: number
  usuario: Usuario
  producto: Producto
  cantidadDisponible: number
  fechaRegistro: string
}

export type Transaccion = {
  idTransaccion: number
  producto: Producto
  vendedor: Usuario
  comprador: Usuario
  cantidad: number
  precio: number
  fecha: string
}
