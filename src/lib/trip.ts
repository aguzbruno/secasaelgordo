import type { Expense } from "./types";

/**
 * Contenido editable de la despedida. Los horarios y lugares marcados con
 * `tbc` ("a confirmar") son tentativos: reemplazalos cuando estén cerrados.
 */

export const TRIP = {
  groom: "El Gordo",
  place: "Mendoza, Argentina",
  start: "2026-11-04",
  end: "2026-11-08",
  /** Argentina no tiene horario de verano: UTC-3 todo el año. */
  utcOffsetHours: -3,
};

/** Lista cerrada de participantes: no se puede escribir un nombre libre. */
export const ROSTER: { id: string; name: string; loginLabel?: string }[] = [
  { id: "agus", name: "Agus" },
  { id: "marcos", name: "Marcos" },
  { id: "gero", name: "Gero" },
  { id: "grego", name: "Grego" },
  { id: "manu", name: "Manu" },
  { id: "mena", name: "Mena" },
  { id: "fran", name: "Fran" },
  { id: "feli", name: "Feli" },
  { id: "gordo", name: "El Gordo", loginLabel: "Soy el Gordo" },
];

const SHIRT_CENTS = 14_500_00;

/**
 * Gastos que ya existen desde el arranque (viven en el código, no en la base,
 * y no se pueden borrar desde la app). Su id empieza con `seed-`.
 */
export const SEED_EXPENSES: Expense[] = [
  {
    id: "seed-remeras",
    description: "Remeras (la del Gordo entre todos)",
    // Una remera por cada integrante de la lista, incluido el Gordo.
    amountCents: SHIRT_CENTS * 9,
    currency: "ARS",
    payerId: "mena",
    // El Gordo no paga: su remera se reparte entre los otros 8.
    participantIds: ["agus", "marcos", "gero", "grego", "manu", "mena", "fran", "feli"],
    createdById: "mena",
    createdAt: Date.parse("2026-10-24T12:00:00-03:00"),
    kind: "expense",
  },
  {
    id: "seed-quinta-sena",
    description: "Seña de la quinta (30%)",
    amountCents: 240_00,
    currency: "USD",
    payerId: "marcos",
    // El Gordo no paga. El saldo (USD 560) lo paga cada uno al ingresar, no se carga.
    participantIds: ["agus", "marcos", "gero", "grego", "manu", "mena", "fran", "feli"],
    createdById: "marcos",
    createdAt: Date.parse("2026-10-24T12:00:00-03:00"),
    kind: "expense",
  },
  {
    id: "seed-avion-gordo",
    description: "Avión del Gordo (entre todos)",
    amountCents: 131_518_00,
    currency: "ARS",
    payerId: "agus",
    // El Gordo no paga: su pasaje se reparte entre los otros 8.
    participantIds: ["agus", "marcos", "gero", "grego", "manu", "mena", "fran", "feli"],
    createdById: "agus",
    createdAt: Date.parse("2026-10-24T12:00:00-03:00"),
    kind: "expense",
  },
  {
    id: "seed-avion-marcos",
    description: "Avión de Marcos",
    amountCents: 180_518_00,
    currency: "ARS",
    payerId: "agus",
    // Lo pagó Agus por Marcos: Marcos le debe el total.
    participantIds: ["marcos"],
    createdById: "agus",
    createdAt: Date.parse("2026-10-24T12:00:00-03:00"),
    kind: "expense",
  },
  {
    id: "seed-bodega",
    description: "Bardo en la Bodega",
    amountCents: 324_000_00,
    currency: "ARS",
    payerId: "agus",
    // Son 9 con el Gordo, pero su parte la pagan los otros 8.
    participantIds: ["agus", "marcos", "gero", "grego", "manu", "mena", "fran", "feli"],
    createdById: "agus",
    createdAt: Date.parse("2026-10-30T12:00:00-03:00"),
    kind: "expense",
  },
  {
    id: "seed-remis-aeropuerto",
    description: "Remis al aeropuerto (3/11)",
    amountCents: 133_333_33,
    currency: "ARS",
    payerId: "agus",
    // Van 6 (con el Gordo) y el remis son $160.000: 5/6 lo pagan quienes van.
    participantIds: ["agus", "marcos", "grego", "manu", "fran"],
    createdById: "agus",
    createdAt: Date.parse("2026-11-03T12:00:00-03:00"),
    kind: "expense",
  },
  {
    id: "seed-remis-aeropuerto-gordo",
    description: "Remis al aeropuerto (3/11): parte del Gordo",
    amountCents: 26_666_67,
    currency: "ARS",
    payerId: "agus",
    // La parte del Gordo (1/6) la pagan los 8.
    participantIds: ["agus", "marcos", "gero", "grego", "manu", "mena", "fran", "feli"],
    createdById: "agus",
    createdAt: Date.parse("2026-11-03T12:00:00-03:00"),
    kind: "expense",
  },
  {
    id: "seed-rafting",
    description: "Rafting",
    amountCents: 420_000_00,
    currency: "ARS",
    payerId: "agus",
    // Gero no hace rafting; el Gordo no paga (su parte va aparte).
    participantIds: ["agus", "marcos", "grego", "manu", "mena", "fran", "feli"],
    createdById: "agus",
    createdAt: Date.parse("2026-11-03T12:00:00-03:00"),
    kind: "expense",
  },
  {
    id: "seed-rafting-gordo",
    description: "Rafting del Gordo (entre todos)",
    amountCents: 60_000_00,
    currency: "ARS",
    payerId: "agus",
    participantIds: ["agus", "marcos", "gero", "grego", "manu", "mena", "fran", "feli"],
    createdById: "agus",
    createdAt: Date.parse("2026-11-03T12:00:00-03:00"),
    kind: "expense",
  },
];

