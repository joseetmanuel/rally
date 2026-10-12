/**
 * Bases del Rally 2026 de certificaciones, para la página pública "Bases".
 *
 * Es el contenido de las bases (PDF "Participa en el rally de certificaciones") con dos omisiones a propósito:
 * el punto 15 (nombra a la empresa) y la dirección de correo del reembolso. Esta aplicación no debe llevar
 * referencias a la empresa ni correos internos. Los puntos de la tabla coinciden con el catálogo de tipos de
 * certificación (certification_types) del backend.
 */
export interface BasesRow {
  type: string;
  detail: string;
  /** Puntos por tipo: certificación, curso (expositor), bono alumno, bono expositor */
  certification: number;
  course: number;
  student: number;
  instructor: number;
}

export const BASES_TABLE: BasesRow[] = [
  { type: 'Fundacional', detail: '5 a 10 horas de estudio', certification: 10, course: 5, student: 2, instructor: 1 },
  { type: 'Profesional', detail: '15 a 30 horas de estudio', certification: 30, course: 15, student: 6, instructor: 3 },
  { type: 'Experto', detail: '60 a 70 horas de estudio', certification: 60, course: 30, student: 12, instructor: 6 },
  { type: 'Opcional', detail: '70 horas de estudio', certification: 70, course: 35, student: 14, instructor: 7 }
];

export interface BasesSection {
  id: string;
  title: string;
  icon: string;
  /** [número de la base, texto] */
  items: [number, string][];
}

export const BASES_SECTIONS: BasesSection[] = [
  {
    id: 'participacion',
    title: 'De la participación',
    icon: 'groups',
    items: [
      [1, 'Pueden participar todos los colaboradores pertenecientes a la gerencia de reingeniería de software, incluyendo equipos extendidos, y también colaboradores que trabajen en proyectos “cross”.'],
      [2, 'Sólo contarán las certificaciones obtenidas por los colaboradores de la gerencia de reingeniería de software a partir del primero de enero de 2026.'],
      [3, 'Sólo contarán las certificaciones publicadas en la lámina del rally.']
    ]
  },
  {
    id: 'puntaje',
    title: 'Mecánica de puntuaje',
    icon: 'calculate',
    items: [
      [4, 'Cada certificación tendrá su propio tipo de certificación, expresado en la lámina del rally.'],
      [5, 'Cada tipo de certificación obtenida tendrá su puntaje de acuerdo con la tabla de puntos.'],
      [6, 'Quien haya obtenido una certificación puede dar un curso presencial, abierto a toda la dirección de TI, de dicha certificación. Esa persona será nombrada “Expositor” y se hará acreedora a puntos extra de acuerdo con la tabla de puntos.'],
      [7, 'Las personas que participen en este rally y se inscriban a un curso presencial dado por un Expositor que también participe en este rally se llamarán “Alumno”.'],
      [8, 'Si un Alumno obtiene la certificación a la que se inscribió en el curso dado por el Expositor, ganarán adicionalmente tanto el Alumno como el Expositor puntos extra de acuerdo con la tabla de puntos.']
    ]
  },
  {
    id: 'premiacion',
    title: 'De la premiación',
    icon: 'emoji_events',
    items: [
      [9, 'El corte de los puntos será el 15 de diciembre de 2026.'],
      [10, 'El rally tendrá primero, segundo y tercer lugar de acuerdo con los puntos obtenidos; puede haber empate en cada uno de estos lugares.'],
      [11, 'Los premios para 1.º, 2.º y 3.er lugar serán anunciados la primera semana de diciembre de 2026 y entregados a más tardar el 20 de diciembre de 2026.'],
      [12, 'A todas las personas que obtengan una certificación y la paguen con recursos propios se les reembolsará el costo de dicha certificación, siempre y cuando envíen por correo electrónico a la persona organizadora del rally: el correo que acredite su certificación y el correo que acredite el pago por dicha certificación. El reembolso se hará a la quincena siguiente.'],
      [13, 'No se reembolsarán costos de vouchers otorgados por Google, Microsoft, AWS, Azure y/o Python Institute, ni cualquier otro descuento obtenido por cualquier otra empresa.'],
      [14, 'A todos los participantes que obtengan una certificación se les entregarán stickers de la certificación obtenida: físicos, para pegarlos en sus máquinas, y digitales, para agregarlos a sus firmas (sólo equipos extendidos).']
    ]
  }
];

/** Tipos de certificación en el orden de las bases, con su nombre para mostrar */
export const CERTIFICATION_TYPES: { code: string; label: string }[] = [
  { code: 'FUNDACIONAL', label: 'Fundacional' },
  { code: 'PROFESIONAL', label: 'Profesional' },
  { code: 'EXPERTO', label: 'Experto' },
  { code: 'OPCIONAL', label: 'Opcional' }
];

/** Proveedor del catálogo -> ruta del rally, en el orden de las rutas de la lámina */
export const ROUTE_BY_VENDOR: Record<string, string> = {
  'Python Institute': 'Python',
  'AWS': 'AWS',
  'Microsoft': 'Azure',
  'Google Cloud': 'GCP'
};
export const ROUTE_ORDER = ['Python', 'AWS', 'Azure', 'GCP'];

export interface StudyResource {
  route: string;
  url: string;
}

export const STUDY_RESOURCES: StudyResource[] = [
  { route: 'Python', url: 'https://pythoninstitute.org/pcep' },
  { route: 'AWS', url: 'https://aws.amazon.com/es/training/' },
  { route: 'Azure', url: 'https://learn.microsoft.com/es-es/credentials/certifications/azure-fundamentals/' },
  { route: 'GCP', url: 'https://www.skills.google/' }
];
