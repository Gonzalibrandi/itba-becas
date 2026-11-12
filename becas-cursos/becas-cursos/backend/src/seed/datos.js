// Datos de ejemplo. Instituciones y programas ficticios.
// Las fechas de cierre se calculan desde hoy para que siempre estén vigentes.
function enDias(dias) {
  const fecha = new Date();
  fecha.setUTCHours(0, 0, 0, 0);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha;
}

module.exports = () => [
  {
    tipo: 'beca',
    titulo: 'Beca de Excelencia Académica',
    descripcion:
      'Cubre el 100% de la matrícula durante toda la carrera para estudiantes de primer año con promedio destacado en el secundario. Incluye acompañamiento de un tutor durante el primer cuatrimestre.',
    institucion: 'Universidad Ficticia del Sur',
    categorias: ['grado', 'excelencia'],
    fechaCierre: enDias(45),
    enlace: 'https://example.com/becas/excelencia',
    detalles: {
      requisitos: ['Promedio general de 8 o más', 'Ingresar a primer año', 'Carta de motivación'],
    },
  },
  {
    tipo: 'beca',
    titulo: 'Beca de Conectividad',
    descripcion:
      'Ayuda económica mensual para cubrir internet y equipamiento a estudiantes que cursan materias virtuales. Se renueva cada cuatrimestre según el avance académico.',
    institucion: 'Fundación Horizonte',
    categorias: ['ayuda económica', 'tecnología'],
    fechaCierre: enDias(20),
    detalles: {
      monto: 45000,
      requisitos: ['Ser alumno regular', 'Cursar al menos 2 materias virtuales', 'Constancia de ingresos del grupo familiar'],
    },
  },
  {
    tipo: 'beca',
    titulo: 'Beca para Mujeres en Ingeniería',
    descripcion:
      'Programa que financia el material de estudio y ofrece mentorías con profesionales de la industria para estudiantes de carreras de ingeniería.',
    institucion: 'Instituto Tecnológico Austral (ficticio)',
    categorias: ['ingeniería', 'grado', 'diversidad'],
    fechaCierre: enDias(60),
    detalles: {
      monto: 120000,
      requisitos: ['Estudiante de ingeniería', 'Tener al menos 5 materias aprobadas'],
    },
  },
  {
    tipo: 'beca',
    titulo: 'Beca de Investigación de Verano',
    descripcion:
      'Estancia de dos meses en un laboratorio de la universidad participando de un proyecto de investigación. Incluye un estipendio mensual.',
    institucion: 'Universidad Ficticia del Sur',
    categorias: ['investigación', 'posgrado'],
    fechaCierre: enDias(10),
    detalles: {
      monto: 200000,
      requisitos: ['Haber aprobado el 60% de la carrera', 'Aval de un docente'],
    },
    publicado: false,
  },
  {
    tipo: 'curso',
    titulo: 'Introducción a la Programación con JavaScript',
    descripcion:
      'Curso desde cero: variables, funciones, arreglos, objetos y manipulación del DOM. Al final se arma un proyecto web completo.',
    institucion: 'Academia Código Abierto',
    categorias: ['programación', 'tecnología'],
    fechaCierre: enDias(30),
    enlace: 'https://example.com/cursos/javascript',
    detalles: { modalidad: 'virtual', duracion: '8 semanas' },
  },
  {
    tipo: 'curso',
    titulo: 'Bases de Datos NoSQL con MongoDB',
    descripcion:
      'Modelado de documentos, consultas, índices y agregaciones. Incluye prácticas con Mongoose sobre una API de Node.js.',
    institucion: 'Academia Código Abierto',
    categorias: ['programación', 'bases de datos'],
    fechaCierre: enDias(25),
    detalles: { modalidad: 'hibrida', duracion: '6 semanas' },
  },
  {
    tipo: 'curso',
    titulo: 'Inglés Técnico para Informática',
    descripcion:
      'Lectura y comprensión de documentación técnica, vocabulario específico y redacción de correos profesionales.',
    institucion: 'Centro de Idiomas Delta (ficticio)',
    categorias: ['idiomas'],
    fechaCierre: enDias(15),
    detalles: { modalidad: 'presencial', duracion: '1 cuatrimestre' },
  },
  {
    tipo: 'curso',
    titulo: 'Diseño de Interfaces y Experiencia de Usuario',
    descripcion:
      'Principios de diseño, prototipado y pruebas con usuarios. Se trabaja sobre casos reales de aplicaciones web y móviles.',
    institucion: 'Fundación Horizonte',
    categorias: ['diseño', 'tecnología'],
    detalles: { modalidad: 'virtual', duracion: '10 semanas' },
  },
];