export type TripEvent = {
  id: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:mm (hora de Mendoza) */
  start: string;
  /** Solo si termina otro día (ej. fiesta que pasa la medianoche). */
  endDate?: string;
  end: string;
  title: string;
  description: string;
  location?: string;
  kind: "viaje" | "comida" | "aventura" | "fiesta" | "base";
  /** Si está, el evento es solo para estas personas (ids de ROSTER). */
  forIds?: string[];
  /** Horario o dato todavía sin confirmar. */
  tbc?: boolean;
  /** Links útiles (mapa, reserva): se muestran en el itinerario y van en la descripción del calendario. */
  links?: { label: string; url: string }[];
};

export const DAYS: { date: string; label: string; theme: string }[] = [
  { date: "2026-11-04", label: "Mié 4", theme: "Llegada y salida al centro" },
  { date: "2026-11-05", label: "Jue 5", theme: "Rafting y Potrerillos" },
  { date: "2026-11-06", label: "Vie 6", theme: "Bardo en la Bodega" },
  { date: "2026-11-07", label: "Sáb 7", theme: "Día libre" },
  { date: "2026-11-08", label: "Dom 8", theme: "Vuelta" },
];

/** Quienes viajan por su cuenta y no en el vuelo grupal. */
const OWN_TRAVEL = ["feli", "gero"];
const FLIGHT_GROUP = ROSTER.map((p) => p.id).filter((id) => !OWN_TRAVEL.includes(id));

