export interface IntegrationPlatform {
  id: string;
  name: string;
  shortCode: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
}

export const platforms: IntegrationPlatform[] = [
  {
    id: "rappi",
    name: "Rappi",
    shortCode: "RA",
    color: "#ff441f",
    badgeBg: "bg-[#fff0eb]",
    badgeText: "text-[#e03a17]",
    badgeBorder: "border-[#ffcca8]",
  },
  {
    id: "pedidosya",
    name: "PedidosYa",
    shortCode: "PE",
    color: "#ea003a",
    badgeBg: "bg-[#ffebee]",
    badgeText: "text-[#d10034]",
    badgeBorder: "border-[#ffccd5]",
  },
  {
    id: "ubereats",
    name: "Uber Eats",
    shortCode: "UB",
    color: "#06c167",
    badgeBg: "bg-[#e8f8f0]",
    badgeText: "text-[#05944f]",
    badgeBorder: "border-[#b5ecd0]",
  },
  {
    id: "justo",
    name: "Justo",
    shortCode: "JU",
    color: "#6b38fb",
    badgeBg: "bg-[#f1ebff]",
    badgeText: "text-[#5826ea]",
    badgeBorder: "border-[#d8c5fe]",
  },
  {
    id: "ifood",
    name: "iFood",
    shortCode: "iF",
    color: "#ea1d2c",
    badgeBg: "bg-[#ffebee]",
    badgeText: "text-[#ea1d2c]",
    badgeBorder: "border-[#ffc9cd]",
  },
  {
    id: "didi",
    name: "Didi",
    shortCode: "DI",
    color: "#ff7700",
    badgeBg: "bg-[#fff3e6]",
    badgeText: "text-[#e06800]",
    badgeBorder: "border-[#ffd9b3]",
  },
];

export type DerivationType = "si" | "no" | "condicional";

export type IntegrationCategory = "pedidos" | "tiendas" | "menu" | "integracion" | "general";

export interface IntegrationSolution {
  /** Apps a las que aplica esta solución */
  platformIds: string[];
  /** Subcaso dentro del problema (ej: "Un pedido", "Más de un pedido") */
  scenario?: string;
  steps: string[];
  /** Columna "Reportar a Integraciones?" de la planilla */
  derivation?: DerivationType;
  derivationLabel?: string;
  /** Aclaración destacada (texto resaltado en la planilla) */
  note?: string;
  /** Respuesta sugerida para el cliente (sin saludo, con cierre 😊) */
  clientMessage?: string;
}

export interface IntegrationIssue {
  id: string;
  problem: string;
  category: IntegrationCategory;
  categoryLabel: string;
  /** Columna "Datos para reportar" de la planilla */
  reportData: string[];
  solutions: IntegrationSolution[];
}

const ALL = ["rappi", "pedidosya", "ubereats", "justo", "ifood", "didi"];
const FIVE = ["rappi", "pedidosya", "ubereats", "justo", "didi"];

