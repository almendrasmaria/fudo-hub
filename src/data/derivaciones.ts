export interface TeamItem {
  id: string;
  name: string;
  hours: string;
  agents: string;
  type: "flow" | "inbox" | "folio";
  typeLabel: string;
  typeColor: "purple" | "emerald" | "sky" | "orange";
  actionName: string;
  actionType: "Flujo" | "Inbox" | "Folio";
  messageInHours?: string;
  messageOutOfHours?: string;
  transferMessage?: string;
}

export interface CountryCommercial {
  country: string;
  flag: string;
  localHours: string;
  argHours: string;
  actionName: string;
  isCustomChile?: boolean;
}

export const teamList: TeamItem[] = [
  {
    id: "fudopagos",
    name: "FudoPagos",
    hours: "10 a 03 hs",
    agents: "Rodri 10-17 · Enzo 15-22 · Iván Z 20-03",
    type: "flow",
    typeLabel: "Flujo reutilizable",
    typeColor: "purple",
    actionName: "B) Transferir de SoporteN1 a Fudopagos Soporte (En horario)",
    actionType: "Flujo",
    messageInHours: "¡Hola! Te voy a transferir con el equipo especializado de FudoPagos para que revisen tu caso en detalle. En breve continuarán con tu atención. ¡Muchas gracias!",
    messageOutOfHours: "¡Hola! Te comento que el equipo de FudoPagos se encuentra fuera de horario de atención (atienden de 10 a 03 hs). Por favor indícanos tus datos y consulta; ya dejamos generado tu folio para que te contacten en su horario hábil.",
  },
  {
    id: "tu-delivery",
    name: "Tu Delivery",
    hours: "9 a 22 hs",
    agents: "Giani 9-16 · Martin 14-22",
    type: "inbox",
    typeLabel: "Cambio de Inbox",
    typeColor: "emerald",
    actionName: "Soporte N1 Tu Delivery (En horario)",
    actionType: "Inbox",
    messageInHours: "¡Hola! Te derivo con el equipo de Tu Delivery para que te ayuden con esta consulta. Aguardanos un momento y te responderán por aquí.",
    messageOutOfHours: "¡Hola! El equipo de Tu Delivery está fuera de su horario de atención (de 9 a 22 hs). Por favor dejanos tus datos y consulta; ya dejamos generado tu folio para que te respondan apenas inicien su jornada.",
  },
  {
    id: "nivel-2",
    name: "Nivel 2",
    hours: "10 a 22 hs",
    agents: "Facu 10-17 · Carla 15-22",
    type: "folio",
    typeLabel: "Folio (No transferir chat)",
    typeColor: "sky",
    actionName: "Crear Folio Nivel 2",
    actionType: "Folio",
    transferMessage: "¡Hola! Ya registré tu caso con nuestro equipo técnico de Nivel 2. Vamos a estar revisándolo y nos contactaremos con vos a la brevedad.",
  },
  {
    id: "integraciones",
    name: "Integraciones",
    hours: "9 a 22 hs",
    agents: "Equipo 9-18 · Melina 14-22",
    type: "folio",
    typeLabel: "Folio (No transferir chat)",
    typeColor: "sky",
    actionName: "Crear Folio Integraciones",
    actionType: "Folio",
    transferMessage: "¡Hola! Ya abrimos un folio con el equipo de Integraciones para revisar la vinculación. En cuanto tengamos novedades te avisamos por este medio.",
  },
];

export const commercialCountries: CountryCommercial[] = [
  {
    country: "Argentina",
    flag: "🇦🇷",
    localHours: "9 a 18 hs",
    argHours: "9 a 18 hs",
    actionName: "Asignación Owner Comercial",
  },
  {
    country: "Colombia",
    flag: "🇨🇴",
    localHours: "9 a 18 hs",
    argHours: "11 a 20 hs",
    actionName: "Asignación Owner Comercial",
  },
  {
    country: "México",
    flag: "🇲🇽",
    localHours: "9 a 18 hs",
    argHours: "12 a 21 hs",
    actionName: "Asignación Owner Comercial",
  },
];

export const commercialMessages = {
  inHours:
    "¡Hola! Te comunico con tu Ejecutivo Comercial asignado para que pueda asesorarte con tu consulta. En breve continuarán con tu atención.",
  outOfHours:
    "¡Hola! Te comento que el equipo Comercial se encuentra fuera de su horario de atención. Por favor, dejanos tus datos y consulta para abrir un folio y que tu Ejecutivo se comunique con vos al iniciar su jornada.",
};

export const chileCommercialData = {
  hours: "9 a 18 hs",
  messageInHours:
    "¡Hola! Te derivo con el área comercial para que puedan asesorarte con tu consulta. Aguardanos un momento y te responderán por aquí.",
  messageOutOfHours:
    "¡Hola! Te comento que el equipo Comercial de Chile se encuentra fuera de su horario de atención (atienden de 9 a 18 hs). Por favor, dejanos tus datos y consulta para abrir un folio y que te contacten al iniciar su jornada.",
  squads: [
    {
      inbox: "CS Inbound Chile",
      description:
        "Consultas de cuenta, info de planes y precios, altas, gestiones y dudas de facturación.",
    },
    {
      inbox: "CS Outbound Chile",
      description:
        "Cobranzas, pagos, bajas, compra de módulos, campañas salientes y capacitaciones (clientes PRO).",
    },
  ],
};