export const EVENTS: TripEvent[] = [
  {
    id: "remis-aeropuerto",
    date: "2026-11-04",
    start: "01:50",
    end: "02:20",
    title: "Nos pasa a buscar el auto",
    description:
      "El auto nos pasa a buscar a la 1:50 am para ir al aeropuerto (el vuelo sale 05:13). Es el remis que dividimos entre quienes vamos con el Gordo.",
    location: "Aeropuerto Jorge Newbery (AEP)",
    kind: "viaje",
    forIds: ["agus", "marcos", "grego", "manu", "fran", "gordo"],
  },
  {
    id: "vuelo-ida",
    date: "2026-11-04",
    start: "05:13",
    end: "07:08",
    title: "Vuelo a Mendoza",
    description:
      "JETSMART, vuelo JA3072, directo. Sale de Aeroparque Jorge Newbery (AEP) 05:13 y llega a El Plumerillo, Mendoza (MDZ) 07:08.",
    location: "Aeropuerto Jorge Newbery → El Plumerillo",
    kind: "viaje",
    forIds: FLIGHT_GROUP,
  },
  {
    id: "viaje-feli-ida",
    date: "2026-11-04",
    start: "06:00",
    end: "20:00",
    title: "Viaje en camioneta",
    description: "Viaja a Mendoza en camioneta, por su cuenta. Horario a confirmar.",
    kind: "viaje",
    forIds: ["feli"],
    tbc: true,
  },
  {
    id: "vuelo-gero-ida",
    date: "2026-11-04",
    start: "06:00",
    end: "12:00",
    title: "Vuelo a Mendoza",
    description: "Viaja en otro vuelo. Faltan los datos del vuelo.",
    kind: "viaje",
    forIds: ["gero"],
    tbc: true,
  },
  {
    id: "llegada-quinta",
    date: "2026-11-04",
    start: "15:00",
    end: "16:00",
    title: "Check-in en la quinta",
    description:
      "Mendohaus. Ingreso autónomo con caja de llaves (el código llega el 3/11). Aterrizamos a las 07:08: si queremos entrar antes hay que avisar al anfitrión.",
    location: "Mendohaus, Granaderos 6067, Luján de Cuyo",
    kind: "base",
  },
  {
    id: "salida-centro",
    date: "2026-11-04",
    start: "20:30",
    end: "23:59",
    title: "Salida al centro",
    description: "Vamos al centro a tomar algo en un bar (bar a definir).",
    location: "Centro de Mendoza",
    kind: "fiesta",
    tbc: true,
  },
  {
    id: "rafting",
    date: "2026-11-05",
    start: "12:00",
    end: "15:00",
    title: "Rafting",
    description:
      "Rafting medio día con Potrerillos Explorer, turno de las 12:30. Hay que estar en la base a las 12:00 para el registro, puntual. Dura 2:30 hs en total, con 1 hora en el agua. Dificultad intermedia, apto para todos aunque no tengas experiencia. Fotos gratis y nos dividimos en dos balsas. Llevar: malla o muda de ropa interior para usar debajo del neopreno, calzado que se pueda mojar con cierre atrás (zapatillas, sandalias o crocs; sin ojotas ni descalzo), toalla, protector solar y abrigo, que Potrerillos es más fresco que la ciudad. Si podés, camiseta térmica. Se puede alquilar calzado para agua por $3.000 en efectivo. No se suspende por lluvia.",
    location: "Potrerillos Explorer, Potrerillos, Mendoza",
    kind: "aventura",
    links: [
      { label: "Ubicación", url: "https://www.google.com/maps/search/Potrerillos%20Explorer/@-32.9627,-69.204,17z?hl=es" },
      { label: "Ubicación y reseñas", url: "https://maps.app.goo.gl/V2ypPR5GfdWXhi9g9" },
    ],
  },
  {
    id: "potrerillos",
    date: "2026-11-05",
    start: "15:30",
    end: "19:00",
    title: "Tarde en Potrerillos",
    description:
      "Después del rafting nos quedamos por Potrerillos: dique y paseo, y algo para comer (plan a definir).",
    location: "Potrerillos, Mendoza",
    kind: "base",
    tbc: true,
  },
  {
    id: "bodega-almuerzo",
    date: "2026-11-06",
    start: "13:30",
    end: "17:00",
    title: "Almuerzo en Bardo",
    description: "Almuerzo en Bardo en la Bodega.",
    location: "Bardo en la Bodega, Cobos 6445, Luján de Cuyo",
    kind: "comida",
  },
  {
    id: "bodega-sunset",
    date: "2026-11-06",
    start: "17:00",
    end: "01:00",
    endDate: "2026-11-07",
    title: "Sunset y cachengue",
    description: "Sunset en la bodega con vino libre hasta la 1 am. Remeras puestas.",
    location: "Bardo en la Bodega, Cobos 6445, Luján de Cuyo",
    kind: "fiesta",
  },
  {
    id: "asado",
    date: "2026-11-07",
    start: "13:00",
    end: "16:00",
    title: "Posible asado",
    description:
      "Día libre. Posible asado en la quinta, al mediodía o a la noche, con sobremesa larga. A definir.",
    location: "Mendohaus, Luján de Cuyo",
    kind: "comida",
    tbc: true,
  },
  {
    id: "sabado-sunset",
    date: "2026-11-07",
    start: "17:00",
    end: "20:00",
    title: "Posible sunset",
    description: "Posible sunset para ver la puesta del sol con algo para tomar. Lugar a definir.",
    kind: "fiesta",
    tbc: true,
  },
  {
    id: "sabado-joda",
    date: "2026-11-07",
    start: "23:00",
    end: "03:00",
    endDate: "2026-11-08",
    title: "Posible joda",
    description: "Posible salida de noche. Lugar a definir.",
    kind: "fiesta",
    tbc: true,
  },
  {
    id: "resaca",
    date: "2026-11-08",
    start: "08:00",
    end: "09:30",
    title: "Dormir la resaca",
    description:
      "Mañana de domingo para dormir y recuperarse de todo el finde antes del check-out. Si queremos dormir más, hay que pedir el late check-out.",
    location: "Mendohaus, Luján de Cuyo",
    kind: "base",
    tbc: true,
  },
  {
    id: "checkout",
    date: "2026-11-08",
    start: "09:30",
    end: "10:00",
    title: "Check-out de la quinta",
    description:
      "Salida a las 10:00. Dejar todo limpio y las bolsas cerradas en el receptáculo del frente. Si queremos quedarnos más tarde, avisar con anticipación.",
    location: "Mendohaus, Granaderos 6067, Luján de Cuyo",
    kind: "base",
  },
  {
    id: "vuelo-vuelta",
    date: "2026-11-08",
    start: "17:28",
    end: "19:09",
    title: "Vuelta a casa",
    description:
      "JETSMART, vuelo JA3081, directo. Sale de El Plumerillo, Mendoza (MDZ) 17:28 y llega a Ezeiza (EZE) 19:09.",
    location: "El Plumerillo → Ezeiza",
    kind: "viaje",
    forIds: FLIGHT_GROUP,
  },
  {
    id: "viaje-feli-vuelta",
    date: "2026-11-08",
    start: "12:00",
    end: "23:00",
    title: "Vuelta en camioneta",
    description: "Vuelve en camioneta, por su cuenta. Horario a confirmar.",
    kind: "viaje",
    forIds: ["feli"],
    tbc: true,
  },
  {
    id: "vuelo-gero-vuelta",
    date: "2026-11-08",
    start: "12:00",
    end: "20:00",
    title: "Vuelo de vuelta",
    description: "Vuelve en otro vuelo. Faltan los datos del vuelo.",
    kind: "viaje",
    forIds: ["gero"],
    tbc: true,
  },
];

