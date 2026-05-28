export type CompromisoSemana = {
  id: string
  servicio: string
  plantilla: number
  vacantes: number
  puesto: string
  fecha: string
  fechaLabel: string
  mes: string
  contrataciones: number
  cumplimiento: number
  comentarios: string
  altasNombres: string[]
  bajasNombres: string[]
  altas: number
  bajas: number
}

/** Semana o mes agregado para gráfica y KPIs */
export type CompromisoPeriodo = {
  id: string
  label: string
  tipo: 'semana' | 'mes'
  plantilla: number
  vacantes: number
  puesto: string
  contrataciones: number
  cumplimiento: number
  altas: number
  bajas: number
  altasNombres: string[]
  bajasNombres: string[]
  semanas: CompromisoSemana[]
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
  semana: string
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
