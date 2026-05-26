export type CompromisoSemana = {
  id: string
  servicio: string
  plantilla: number
  vacantes: number
  puesto: string
  fecha: string
  fechaLabel: string
  contrataciones: number
  cumplimiento: number
  comentarios: string
  altasNombres: string[]
  bajasNombres: string[]
  altas: number
  bajas: number
}

export type BajaRegistro = {
  id: string
  noEmpleado: number
  nombre: string
  posicion: string
  ingreso: string
  fechaBaja: string
  mesBaja: string
  motivo: string
  motivoCategoria: string
}

export type AusentismoRegistro = {
  id: string
  fecha: string
  mes: string
  turno: string
  nombre: string
  asunto: string
  comentarios: string
  descripcion: string
  compromiso: string
  cierre: string
  encargado: string
  motivoCategoria: string
}

export type RrhhDataset = {
  compromisos: CompromisoSemana[]
  bajas: BajaRegistro[]
  ausentismos: AusentismoRegistro[]
}