export type Flight = {
  direction: "Ida" | "Vuelta";
  airline: string;
  number: string;
  /** YYYY-MM-DD */
  date: string;
  from: { code: string; city: string; airport: string; time: string };
  to: { code: string; city: string; airport: string; time: string };
  duration: string;
  checkIn: string;
};

/** Vuelos del grupo (todos menos Feli y Gero). */
export const FLIGHTS: Flight[] = [
  {
    direction: "Ida",
    airline: "JETSMART",
    number: "JA3072",
    date: "2026-11-04",
    from: { code: "AEP", city: "Buenos Aires", airport: "Aeropuerto Jorge Newbery", time: "05:13" },
    to: { code: "MDZ", city: "Mendoza", airport: "Aeropuerto El Plumerillo", time: "07:08" },
    duration: "1 h 55 min",
    checkIn: "Check-in desde el 1 de noviembre",
  },
  {
    direction: "Vuelta",
    airline: "JETSMART",
    number: "JA3081",
    date: "2026-11-08",
    from: { code: "MDZ", city: "Mendoza", airport: "Aeropuerto El Plumerillo", time: "17:28" },
    to: { code: "EZE", city: "Buenos Aires", airport: "Aeropuerto Ministro Pistarini (Ezeiza)", time: "19:09" },
    duration: "1 h 41 min",
    checkIn: "Check-in desde el 5 de noviembre",
  },
];

/** Quienes no van en el vuelo grupal. */
export const OTHER_TRAVEL: Record<string, string> = {
  feli: "Viaja en camioneta, por su cuenta.",
  gero: "Viaja en otro vuelo. Todavía faltan los datos.",
};

export const QUINTA = {
  name: "Mendohaus",
  address: "Granaderos 6067, Luján de Cuyo, Mendoza",
  mapsUrl: "https://maps.app.goo.gl/LfFHpxp7wyrBFrEw5",
  stay: "Del 4 al 8 de noviembre de 2026",
  checkIn: "15:00",
  checkOut: "10:00",
  arrival: [
    "Ingreso autónomo: las llaves están en una cajita de seguridad en la entrada de la casa.",
    "El código de la caja lo mandan el día antes del check-in (3 de noviembre), con las instrucciones finales.",
    "Si queremos entrar antes o salir más tarde, hay que avisarle al anfitrión con anticipación.",
  ],
  wifi: { network: "Casa Granaderos-5GHz", password: "granaderos3030" },
  trash: "Las bolsas cerradas van en el receptáculo del frente de la casa.",
  payment: {
    total: "USD 800",
    deposit: "USD 240 (30%), ya recibida",
    balance: "USD 560 (70%), se paga al ingresar",
    how: "En dólar billete (solo cabeza grande), dólar transferencia o pesos transferencia al blue vendedor de Ámbito del día de pago.",
  },
  links: [
    { label: "Cómo llegar (Google Maps)", url: "https://maps.app.goo.gl/LfFHpxp7wyrBFrEw5" },
    {
      label: "Guía local: restaurantes, bodegas y actividades",
      url: "https://www.airbnb.com/s/guidebooks?refinement_paths%5B%5D=/guidebooks/4286772",
    },
    { label: "WhatsApp del anfitrión (Facundo)", url: "https://wa.me/5492612590148" },
    { label: "Instagram @mendohaus", url: "https://instagram.com/mendohaus" },
    { label: "mendohaus.com", url: "https://www.mendohaus.com" },
  ],
  /** Fotos de la quinta: poné los archivos en public/img/quinta/ y listalos acá. */
  photos: [{ src: "/img/quinta/quinta-1.jpg", alt: "Pileta y jardín de la quinta Mendohaus" }] as {
    src: string;
    alt: string;
  }[],
};