const baseIntegrationIssues: IntegrationIssue[] = [
  // ==========================================
  // NO INGRESA PEDIDOS
  // ==========================================
  {
    id: "no-ingresa-pedidos",
    problem: "No ingresa pedidos",
    category: "pedidos",
    categoryLabel: "Pedidos",
    reportData: ["ID del pedido (un pedido)", "ID de los pedidos (más de un pedido)"],
    solutions: [
      {
        platformIds: ALL,
        scenario: "Un pedido",
        steps: [
          "Indicarle que se estará notificando a Integraciones para que lo verifique.",
          "Informarle que si llega a suceder con otro pedido lo acepte/rechace desde el programa de la delivery app, exceptuando Rappi que debe pausar la integración.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
        clientMessage:
          "👉 Si llega a suceder con otro pedido mientras tanto, acéptalo o recházalo desde el programa de la delivery app (en el caso de Rappi, deberás pausar la integración) 😊",
      },
      {
        platformIds: ["rappi"],
        scenario: "Más de un pedido",
        steps: [
          "Si los pedidos pueden ser aceptados desde Rappi y se puede asociar productos en Fudo: la integración está hecha pero se encuentra inactiva y el cliente puede activarla desde el soporte de Rappi.",
          "El cliente debe hablar con el soporte de Rappi para pausar su integración (usar el método abreviado que corresponda).",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["pedidosya", "ubereats", "justo", "didi"],
        scenario: "Más de un pedido",
        steps: ["Que vaya aceptando/rechazando los pedidos desde la plataforma de la delivery app."],
        derivation: "si",
        derivationLabel: "Sí, derivar",
        clientMessage:
          "👉 Mientras tanto, ve aceptando o rechazando los pedidos directamente desde la plataforma de la delivery app 😊",
      },
    ],
  },

  // ==========================================
  // TIENDAS MAL VINCULADAS
  // ==========================================
  {
    id: "tiendas-mal-vinculadas",
    problem: "Tiendas mal vinculadas",
    category: "tiendas",
    categoryLabel: "Tiendas",
    reportData: ["ID de las tiendas a integrar", "Nombre de la cuenta de Fudo"],
    solutions: [
      {
        platformIds: ["rappi"],
        steps: [
          "Puede realizar la pausa/baja de la integración con el soporte de Rappi, en caso de que no estemos disponibles desde Integraciones.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["pedidosya"],
        steps: [
          "Puede realizar la pausa/baja de la integración con el soporte de Integraciones de PedidosYa, en caso de que no estemos disponibles desde Integraciones: soporteintegraciones@pedidosya.com",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["ubereats"],
        steps: [
          "Puede pausar la tienda que se encuentra mal integrada y realizar nuevamente la integración.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["justo"],
        steps: ["Puede realizar la pausa/baja de la integración desde Fudo."],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["didi"],
        steps: ["El cliente puede solucionarlo desde Administración > Delivery apps > Didi."],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Puedes solucionarlo directamente desde tu cuenta de Fudo:\n\n👉 Ingresa a Administración ➡️ Delivery apps ➡️ Didi 😊",
      },
    ],
  },

  // ==========================================
  // NO SE PUEDE ACEPTAR / RECHAZAR PEDIDO
  // ==========================================
  {
    id: "no-se-puede-aceptar-rechazar-pedido",
    problem: "No se puede aceptar/rechazar pedido",
    category: "pedidos",
    categoryLabel: "Pedidos",
    reportData: ["ID de la venta en Fudo"],
    solutions: [
      {
        platformIds: FIVE,
        steps: [
          "Verificar: 1) Si los productos tienen stock. 2) Si están bien asociados. 3) Si están activos o no.",
          "Si persiste, indicarle al cliente que puede ir aceptando/rechazando el pedido desde el programa de la delivery app, exceptuando Rappi que deberá pausar la integración (usando el método abreviado según corresponda).",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
        clientMessage:
          "Para revisarlo, por favor verifica en Fudo:\n1️⃣ Que los productos tengan stock.\n2️⃣ Que estén bien asociados.\n3️⃣ Que estén activos.\n\n👉 Si persiste, puedes ir aceptando o rechazando el pedido desde el programa de la delivery app (en el caso de Rappi, deberás pausar la integración) 😊",
      },
    ],
  },

  // ==========================================
  // PRODUCTO MAL ASOCIADO
  // ==========================================
  {
    id: "producto-mal-asociado",
    problem: "Producto mal asociado",
    category: "menu",
    categoryLabel: "Menú / Productos",
    reportData: ["Cuáles son los productos (si son algunos productos)"],
    solutions: [
      {
        platformIds: ["pedidosya"],
        scenario: "Algunos productos",
        steps: [
          "Enviar un correo a soporteintegraciones@pedidosya.com indicando los productos que llegan mal y el SKU de cada producto correspondiente en Fudo.",
        ],
        derivation: "condicional",
        derivationLabel: "Sí, si el cliente se pone intenso",
      },
      {
        platformIds: ["pedidosya"],
        scenario: "La mayoría de los productos",
        steps: [
          "Se debe informar que el caso va a ser reportado al área de Integraciones y que es un procedimiento que lleva tiempo, ya que se debe intercambiar información entre las aplicaciones para corregir la asociación.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
        clientMessage:
          "Reportaremos el caso al área de Integraciones.\n\n👉 Es un procedimiento que lleva tiempo, ya que se debe intercambiar información entre las aplicaciones para corregir la asociación 😊",
      },
      {
        platformIds: ["rappi", "ubereats", "justo", "didi"],
        scenario: "La mayoría de los productos",
        steps: ["Pueden solucionarlo desde Productos > Delivery Menu (Beta)."],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Puedes solucionarlo desde tu cuenta de Fudo:\n\n👉 Ingresa a Productos ➡️ Delivery Menu (Beta) 😊",
      },
    ],
  },

  // ==========================================
  // SE LE CIERRA LA TIENDA
  // ==========================================
  {
    id: "se-le-cierra-la-tienda",
    problem: "Se le cierra la tienda",
    category: "tiendas",
    categoryLabel: "Tiendas",
    reportData: ["ID de la tienda", "Detalle del inconveniente"],
    solutions: [
      {
        platformIds: ["rappi"],
        steps: ["Pausar la integración (usar el método abreviado que corresponda)."],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["pedidosya"],
        steps: [
          "Esperar unos minutos con el cliente y la tienda abierta; si vuelve a suceder, que vaya aceptando/rechazando los pedidos de la app de PY.",
          "Para abrir tiendas pueden hacerlo directo desde Fudo: en Administración > Delivery apps > PedidosYa van a encontrar un botón para consultar el estado de las tiendas y abrirlas.",
        ],
        note: "En caso de que Integraciones no esté disponible, el cliente puede solicitar la activación de la tienda y el motivo de cierre con el soporte de Integraciones de PedidosYa por soporteintegraciones@pedidosya.com",
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["ubereats"],
        steps: [
          "Fuera de horario: que acepte/rechace los pedidos desde el programa de Uber Eats hasta que Integraciones lo verifique.",
          "Dentro del horario: reportar a Integraciones.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["justo"],
        steps: ["Puede realizar la pausa/baja de la integración desde Fudo."],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["didi"],
        steps: ["Reportar a Integraciones."],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
    ],
  },

  // ==========================================
  // MODIFICAR LA CARTA
  // ==========================================
  {
    id: "modificar-la-carta",
    problem: "Modificar la carta",
    category: "menu",
    categoryLabel: "Menú / Productos",
    reportData: ["ID de la tienda"],
    solutions: [
      {
        platformIds: ["ubereats"],
        steps: [
          "Si en Uber no puede modificar su menú es porque se le inhabilitó el Menu Maker. Se deriva directamente a Integraciones, no es necesario pausar la integración.",
          "Una solución inmediata sería que el cliente mismo vuelva a hacer el procedimiento de integración de la tienda que tiene el problema. Así se reseteará la configuración en Uber y podría editar de nuevo su menú.",
          "Estaría bueno que se pruebe teniendo al cliente en línea; si hacer esto lo soluciona, no haría falta derivarlo.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["pedidosya"],
        steps: [
          "El cliente tendrá que hablar con el soporte de PedidosYa. Integraciones no tiene acceso al menú de ellos, no podemos modificarlo.",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Las modificaciones de la carta de PedidosYa deben gestionarse con el soporte de PedidosYa.\n\n👉 Desde Fudo no tenemos acceso al menú de ellos, por lo que no podemos modificarlo 😊",
      },
      {
        platformIds: ["rappi", "justo", "didi"],
        steps: ["El cliente lo puede hacer directamente desde el portal de la delivery app."],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Puedes modificar tu carta directamente desde el portal de la delivery app 😊",
      },
    ],
  },

  // ==========================================
  // INACTIVAR PRODUCTOS EN LA TIENDA DE LA DELIVERY APP
  // ==========================================
  {
    id: "inactivar-productos-tienda",
    problem: "Inactivar productos en la tienda de la Delivery App",
    category: "menu",
    categoryLabel: "Menú / Productos",
    reportData: ["ID de la tienda"],
    solutions: [
      {
        platformIds: ["ubereats"],
        steps: [
          "Lo que determina si puede hacer cambios o no en su menú es si tiene los permisos activos en Uber.",
          "Si puede editar su carta, también puede inactivar productos.",
          "Si no puede editar nada es porque tiene inhabilitado el Menú Maker. Se deriva a Integraciones.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["pedidosya", "rappi", "justo", "didi"],
        steps: ["Puede inactivarlo directamente desde el portal de la delivery app."],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Puedes inactivar los productos directamente desde el portal de la delivery app 😊",
      },
    ],
  },

  // ==========================================
  // PAUSAR LA INTEGRACIÓN
  // ==========================================
  {
    id: "pausar-la-integracion",
    problem: "Pausar la integración",
    category: "integracion",
    categoryLabel: "Integración",
    reportData: ["ID de la tienda", "Detalle del inconveniente"],
    solutions: [
      {
        platformIds: ["pedidosya"],
        steps: [
          "Fuera del horario de Integraciones: el cliente debe solicitarlo por correo a soporteintegraciones@pedidosya.com",
          "Dentro del horario: reportar a Integraciones.",
        ],
        derivation: "condicional",
        derivationLabel: "Sí / No según horario",
      },
      {
        platformIds: ["rappi"],
        steps: [
          "El cliente debe hablar con el soporte de Rappi para pausar su integración (usar el método abreviado que corresponda).",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
      },
      {
        platformIds: ["ubereats"],
        steps: [
          "Pueden hacerlo desde Fudo en Administración > Delivery Apps > Uber destildando el apartado de \"Activa\".",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Puedes pausar la integración desde tu cuenta de Fudo:\n\n👉 Ingresa a Administración ➡️ Delivery Apps ➡️ Uber y destilda el apartado de 'Activa' 😊",
      },
      {
        platformIds: ["justo"],
        steps: [
          "Pueden hacerlo desde Fudo en Administración > Delivery Apps > Justo actualizando la Llave Secreta con el botón de \"Recargar\".",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Puedes pausar la integración desde tu cuenta de Fudo:\n\n👉 Ingresa a Administración ➡️ Delivery Apps ➡️ Justo y actualiza la Llave Secreta con el botón 'Recargar' 😊",
      },
      {
        platformIds: ["didi"],
        steps: [
          "Pueden hacerlo desde Fudo en Administración > Delivery Apps > Didi quitando la tienda integrada con la \"x\".",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Puedes pausar la integración desde tu cuenta de Fudo:\n\n👉 Ingresa a Administración ➡️ Delivery Apps ➡️ Didi y quita la tienda integrada con la 'x' 😊",
      },
    ],
  },

  // ==========================================
  // CONOCER EL ESTADO DE LA INTEGRACIÓN
  // ==========================================
  {
    id: "conocer-estado-integracion",
    problem: "Conocer el estado de la integración",
    category: "integracion",
    categoryLabel: "Integración",
    reportData: [],
    solutions: [
      {
        platformIds: FIVE,
        steps: [
          "(1) Entrando en el negocio aparecen los tickets asociados; allí se puede ver en qué estado se encuentran.",
          "(2) Desde Servicio al cliente > Tickets, pueden poner la vista de \"Lista\" y seleccionar \"Todos los pipelines\"; así pueden ver todos los tickets que tiene abiertos el negocio, buscando con el nombre de la cuenta (recomiendo buscar a 3 caracteres).",
          "(3) Desde Servicio al cliente > Tickets, pueden seleccionar el pipeline de la integración deseada y buscar con el nombre de la cuenta (recomiendo buscar a 3 caracteres).",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
      },
    ],
  },

  // ==========================================
  // NO SE DESCUENTA EL STOCK
  // ==========================================
  {
    id: "no-se-descuenta-el-stock",
    problem: "No se descuenta el stock",
    category: "menu",
    categoryLabel: "Menú / Productos",
    reportData: [],
    solutions: [
      {
        platformIds: FIVE,
        steps: [
          "Lo que tiene que hacer es ir al producto creado en Fudo de la integración y asociarle el producto que vende por fuera de la integración. Ejemplo: Helado 1kg (PY) asociarlo al producto Helado 1Kg.",
          "Como los productos de la integración se vinculan directamente con los de Fudo (desde Productos > Delivery Menu Beta), lo único que debe verificar es que esté controlando el stock del producto creado en Fudo que tiene vinculado con la integración.",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Para que se descuente el stock:\n\n👉 Ingresa al producto creado en Fudo de la integración y asóciale el producto que vendes por fuera de la integración (ejemplo: Helado 1kg (PY) asociado al producto Helado 1Kg).\n👉 Verifica que esté controlando el stock del producto de Fudo que tiene vinculado con la integración 😊",
      },
    ],
  },

  // ==========================================
  // ACTIVAR NUEVAMENTE LA TIENDA
  // ==========================================
  {
    id: "activar-nuevamente-la-tienda",
    problem: "Activar nuevamente la tienda",
    category: "tiendas",
    categoryLabel: "Tiendas",
    reportData: [],
    solutions: [
      {
        platformIds: ["rappi"],
        steps: ["El cliente puede realizar la activación de la integración con el soporte de Rappi."],
        derivation: "no",
        derivationLabel: "No derivar",
      },
      {
        platformIds: ["pedidosya"],
        steps: [
          "Fuera de horario: enviar un correo a soporteintegraciones@pedidosya.com",
          "Dentro de horario: reportar a Integraciones.",
        ],
        derivation: "condicional",
        derivationLabel: "Sí / No según horario",
      },
      {
        platformIds: ["ubereats"],
        steps: [
          "Pueden hacerlo desde Fudo en Administración > Delivery Apps > Uber tildando el apartado de \"Activa\".",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Puedes reactivar la tienda desde tu cuenta de Fudo:\n\n👉 Ingresa a Administración ➡️ Delivery Apps ➡️ Uber y tilda el apartado de 'Activa' 😊",
      },
      {
        platformIds: ["justo"],
        steps: [
          "Pueden hacerlo desde Fudo en Administración > Delivery Apps > Justo actualizando la Llave Secreta con el botón de \"Recargar\".",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Puedes reactivar la tienda desde tu cuenta de Fudo:\n\n👉 Ingresa a Administración ➡️ Delivery Apps ➡️ Justo y actualiza la Llave Secreta con el botón 'Recargar' 😊",
      },
      {
        platformIds: ["didi"],
        steps: [
          "Pueden hacerlo desde Fudo en Administración > Delivery Apps > Didi quitando la tienda integrada con la \"x\".",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
      },
    ],
  },

  // ==========================================
  // NO SE IMPRIME LA COMANDA DEL PEDIDO
  // ==========================================
  {
    id: "no-se-imprime-la-comanda",
    problem: "No se imprime la comanda del pedido",
    category: "pedidos",
    categoryLabel: "Pedidos",
    reportData: [],
    solutions: [
      {
        platformIds: ["pedidosya"],
        steps: [
          "Verificar que las categorías de productos de PedidosYa tengan una Cocina asociada; tratar como cualquier otro producto más de Fudo que no imprime comanda.",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Verifica que las categorías de productos de PedidosYa tengan una Cocina asociada, como en cualquier otro producto de Fudo que no imprime comanda 😊",
      },
      {
        platformIds: ["rappi", "ubereats", "justo", "didi"],
        steps: ["Tratar como cualquier otro producto más que no imprime comanda."],
        derivation: "no",
        derivationLabel: "No derivar",
      },
    ],
  },

  // ==========================================
  // ¿QUÉ DATOS NO APARECEN EN LAS VENTAS RECIBIDAS?
  // ==========================================
  {
    id: "datos-no-aparecen-ventas-recibidas",
    problem: "¿Qué datos no aparecen en las ventas recibidas?",
    category: "pedidos",
    categoryLabel: "Pedidos",
    reportData: [],
    solutions: [
      {
        platformIds: ["rappi"],
        steps: [
          "Si el reparto es de Rappi: no aparecen el nombre del cliente, el teléfono, el domicilio ni el nombre del repartidor.",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
      },
      {
        platformIds: ["pedidosya"],
        steps: [
          "Si el envío está a cargo de PY, no se muestran en Fudo los datos del cliente; solamente el nombre y el ID del pedido en PY.",
          "Si el envío está a cargo del local, sí se muestran los datos.",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
      },
      {
        platformIds: ["ubereats"],
        steps: [
          "El domicilio se muestra con URL de Google Maps.",
          "Solución: copiar la dirección, buscar la dirección en Google Maps y agregarlo como comentario de la venta.",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
      },
      {
        platformIds: ["justo"],
        steps: ["Se muestra el nombre de la tienda y el ID del pedido en Justo es diferente al de Fudo."],
        derivation: "no",
        derivationLabel: "No derivar",
      },
      {
        platformIds: ["didi"],
        steps: ["Teléfono del cliente incompleto. Ej: 122****3081"],
        derivation: "no",
        derivationLabel: "No derivar",
      },
    ],
  },

  // ==========================================
  // ¿CÓMO IDENTIFICO DE QUÉ TIENDA PROVIENE MI PEDIDO?
  // ==========================================
  {
    id: "identificar-tienda-del-pedido",
    problem: "¿Cómo identifico de qué tienda proviene mi pedido?",
    category: "pedidos",
    categoryLabel: "Pedidos",
    reportData: [],
    solutions: [
      {
        platformIds: ["rappi", "pedidosya", "ubereats", "didi"],
        steps: ["Sí, aparece en la información de la venta en Fudo."],
        derivation: "no",
        derivationLabel: "No derivar",
      },
      {
        platformIds: ["justo"],
        steps: ["No es posible identificar de qué tienda proviene el pedido en Fudo."],
        derivation: "no",
        derivationLabel: "No derivar",
      },
    ],
  },

  // ==========================================
  // NO COINCIDE EL TOTAL DE LA VENTA
  // ==========================================
  {
    id: "no-coincide-el-total",
    problem: "No coincide el total de la venta en la Delivery App con Fudo",
    category: "pedidos",
    categoryLabel: "Pedidos",
    reportData: ["Foto del pedido en la app y en Fudo"],
    solutions: [
      {
        platformIds: FIVE,
        steps: ["Se reportan a Integraciones con las fotos solicitadas de las ventas."],
        derivation: "si",
        derivationLabel: "Sí, derivar",
        clientMessage:
          "Para revisar la diferencia en el total:\n\n👉 Envíanos una foto del pedido en la delivery app y otra de la venta en Fudo, para reportarlo a Integraciones 😊",
      },
    ],
  },

  // ==========================================
  // ASOCIACIÓN DE PRODUCTOS (A CARGO DEL CLIENTE)
  // ==========================================
  {
    id: "asociacion-productos-a-cargo-del-cliente",
    problem: "Asociación y duplicado de productos (a cargo del cliente)",
    category: "menu",
    categoryLabel: "Menú / Productos",
    reportData: [],
    solutions: [
      {
        platformIds: ["rappi", "didi", "ubereats", "justo"],
        steps: [
          "No realizamos asociación de productos en la cuenta.",
          "El mismo cliente realiza la asociación de productos desde Fudo en Productos > Delivery menú.",
          "Si duplica productos es su responsabilidad. Deben mostrarle cómo eliminarlos o desactivarlos.",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "La asociación de productos la realiza el mismo cliente desde Fudo:\n\n👉 Ingresa a Productos ➡️ Delivery menú.\n👉 Si hay productos duplicados, puedes eliminarlos o desactivarlos desde allí 😊",
      },
    ],
  },

  // ==========================================
  // DUPLICIDAD DE PRODUCTOS
  // ==========================================
  {
    id: "duplicidad-de-productos",
    problem: "Duplicidad de productos",
    category: "menu",
    categoryLabel: "Menú / Productos",
    reportData: [],
    solutions: [
      {
        platformIds: ["pedidosya"],
        steps: [
          "Actualmente la integración es por productos que tiene creados en Fudo vs en PedidosYa. Si el producto existe en ambas plataformas, se asocian. Si no existe, se crea en Fudo y se asocia.",
          "Siempre se le debe explicar eso, pero si tiene duplicados nos lo pueden derivar.",
        ],
        note: "Es importante que no elimine ni modifique el producto que nosotros creamos porque está asociado a PY.",
        derivation: "condicional",
        derivationLabel: "Sí / No",
      },
    ],
  },

  // ==========================================
  // BAJA DE INTEGRACIÓN
  // ==========================================
  {
    id: "baja-de-integracion",
    problem: "Baja de integración",
    category: "integracion",
    categoryLabel: "Integración",
    reportData: [],
    solutions: [
      {
        platformIds: ["rappi"],
        steps: [
          "Puede pausar la integración hablando al Wapp de soporte de Rappi (esto es solo una pausa).",
          "Si necesita la baja definitiva, por ejemplo para integrarse con otro POS, nos lo tienen que derivar.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["pedidosya"],
        steps: [
          "Puede pausar/solicitar la integración por mail: soporteintegraciones@pedidosya.com, indicando el ID de la tienda.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["ubereats"],
        steps: [
          "Pueden pausarla desde Fudo.",
          "Para la baja definitiva, al igual que Rappi, nos lo deben derivar.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["justo"],
        steps: [
          "El cliente debe desactivar su integración ingresando a su portal de Justo, en la sección API > Webhooks, destildando el apartado de \"Activar\".",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["didi"],
        steps: ["Debe eliminar las tiendas desde Fudo pulsando en la \"x\"."],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
    ],
  },

  // ==========================================
  // PRECIOS DE LOS PRODUCTOS
  // ==========================================
  {
    id: "precios-de-los-productos",
    problem: "Precios de los productos",
    category: "menu",
    categoryLabel: "Menú / Productos",
    reportData: [],
    solutions: [
      {
        platformIds: FIVE,
        steps: [
          "Las ventas siempre ingresarán en Fudo con el precio de los productos que tenga configurado en su tienda de la delivery app.",
          "Ejemplo: si en PedidosYa vende una Coca Cola a $1000 y en Fudo a $800, la venta que ingrese de la integración con PY tendrá el valor de $1000, ya que así lo tiene configurado en la delivery app.",
        ],
        note: "EN CASO DE QUE QUIERA CAMBIAR LOS PRECIOS DE SUS PRODUCTOS DEBERÁ HACERLO DESDE EL PORTAL DE LA DELIVERY APP.",
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Las ventas siempre ingresan en Fudo con el precio configurado en tu tienda de la delivery app (ejemplo: si en PedidosYa vendes una Coca Cola a $1000 y en Fudo a $800, la venta de la integración tendrá el valor de $1000).\n\n👉 Si quieres cambiar los precios de tus productos, debes hacerlo desde el portal de la delivery app 😊",
      },
    ],
  },

  // ==========================================
  // IMPORTAR PRODUCTOS DE PY
  // ==========================================
  {
    id: "importar-productos-de-py",
    problem: "Importar productos de PY",
    category: "menu",
    categoryLabel: "Menú / Productos",
    reportData: [],
    solutions: [
      {
        platformIds: ["pedidosya"],
        steps: [
          "Si el cliente importa su menú de PY a Fudo y no aparecen todos los productos, es porque están inactivos en su tienda de PY.",
          "Tendrá que habilitarlos para que aparezcan en su tienda y en Fudo.",
        ],
        derivation: "no",
        derivationLabel: "No derivar",
        clientMessage:
          "Si al importar tu menú de PedidosYa a Fudo no aparecen todos los productos, es porque están inactivos en tu tienda de PedidosYa.\n\n👉 Habilítalos en tu tienda para que aparezcan 😊",
      },
    ],
  },

  // ==========================================
  // NO CARGA EL MENÚ EN "DELIVERY MENÚ (BETA)"
  // ==========================================
  {
    id: "no-carga-el-menu-delivery-menu-beta",
    problem: "No carga el menú en \"Delivery menú (beta)\"",
    category: "menu",
    categoryLabel: "Menú / Productos",
    reportData: ["ID de tienda y nombre de cuenta"],
    solutions: [
      {
        platformIds: ["pedidosya"],
        steps: [
          "Se reporta a Integraciones.",
          "La asociación de productos de PedidosYa no es posible realizarla desde \"Delivery menú (beta)\": no aparece la aplicación en este apartado por más que esté integrada.",
          "La asociación de productos se realiza en el proceso de integración desde nuestro equipo de Integraciones.",
        ],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["rappi", "ubereats", "justo"],
        steps: ["Se reporta a Integraciones."],
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
      {
        platformIds: ["didi"],
        steps: [
          "Se reporta a Integraciones.",
          "La integración con Didi no soporta la asociación de COMBOS en Fudo. Esto es por cómo está desarrollada la estructura de los productos tipo COMBO en Didi y los productos de Fudo.",
          "¿Cómo puedo solucionarlo? Tenemos dos opciones:",
          "Opción 1: eliminar los combos en Didi y crearlos como productos individuales con las diferentes variantes posibles. Luego puedes cargar el menú sin problemas en el apartado de \"Delivery menú (beta)\".",
          "Opción 2: crear/modificar los productos de Fudo para que tengan exactamente el mismo nombre que los productos de Didi; esto haría que se asocien automáticamente sin necesidad de realizar la asociación de productos. Podríamos mantener así los combos de Didi.",
        ],
        note: "La opción 2 solo hace que funcione correctamente la asociación de productos, pero no deja cargar el menú en \"Delivery menú (beta)\" ya que aún siguen existiendo COMBOS en Didi.",
        derivation: "si",
        derivationLabel: "Sí, derivar",
      },
    ],
  },

  // ==========================================
  // VENTAS QUE QUEDARON EN PENDIENTE
  // ==========================================
  {
    id: "ventas-que-quedaron-en-pendiente",
    problem: "Ventas que quedaron en Pendiente",
    category: "pedidos",
    categoryLabel: "Pedidos",
    reportData: [],
    solutions: [
      {
        platformIds: ALL,
        steps: [
          "Esto sucede mucho cuando tiene el módulo delivery desactivado pero la integración sigue activa.",
          "Las ventas de la integración seguirán ingresando y quedarán en estado \"Pendiente\" para aceptar o rechazar.",
          "Si esos pedidos ya fueron preparados y entregados a los clientes, deberá aceptarlos para marcarlos como \"Enviados\".",
        ],
        note: "Esto es MUY IMPORTANTE: si rechaza un pedido que ya fue preparado y enviado anteriormente, se le devolverá el dinero al cliente.",
        clientMessage:
          "Esto sucede cuando el módulo delivery está desactivado pero la integración sigue activa: las ventas siguen ingresando y quedan en estado 'Pendiente' para aceptar o rechazar.\n\n👉 Si esos pedidos ya fueron preparados y entregados, debes aceptarlos para marcarlos como 'Enviados'.\n⚠️ Importante: si rechazas un pedido que ya fue preparado y enviado, se le devolverá el dinero al cliente 😊",
      },
    ],
  },
];

/**
 * Aviso estándar que se agrega a la respuesta sugerida cuando el caso se deriva
 * al equipo de Integraciones.
 */
const DERIVATION_NOTICE =
  "👉 Notificaremos al equipo de Integraciones para que lo verifique en conjunto con la aplicación de delivery. Para eso te pediremos un número de teléfono y un email actualizados.\n👉 Vamos a derivar tu caso; te pido que aguardes el contacto por parte del equipo 😊";

const withDerivationNotice = (solution: IntegrationSolution): IntegrationSolution => {
  if (solution.derivation !== "si") return solution;
  const body = (solution.clientMessage || "").replace(/\s*😊\s*$/, "").trim();
  return {
    ...solution,
    clientMessage: body ? `${body}\n\n${DERIVATION_NOTICE}` : DERIVATION_NOTICE,
  };
};

export const integrationIssues: IntegrationIssue[] = baseIntegrationIssues.map((issue) => ({
  ...issue,
  solutions: issue.solutions.map(withDerivationNotice),
}));