export const BODEGA = {
  name: "Bardo en la Bodega",
  address: "Cobos 6445, Luján de Cuyo, Mendoza",
  mapsUrl: "https://maps.app.goo.gl/FdLvwPSE4ZDqmMpz8",
  day: "Viernes 6 de noviembre",
  plan: [
    { time: "13:30", text: "Almuerzo" },
    { time: "17:00", text: "Sunset con música, DJ y vino libre" },
    { time: "01:00", text: "Cierre" },
  ],
  notes: [
    "Vino libre durante el sunset, hasta la 1 am.",
    "Vamos con las remeras puestas.",
    "Se sale de la quinta (Luján de Cuyo) hacia la bodega: hay que definir cómo nos movemos de vuelta de madrugada.",
  ],
  links: [
    { label: "Cómo llegar (Google Maps)", url: "https://maps.app.goo.gl/FdLvwPSE4ZDqmMpz8" },
    { label: "Sitio web", url: "https://bardoenlabodega.com.ar/index.php" },
    { label: "La cocina", url: "https://bardoenlabodega.com.ar/gastronomy.php" },
    { label: "Nuestros vinos", url: "https://bardoenlabodega.com.ar/wine.php" },
    { label: "Galería de fotos", url: "https://bardoenlabodega.com.ar/gallery-images.php" },
    { label: "WhatsApp", url: "https://wa.me/5492613034164" },
    { label: "Instagram @bardoenlabodega", url: "https://www.instagram.com/bardoenlabodega/" },
  ],
  /** Fotos: poné los archivos en public/img/bodega/ y listalos acá. */
  photos: [
    { src: "/img/bodega/bardo-1.jpg", alt: "Brindis con vino frente a los viñedos de Bardo en la Bodega" },
  ] as { src: string; alt: string }[],
};

/** Cosas que todavía hay que resolver. Borrá o editá a medida que se cierran. */
export const PENDING: { title: string; detail: string; link?: { label: string; url: string } }[] = [
  {
    title: "Cómo volver desde Ezeiza",
    detail:
      "El vuelo de vuelta aterriza el 8/11 a las 19:09 en Ezeiza. Falta definir cómo volvemos a casa: cada auto que averiguamos sale unos $100.000.",
  },
  {
    title: "Reconfirmar el rafting",
    detail:
      "Potrerillos Explorer pide comunicarse un día antes (el 4/11) para reconfirmar la reserva del jueves 5.",
  },
  {
    title: "Avisar del late check-out a la quinta",
    detail:
      "El check-out es el 8/11 a las 10:00 y el vuelo sale a las 17:28. Hay que pedirle a Facundo (Mendohaus) quedarnos hasta más tarde, con anticipación: el domingo es para dormir la resaca.",
    link: { label: "Escribirle por WhatsApp", url: "https://wa.me/5492612590148" },
  },
];

export const INFO = {
  tagline: "Se casa el Gordo. Cinco días en Mendoza antes de que sea tarde.",
  facts: [
    { label: "Dónde", value: "Mendoza, Argentina" },
    { label: "Cuándo", value: "4 al 8 de noviembre de 2026" },
    { label: "Cómo llegamos", value: "En avión", opensFlights: true },
    { label: "Dónde dormimos", value: "Mendohaus", opensQuinta: true },
    { label: "La bodega", value: "Bardo", opensBodega: true },
  ],
  highlights: [
    { title: "Rafting (jueves)", text: "Potrerillos Explorer a las 12:30, en dos balsas y con fotos gratis. Después nos quedamos por Potrerillos." },
    { title: "Bodega (viernes)", text: "Bardo, confirmado: almuerzo, sunset y vino libre hasta la 1." },
    { title: "Sábado", text: "Día libre: posible asado (mediodía o noche), sunset y joda. A definir." },
  ],
  bring: [
    "DNI y pasaje",
    "Remera de la despedida",
    "Rafting: malla o muda de ropa interior, calzado para mojar con cierre atrás (sin ojotas), toalla y abrigo",
    "Protector solar y gorra",
    "Malla",
    "Ropa para salir a la bodega",
    "Efectivo y la app abierta para anotar gastos",
  ],
};
