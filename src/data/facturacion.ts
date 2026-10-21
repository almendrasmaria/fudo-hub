export type CountryId = "argentina" | "mexico" | "colombia" | "chile";

export interface CountryInfo {
  id: CountryId;
  name: string;
  flag: string;
  entity: string;
  fullNameEntity: string;
  portalUrl: string;
}

export const countriesInfo: Record<CountryId, CountryInfo> = {
  argentina: {
    id: "argentina",
    name: "Argentina",
    flag: "🇦🇷",
    entity: "ARCA",
    fullNameEntity: "Agencia de Recaudación y Control Aduanero (ARCA)",
    portalUrl: "https://www.arca.gob.ar",
  },
  mexico: {
    id: "mexico",
    name: "México",
    flag: "🇲🇽",
    entity: "SAT",
    fullNameEntity: "Servicio de Administración Tributaria (CFDI 4.0)",
    portalUrl: "https://www.sat.gob.mx",
  },
  colombia: {
    id: "colombia",
    name: "Colombia",
    flag: "🇨🇴",
    entity: "DIAN",
    fullNameEntity: "Dirección de Impuestos y Aduanas Nacionales (Facturando Electrónicamente)",
    portalUrl: "https://catalogo-vpfe.dian.gov.co/User/Login",
  },
  chile: {
    id: "chile",
    name: "Chile",
    flag: "🇨🇱",
    entity: "SII",
    fullNameEntity: "Servicio de Impuestos Internos (DTE)",
    portalUrl: "https://www.sii.cl",
  },
};

export type FiscalCategory =
  | "certificados"
  | "validacion_cliente"
  | "folios_puntos"
  | "impuestos"
  | "servidor_sistema";

export interface FiscalCategoryInfo {
  id: FiscalCategory;
  label: string;
}

export const fiscalCategories: FiscalCategoryInfo[] = [
  { id: "certificados", label: "Certificados y Claves" },
  { id: "validacion_cliente", label: "Validación de Receptor" },
  { id: "folios_puntos", label: "Folios y Puntos de Venta" },
  { id: "impuestos", label: "Impuestos y Alícuotas" },
  { id: "servidor_sistema", label: "Conexión y Servidor" },
];

export interface DecisionBranch {
  id: string;
  label: string;
  summary: string;
  badgeText: string;
  badgeType: "derivation" | "success" | "warning";
  derivationTarget?: string;
  note?: string;
  steps?: string[];
  clientMessage?: string;
}

export interface DecisionTree {
  question: string;
  branches: DecisionBranch[];
}

export interface DialogScreenshot {
  type?: "error" | "warning";
  title: string;
  message: string;
  buttonText: string;
}

export interface InvoiceIssue {
  id: string;
  countryId: CountryId;
  entity: string;
  category: FiscalCategory;
  errorCode?: string;
  title: string;
  errorSnippet: string;
  rootCause: string;
  solutionSteps: string[];
  clientMessage: string;
  requiresDerivation: boolean;
  derivationTarget?: string;
  derivationChannel?: string;
  warningNote?: string;
  portalLink?: {
    label: string;
    url: string;
  };
  videoLink?: {
    label: string;
    url: string;
  };
  dialogScreenshot?: DialogScreenshot;
  decisionTree?: DecisionTree;
}

export const invoiceIssues: InvoiceIssue[] = [
  // ==========================================
  // ARGENTINA (ARCA) - Protocolo Oficial
  // ==========================================
  {
    id: "arg-punto-venta-rece",
    countryId: "argentina",
    entity: "ARCA",
    category: "folios_puntos",
    title: "No autorizado a emitir comprobantes - Punto de venta debe ser tipo RECE",
    errorSnippet: "NO AUTORIZADO A EMITIR COMPROBANTES - EL PUNTO DE VENTA INFORMADO DEBE ESTAR DADO DE ALTA Y SER DEL TIPO RECE",
    rootCause: "Este error ocurre porque el cliente se recategorizó en ARCA y el Punto de Venta anterior quedó deshabilitado o no está configurado bajo la modalidad requerida para Web Services.",
    solutionSteps: [
      "El cliente debe ingresar a la web de ARCA con CUIT y Clave Fiscal al servicio 'Administración de Puntos de Venta y Domicilios'.",
      "Dar de alta un NUEVO Punto de Venta seleccionando obligatoriamente el sistema: 'RECE para aplicativos y webservices'.",
      "Descargar la constancia de alta del nuevo punto de venta y enviarla por correo a admin@fu.do.",
      "Gestión de Administración Fudo: Admin le rechaza los datos fiscales actuales para que el cliente pueda ingresar el nuevo punto de venta en Fudo.",
      "El cliente carga el nuevo número de punto de venta en Fudo.",
      "Administración verifica los nuevos datos cargados y aprueba la configuración fiscal.",
    ],
    clientMessage: "Este error aparece porque hubo una recategorización en tu condición fiscal en ARCA y el Punto de Venta actual ya no está habilitado bajo la modalidad requerida.\n\n👉 Pasos para solucionarlo:\n1️⃣ Ingresá a la web de ARCA con CUIT y Clave Fiscal ➡️ 'Administración de Puntos de Venta y Domicilios'.\n2️⃣ Creá un nuevo Punto de Venta seleccionando la opción: 'RECE para aplicativos y webservices'.\n3️⃣ Descargá la constancia de alta del nuevo punto de venta y envíala a admin@fu.do.\n4️⃣ Nuestro equipo de Administración rechazará la configuración anterior en Fudo para que puedas ingresar el nuevo punto de venta, y luego verificarán y aprobarán los datos para volver a facturar normalmente 😊",
    requiresDerivation: true,
    derivationTarget: "Facturación",
  },
  {
    id: "arg-domicilio-fiscal",
    countryId: "argentina",
    entity: "ARCA",
    category: "validacion_cliente",
    title: "No autorizado a emitir comprobantes - Inconvenientes en el domicilio fiscal",
    errorSnippet: "NO AUTORIZADO A EMITIR COMPROBANTES - LA CUIT INFORMADA REGISTRA INCONVENIENTES EN EL DOMICILIO FISCAL",
    rootCause: "ARCA tiene registrada una observación, requerimiento pendiente o traba en el Domicilio Fiscal Electrónico (DFE) del contribuyente, bloqueando la autorización de comprobantes con CAE.",
    solutionSteps: [
      "Ingresar a la página web de ARCA con CUIT y Clave Fiscal.",
      "Entrar en el servicio: 'Domicilio Fiscal Electrónico'.",
      "Ir a la 'Bandeja de Entrada' y buscar las notificaciones o intimaciones de ARCA relacionadas con el domicilio fiscal.",
      "Regularizar la observación (confirmar email/teléfono de contacto o actualizar datos del domicilio fiscal).",
      "Una vez subsanado en ARCA, el bloqueo se levantará automáticamente y se podrá volver a facturar desde Fudo.",
    ],
    clientMessage: "Este aviso indica que ARCA tiene registrada una observación o traba en tu domicilio fiscal que impide la emisión de comprobantes.\n\n👉 Pasos para regularizarlo:\n1️⃣ Ingresá a la web de ARCA con tu CUIT y Clave Fiscal.\n2️⃣ Dirígete al servicio ➡️ 'Domicilio Fiscal Electrónico' y abrí tu 'Bandeja de Entrada'.\n3️⃣ Buscá las notificaciones de ARCA relacionadas con el inconveniente en tu domicilio fiscal y confirma los datos requeridos.\n4️⃣ Una vez resuelta la observación en ARCA, el bloqueo se levantará automáticamente para emitir facturas en Fudo 😊",
    requiresDerivation: false,
  },
  {
    id: "arg-intermitencias-arca",
    countryId: "argentina",
    entity: "ARCA",
    category: "servidor_sistema",
    title: "Error al emitir el comprobante, aguarde unos instantes y vuelva a intentarlo",
    errorSnippet: "OCURRIÓ UN ERROR AL EMITIR EL COMPROBANTE, AGUARDE UNOS INSTANTES Y VUELVA A INTENTARLO.",
    rootCause: "Intermitencias, saturación o caída temporal en los servidores de ARCA Web Services (WSFE), ajenas a Fudo. El equipo de soporte debe verificar en tiempo real si hay reportes de caída en Downdetector.",
    solutionSteps: [
      "Como soporte, verificar en tiempo real si hay intermitencias o caída de servidores en: https://downdetector.com.ar/problemas/afip/",
      "Si se confirman intermitencias en ARCA, responderle al cliente con el mensaje oficial indicando la caída de los servidores.",
      "Para emitir nuevamente una vez normalizado el servicio: ingresar a 'Ventas' > 'Ventas cerradas', abrir la venta deseada y hacer clic en 'Emitir factura electrónica'.",
    ],
    clientMessage: "En este momento los servidores de ARCA se encuentran caídos, lo que ocasiona errores al intentar emitir factura. Esto es algo ajeno a Fudo, pero entendemos lo frustrante que puede ser.\n\n👉 Te sugerimos intentarlo nuevamente en unos minutos. Para volver a emitirla, debes ingresar a Ventas ➡️ Ventas cerradas, abrir la venta deseada y hacer clic en 'Emitir factura electrónica'. Gracias por tu paciencia y comprensión 😊",
    requiresDerivation: false,
    portalLink: {
      label: "Downdetector - Estado de ARCA",
      url: "https://downdetector.com.ar/problemas/afip/",
    },
  },
  {
    id: "arg-no-autorizada-clase-a",
    countryId: "argentina",
    entity: "ARCA",
    category: "validacion_cliente",
    title: "No autorizado a emitir comprobantes - CUIT no autorizada a comprobantes Clase 'A'",
    errorSnippet: "NO AUTORIZADO A EMITIR COMPROBANTES - LA CUIT INFORMADA NO SE ENCUENTRA AUTORIZADA A EMITIR COMPROBANTES CLASE 'A'",
    rootCause: "La CUIT del emisor no cuenta con la habilitación en ARCA para emitir facturas Clase A (falta de acreditación de solvencia patrimonial, CBU declarada o cumplimiento de la RG 1575), o pasó a Responsable Inscripto sin completar el trámite de habilitación.",
    solutionSteps: [
      "El cliente (o su contador) debe ingresar a ARCA con CUIT y Clave Fiscal.",
      "Configurar y tramitar la autorización de su CUIT para poder emitir comprobantes Clase 'A'.",
      "Una vez que ARCA apruebe la habilitación de Facturas A, avisar por correo a admin@fu.do indicando que se realizó el cambio.",
      "Administración actualiza la cuenta en Fudo.",
    ],
    clientMessage: "Este error significa que tu CUIT aún no se encuentra autorizada en ARCA para emitir comprobantes Clase 'A'.\n\n👉 Pasos para habilitarlo:\n1️⃣ Desde ARCA deberás configurar tu CUIT para poder emitir estas facturas (te sugerimos consultarlo con tu contador para gestionar la autorización de Facturas A).\n2️⃣ Una vez que ARCA apruebe el trámite, avísanos por correo a admin@fu.do indicando que se realizó el cambio para que actualicemos tu configuración en Fudo 😊",
    requiresDerivation: true,
    derivationTarget: "Facturación",
  },
  {
    id: "arg-no-corresponde-monotributo",
    countryId: "argentina",
    entity: "ARCA",
    category: "validacion_cliente",
    title: "No autorizado a emitir comprobantes - CUIT no corresponde a Responsables Monotributo",
    errorSnippet: "NO AUTORIZADO A EMITIR COMPROBANTES - LA CUIT INFORMADA NO CORRESPONDE A RESPONSABLES MONOTRIBUTO",
    rootCause: "La condición fiscal del contribuyente ante ARCA no coincide con el Monotributo configurado en Fudo (por ejemplo: baja automática por falta de pago, exclusión de pleno derecho o recategorización al Régimen General).",
    solutionSteps: [
      "El error debe ser tratado directamente con el contador del restaurante.",
      "El contador debe revisar el estado del Monotributo frente a ARCA (verificar si hubo baja de oficio, exclusión o recategorización).",
      "Regularizar la situación impositiva en la web de ARCA.",
      "Si pasó a Responsable Inscripto, dar de alta el nuevo punto de venta RECE y avisar a admin@fu.do.",
      "Una vez solucionado ante ARCA, se podrán emitir facturas nuevamente.",
    ],
    clientMessage: "El error mencionado debe ser tratado directamente con tu contador, ya que se trata de un problema relacionado al estado de tu monotributo frente a ARCA (por ejemplo: exclusión, recategorización de oficio o baja automática).\n\n👉 Una vez que tu contador haya regularizado la situación en ARCA, podrás emitir facturas nuevamente 😊",
    requiresDerivation: false,
  },

  // ==========================================
  // MÉXICO (SAT / CFDI 4.0) - Protocolo Oficial Flowchart
  // ==========================================
  {
    id: "mx-nombre-emisor-csd",
    countryId: "mexico",
    entity: "SAT",
    category: "certificados",
    errorCode: "Nombre Emisor vs CSD",
    title: "El campo Nombre del emisor no corresponde con el titular del CSD",
    errorSnippet: "El campo Nombre del emisor no corresponde con el nombre del titular del certificado de sello digital",
    rootCause: "A partir de CFDI 4.0 el SAT valida de forma estricta la razón social del emisor al momento de emitir una factura. Por ejemplo, en un restaurante tenían cargada como razón social 'MITRAL BRANDS MANAGEMENT SA DE CV', pero debe ser 'MITRAL BRANDS MANAGEMENT' (respetando mayúsculas y sin el régimen de capital).",
    solutionSteps: [
      "Ingresar a Fudo en 'Administración' > 'Facturación electrónica'.",
      "Configurar correctamente la razón social en el sistema para que coincida exactamente con la del portal del SAT y con la Constancia de Situación Fiscal (CSF).",
      "Respetar letras MAYÚSCULAS y SIN el régimen de capital (por ejemplo, colocar únicamente 'MITRAL BRANDS MANAGEMENT' y eliminar 'SA DE CV' o 'S.A. de C.V.').",
      "Rellenar nuevamente los campos, guardar los cambios y volver a emitir la factura.",
    ],
    clientMessage: "A partir de CFDI 4.0 el SAT valida estrictamente la razón social del emisor. Si tu razón social tiene agregado el régimen de capital (por ej: 'SA DE CV'), el SAT rechazará el timbrado.\n\n👉 Pasos para solucionarlo:\n1️⃣ Ingresa en Fudo a ➡️ Administración ➡️ Facturación electrónica.\n2️⃣ Edita la Razón Social colocándola en MAYÚSCULAS y SIN el régimen societario (ej: escribe 'MI RESTAURANTE' y no 'MI RESTAURANTE SA DE CV').\n3️⃣ Guarda los cambios y vuelve a emitir la factura 😊",
    requiresDerivation: false,
    warningNote: "A partir del 4.0 ahora se hace una validación de la razón social del emisor al momento de emitir una factura. Por ejemplo, en un restaurante tenían cargada como razón social 'MITRAL BRANDS MANAGEMENT SA DE CV', pero debería ser 'MITRAL BRANDS MANAGEMENT' (respetando mayúsculas y sin el régimen de capital).",
  },
  {
    id: "mx-domicilio-receptor-lugar-expedicion",
    countryId: "mexico",
    entity: "SAT",
    category: "folios_puntos",
    errorCode: "Domicilio Receptor vs Lugar Exp.",
    title: "El campo Domicilio Fiscal Receptor no es igual al valor del campo Lugar Expedición",
    errorSnippet: "Error al timbrar comprobante: El campo DomicilioFiscalReceptor no es igual al valor del campo LugarExpedicion",
    rootCause: "El cliente debe completar el campo 'C.P. del cliente' con el mismo valor que posee en el campo 'C.P. de Exp.' dentro de su configuración en Fudo (requerido para ventas al público en general o cuando el lugar de expedición debe coincidir).",
    solutionSteps: [
      "Verificar en Fudo > 'Administración' > 'Facturación electrónica' el valor del campo 'C.P. de Exp.' (Código Postal de expedición).",
      "Al cargar los datos de la factura en la venta, completar el campo 'C.P. del cliente' con exactamente el mismo valor del 'C.P. de Exp.' de la sucursal.",
      "Guardar los datos de facturación de la venta.",
      "Volver a presionar 'Timbrar comprobante'.",
    ],
    clientMessage: "El error 'El campo DomicilioFiscalReceptor no es igual al valor del campo LugarExpedicion' ocurre porque el código postal del receptor debe coincidir con el código postal de expedición del restaurante.\n\n👉 Pasos para solucionarlo:\n1️⃣ Revisa en Fudo ➡️ Administración ➡️ Facturación electrónica el valor del campo 'C.P. de Exp.'.\n2️⃣ Completa el campo 'C.P. del cliente' con exactamente el mismo valor del 'C.P. de Exp.' configurado en la sucursal.\n3️⃣ Guarda los datos y vuelve a timbrar la factura 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-nombre-receptor-rfc",
    countryId: "mexico",
    entity: "SAT",
    category: "validacion_cliente",
    errorCode: "Nombre Receptor vs RFC",
    title: "El campo Nombre del receptor debe pertenecer al nombre asociado al RFC del receptor",
    errorSnippet: "El campo Nombre del receptor debe pertenecer al nombre asociado al RFC registrado en el campo RFC del receptor",
    rootCause: "Ambos datos deben coincidir con los que figuran en la Cédula de Identificación Fiscal (CIF / CSF) y NO debe incluir el régimen de capital (por ej. S.A. de C.V.). Una letra de diferencia o abreviatura incorrecta causa este rechazo del SAT.",
    solutionSteps: [
      "Ambos datos deben coincidir exactamente con los que figuran en la Cédula de Identificación Fiscal (CSF) del cliente.",
      "Para verificar estos datos y colocar los correctos, ingresar en el portal del SAT > Recuperación de Certificados > Consulta certificados.",
      "Ingresar el RFC que se quiere verificar.",
      "Corroborar que los datos de RFC y Razón Social sean los mismos que se vayan a ingresar (en MAYÚSCULAS y sin el régimen de capital como SA de CV).",
      "Regresar a Fudo y generar la factura nuevamente con los datos correctos.",
    ],
    clientMessage: "El SAT rechaza la factura porque el Nombre o Razón Social no coincide con el RFC registrado ante el SAT.\n\n👉 Puntos a verificar:\n➡️ El nombre debe coincidir exactamente con la Constancia de Situación Fiscal (CSF) en MAYÚSCULAS.\n➡️ En personas morales (empresas), NO se debe incluir el régimen de capital (por ej: no colocar 'S.A. de C.V.').\n➡️ Puedes consultar el nombre oficial asociado al RFC en el portal del SAT ➡️ Recuperación de Certificados, corregirlo en Fudo y volver a timbrar 😊",
    requiresDerivation: false,
    portalLink: {
      label: "Portal SAT - Consulta Certificados",
      url: "https://www.sat.gob.mx",
    },
  },
  {
    id: "mx-error-isr",
    countryId: "mexico",
    entity: "SAT",
    category: "impuestos",
    errorCode: "Error: ISR - [México]",
    title: "Error: ISR - [México] (Facturación con cobro o retención de ISR)",
    errorSnippet: "Error: ISR - [México]",
    rootCause: "Esto sucede cuando el cliente desea emitir una factura con comensal al que corresponde cobrarle o retenerle el impuesto del ISR (Impuesto sobre la Renta). Actualmente Fudo no cuenta con la funcionalidad necesaria para realizar este tipo de retención/cobro impositivo.",
    solutionSteps: [
      "Identificar si la factura que se intenta emitir requiere cobro o retención de ISR.",
      "Explicar al comensal o contador que actualmente Fudo no cuenta con la funcionalidad impositiva para procesar retenciones de ISR.",
      "El cliente deberá emitir una factura independiente de Fudo (directamente desde el portal del SAT o software contable externo) si desea cobrar/retener el impuesto del ISR.",
      "En Fudo, registrar la comanda como cobrada normalmente para el cierre de caja.",
    ],
    clientMessage: "Este aviso aparece cuando se intenta emitir una factura con retención o cobro de ISR (Impuesto sobre la Renta).\n\n👉 Ten en cuenta:\n➡️ Actualmente Fudo no cuenta con la funcionalidad para retenciones de ISR.\n➡️ Si necesitas emitir una factura con este impuesto específico, deberás emitirla de manera independiente directamente a través del portal del SAT.\n➡️ En Fudo puedes registrar el cobro de la venta normalmente para el cierre de caja 😊",
    requiresDerivation: false,
    warningNote: "Esto sucede cuando el cliente desea emitir una factura con comensal al que corresponde cobrarle el impuesto del ISR (impuesto sobre la Renta), sin embargo, actualmente Fudo no cuenta con la funcionalidad necesaria para realizar este tipo de cobro. Deberá emitir una factura independiente de Fudo si desea cobrar el impuesto del ISR.",
  },
  {
    id: "mx-302-regimen-persona-fisica",
    countryId: "mexico",
    entity: "SAT",
    category: "validacion_cliente",
    errorCode: "[302] RegimenFiscalR Física",
    title: "[302] El régimen fiscal que seleccionaste no corresponde a una persona física",
    errorSnippet: "[302] La clave del campo RegimenFiscalR debe corresponder con el tipo de persona (física o moral). Valores esperados: 605 | 606 | 607 | 608 | 610 | 611 | 614 | 615.",
    rootCause: "El régimen fiscal seleccionado para el receptor no corresponde a una persona física de acuerdo al catálogo c_RegimenFiscal del SAT.",
    solutionSteps: [
      "El régimen fiscal que seleccionaste no corresponde a una persona física.",
      "Verifica en tu Constancia de Situación Fiscal cuál es tu régimen y selecciónalo nuevamente.",
      "Los regímenes para personas físicas incluyen: 605 (Sueldos y Salarios), 606 (Arrendamiento), 607, 608, 610, 611, 612 (Actividades Empresariales), 614, 615 y 626 (RESICO Físicas), entre otros.",
      "Actualizar el régimen en Fudo o en el portal de autofacturación y volver a emitir.",
    ],
    clientMessage: "El régimen fiscal seleccionado no corresponde a una persona física según los catálogos del SAT.\n\n👉 Pasos para corregirlo:\n1️⃣ Verifica en tu Constancia de Situación Fiscal cuál es tu régimen exacto.\n2️⃣ Los regímenes para personas físicas incluyen: 605, 606, 607, 608, 610, 611, 612, 614, 615 y 626.\n3️⃣ Actualiza el régimen en la comanda o en autofacturación y vuelve a emitir 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-302-regimen-persona-moral",
    countryId: "mexico",
    entity: "SAT",
    category: "validacion_cliente",
    errorCode: "[302] RegimenFiscalR Moral",
    title: "[302] El régimen fiscal que seleccionaste no corresponde a una persona moral",
    errorSnippet: "[302] La clave del campo RegimenFiscalR debe corresponder con el tipo de persona (física o moral). Valores esperados: 601 | 603 | 610 | 620 | 622 | 623 | 624 y 626.",
    rootCause: "El régimen fiscal seleccionado para el receptor no corresponde a una persona moral (empresa) según la matriz del SAT.",
    solutionSteps: [
      "El régimen fiscal que seleccionaste no corresponde a una persona moral.",
      "Verifica en tu Constancia de Situación Fiscal cuál es tu régimen societario y selecciónalo nuevamente.",
      "Los regímenes para personas morales incluyen: 601 (General de Ley Personas Morales), 603 (Personas Morales con Fines no Lucrativos), 610, 620, 622, 623, 624 y 626 (RESICO Moral).",
      "Actualizar el régimen en la ficha del cliente y reintentar la emisión.",
    ],
    clientMessage: "El régimen fiscal seleccionado no corresponde a una persona moral según la matriz del SAT.\n\n👉 Pasos para corregirlo:\n1️⃣ Verifica en la Constancia de Situación Fiscal de la empresa cuál es el régimen registrado.\n2️⃣ Los regímenes para personas morales incluyen: 601, 603, 610, 620, 622, 623, 624 y 626.\n3️⃣ Actualiza el régimen societario en Fudo y vuelve a emitir 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-302-uso-cfdi-invalido",
    countryId: "mexico",
    entity: "SAT",
    category: "validacion_cliente",
    errorCode: "[302] UsoCFDI no válido",
    title: "[302] El 'Uso de CFDI' seleccionado no es una opción válida",
    errorSnippet: "[302] El campo UsoCFDI no contiene un valor de catalogo c_UsoCFDI. The UsoCFDI attribute is invalid",
    rootCause: "El 'Uso de CFDI' seleccionado no es una opción válida en el catálogo oficial c_UsoCFDI del SAT.",
    solutionSteps: [
      "El 'Uso de CFDI' seleccionado no es una opción válida.",
      "Por favor selecciona una opción válida del listado oficial del SAT.",
      "Si no sabes cuál corresponde a tu caso, elige 'Gastos en general' (G03) o 'Sin efectos fiscales' (S01).",
      "Guardar y reintentar el timbrado.",
    ],
    clientMessage: "El 'Uso de CFDI' seleccionado no es una opción válida dentro del catálogo c_UsoCFDI del SAT.\n\n👉 Pasos a seguir:\n➡️ Selecciona una clave válida del listado oficial.\n➡️ Si no sabes cuál corresponde a tu caso, elige 'Gastos en general' (G03) o 'Sin efectos fiscales' (S01).\n➡️ Guarda los cambios y vuelve a timbrar la factura 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-302-uso-cfdi-incompatible",
    countryId: "mexico",
    entity: "SAT",
    category: "validacion_cliente",
    errorCode: "[302] UsoCFDI incompatible",
    title: "[302] El 'Uso del CFDI' que seleccionaste no es compatible con tu régimen",
    errorSnippet: "[302] La clave del campo UsoCFDI debe corresponder con el tipo de persona (física o moral) y el régimen correspondientes conforme al catalogo c_UsoCFDI.",
    rootCause: "El 'Uso del CFDI' que seleccionaste no es compatible con tu régimen de contribuyente. Algunos usos solo aplican para personas físicas y otros para personas morales.",
    solutionSteps: [
      "El 'Uso del CFDI' que seleccionaste no es compatible con tu régimen de contribuyente.",
      "Algunos usos solo aplican para personas físicas y otros para personas morales.",
      "Si no estás seguro/a elige 'Gastos en general (G03)' o 'Sin efectos fiscales (S01)', que es válido para la mayoría de los casos.",
      "Actualizar el Uso de CFDI en Fudo o en el portal de autofacturación y volver a emitir.",
    ],
    clientMessage: "El 'Uso del CFDI' seleccionado no es compatible con el régimen tributario del receptor ante el SAT.\n\n👉 Pasos a seguir:\n➡️ Algunos usos solo aplican para personas físicas y otros para personas morales.\n➡️ Si no estás seguro/a de cuál elegir, selecciona 'Gastos en general (G03)', que es válido para la gran mayoría de los casos.\n➡️ Actualiza el campo en Fudo o autofacturación y vuelve a timbrar 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-302-codigo-postal-domicilio",
    countryId: "mexico",
    entity: "SAT",
    category: "validacion_cliente",
    errorCode: "[302] C.P. DomicilioFiscalReceptor",
    title: "[302] El código postal que ingresaste no coincide con tu RFC en el SAT",
    errorSnippet: "[302] El campo DomicilioFiscalReceptor del receptor debe encontrarse en la lista de RFC inscritos no cancelados en el SAT.",
    rootCause: "El código postal que ingresaste no coincide con tu RFC en el padrón del SAT.",
    solutionSteps: [
      "El código postal que ingresaste no coincide con tu RFC en el SAT.",
      "Asegúrate de ingresar el código postal de tu domicilio fiscal — el que aparece en tu Constancia de Situación Fiscal vigente — y no el de tu domicilio personal o de entrega.",
      "Verificar que no tenga espacios ni letras.",
      "Modificar el Código Postal en Fudo y volver a timbrar.",
    ],
    clientMessage: "El código postal ingresado no coincide con el registrado para tu RFC en la base de datos del SAT.\n\n👉 Pasos para corregirlo:\n1️⃣ Revisa tu Constancia de Situación Fiscal vigente.\n2️⃣ Ingresa el código postal de tu domicilio fiscal exacto (no uses el domicilio personal ni el de entrega).\n3️⃣ Verifica que no tenga espacios ni letras y vuelve a timbrar 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-302-rfc-receptor-invalido",
    countryId: "mexico",
    entity: "SAT",
    category: "validacion_cliente",
    errorCode: "[302] RFC receptor no existe / baja",
    title: "[302] El RFC que ingresaste no es válido o no existe en la lista del SAT",
    errorSnippet: "[302] Este RFC del receptor no existe en la lista de RFC inscritos no cancelados del SAT.",
    rootCause: "El RFC que ingresaste no es válido o no existe o está dado de baja en el SAT.",
    solutionSteps: [
      "El RFC que ingresaste no es válido o no existe en la lista del SAT.",
      "Verifica que sean exactamente 12 caracteres (personas morales) o 13 caracteres (personas físicas), incluyendo la homoclave al final (Ejemplo: GOMU830101AB2).",
      "Revisa que hayas escrito tu RFC correctamente, sin espacios ni caracteres de más.",
      "Si el RFC es correcto y el error persiste, es posible que tu registro en el SAT esté cancelado o suspendido. Consulta tu situación en sat.gob.mx.",
    ],
    clientMessage: "El RFC que ingresaste no existe, no es válido o está suspendido en la lista de contribuyentes del SAT.\n\n👉 Puntos a verificar:\n➡️ Revisa que sean exactamente 12 caracteres (personas morales) o 13 caracteres (personas físicas), incluyendo la homoclave final (ejemplo: GOMU830101AB2).\n➡️ Asegúrate de escribirlo sin espacios ni guiones.\n➡️ Si el RFC es correcto y el error persiste, consulta tu situación fiscal en sat.gob.mx para verificar si está cancelado o suspendido 😊",
    requiresDerivation: false,
    portalLink: {
      label: "Portal del SAT (sat.gob.mx)",
      url: "https://www.sat.gob.mx",
    },
  },
  {
    id: "mx-302-nombre-receptor-autofacturacion",
    countryId: "mexico",
    entity: "SAT",
    category: "validacion_cliente",
    errorCode: "[302] Nombre receptor no coincide",
    title: "[302] El nombre que ingresaste no coincide con tu RFC en el SAT",
    errorSnippet: "[302] El campo Nombre del receptor debe pertenecer al nombre asociado al RFC registrado en el campo Rfc del Receptor.",
    rootCause: "El nombre que ingresaste no coincide con tu RFC en el SAT. Una letra de diferencia o una abreviatura incorrecta (ej. 'S.A.' en lugar de 'SA DE CV') causa este error.",
    solutionSteps: [
      "El nombre que ingresaste no coincide con tu RFC en el SAT.",
      "Verifica que el nombre o razón social esté escrito exactamente igual que en su Constancia de Situación Fiscal (en MAYÚSCULAS).",
      "Recordar: En CFDI 4.0 el SAT exige no incluir el régimen societario en personas morales (eliminar 'S.A. de C.V.', 'S de RL', etc.).",
      "Corregir el nombre en el portal de autofacturación o en Fudo y volver a timbrar.",
    ],
    clientMessage: "El nombre o razón social que ingresaste no coincide con tu RFC en el SAT.\n\n👉 Pasos para solucionarlo:\n1️⃣ Revisa tu Constancia de Situación Fiscal.\n2️⃣ Escribe el nombre o razón social exactamente igual (en MAYÚSCULAS).\n3️⃣ Para personas morales, elimina el régimen de capital (por ej: omitir 'S.A. de C.V.').\n4️⃣ Actualiza los datos en el portal de autofacturación y vuelve a emitir 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-302-csd-emisor-vencido",
    countryId: "mexico",
    entity: "SAT",
    category: "certificados",
    errorCode: "[302] CSD Emisor Vencido",
    title: "[302] Certificado de facturación del restaurante vencido o inactivo",
    errorSnippet: "[302] La fecha de emisión no está dentro de la vigencia del CSD del Emisor / No hay certificados activos para el RFC",
    rootCause: "No fue posible emitir tu factura porque el certificado de facturación del restaurante está vencido o no hay certificados activos para el RFC. Este error no fue causado por los datos que ingresó el cliente.",
    solutionSteps: [
      "No fue posible emitir tu factura porque el certificado de facturación del restaurante está vencido.",
      "Este error no fue causado por los datos que ingresaste. Por favor contacta directamente al restaurante para que lo resuelvan.",
      "Acción para el restaurante: Ingresar a CertiSAT Web y renovar el Certificado de Sello Digital (CSD) mediante la aplicación Certifica del SAT.",
      "Cargar el nuevo archivo .cer, .key y contraseña en Fudo > Administración > Facturación electrónica.",
    ],
    clientMessage: "No fue posible emitir tu factura porque el certificado CSD de facturación del restaurante se encuentra vencido o inactivo ante el SAT.\n\n👉 Ten en cuenta:\n➡️ Este error no fue causado por los datos que ingresaste.\n➡️ Nuestro equipo ya se encuentra renovando el certificado CSD a través de la plataforma Certifica del SAT para emitir tu comprobante a la brevedad 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-rfc-credenciales-acceso",
    countryId: "mexico",
    entity: "SAT",
    category: "certificados",
    errorCode: "RFC vs Credenciales CSD",
    title: "El RFC no está asociado con sus credenciales de acceso",
    errorSnippet: "El RFC no está asociado con sus credenciales de acceso, Usuario [CSD] RFC [RFC]",
    rootCause: "No fue posible emitir tu factura porque el restaurante tiene un problema con su configuración de acceso al SAT. Los archivos del Certificado de Sello Digital (.cer / .key) no corresponden al RFC configurado en Fudo.",
    solutionSteps: [
      "No fue posible emitir tu factura porque el restaurante tiene un problema con su configuración de acceso al SAT.",
      "Este error no fue causado por los datos que ingresaste.",
      "Por favor contacta directamente al restaurante para que revisen sus credenciales de facturación.",
      "Acción para el restaurante: ingresar a Fudo en 'Administración' > 'Facturación electrónica' y asegurarse de que el archivo .cer y .key pertenezcan al RFC registrado en el sistema.",
      "Guardar las credenciales correctas y reintentar la emisión.",
    ],
    clientMessage: "No fue posible emitir tu factura porque el restaurante tiene un problema con su configuración de acceso al SAT (los archivos cargados no corresponden al RFC del sistema).\n\n👉 Ten en cuenta:\n➡️ Este error no fue provocado por los datos ingresados en la venta o autofacturación.\n➡️ Ya estamos revisando la configuración de los archivos .cer y .key en Fudo para resolverlo y timbrar tu comprobante 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-302-rfc-emisor-no-lco",
    countryId: "mexico",
    entity: "SAT",
    category: "servidor_sistema",
    errorCode: "[302] RFC no activo en LCO",
    title: "[302] Tu RFC no está activo en el padrón de contribuyentes del SAT (LCO)",
    errorSnippet: "[302] RFC del emisor no se encuentra en el régimen de contribuyentes (Lista de validación de régimen) LCO.",
    rootCause: "Tu RFC no está activo en el padrón de contribuyentes del SAT. Esto puede ocurrir si tu actividad fiscal está suspendida o dada de baja.",
    solutionSteps: [
      "Tu RFC no está activo en el padrón de contribuyentes del SAT.",
      "Esto puede ocurrir si tu actividad fiscal está suspendida o dada de baja.",
      "Verifica la situación fiscal en sat.gob.mx o consulta directamente con tu contador para activar el RFC en la lista LCO.",
      "Una vez regularizado el estatus ante el SAT, se podrán volver a emitir facturas normalmente.",
    ],
    clientMessage: "Tu RFC no está activo en el padrón de contribuyentes del SAT (Lista LCO). Esto ocurre si la actividad fiscal fue suspendida o dada de baja.\n\n👉 Pasos a seguir:\n➡️ Verifica tu situación fiscal en sat.gob.mx o consúltalo con tu contador para reactivar el estatus en la lista LCO.\n➡️ Una vez regularizado ante el SAT, podrás volver a emitir facturas con normalidad 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-302-franja-fronteriza",
    countryId: "mexico",
    entity: "SAT",
    category: "impuestos",
    errorCode: "[302] IVA 8% Franja Fronteriza",
    title: "[302] El código postal que ingresaste no corresponde a una zona de Franja Fronteriza",
    errorSnippet: "[302] Error no clasificado, El impuesto de franja fronteriza no es válido debido a que el código postal no tiene la marca de Estimulo Franja Fronteriza.",
    rootCause: "El código postal que ingresaste no corresponde a una zona de Franja Fronteriza. Este restaurante aplica la tasa de IVA de 8% (Franja Fronteriza), pero tu código postal fiscal no está dentro de esa región.",
    solutionSteps: [
      "El código postal que ingresaste no corresponde a una zona de Franja Fronteriza.",
      "Este restaurante aplica la tasa de IVA de 8% (Franja Fronteriza), pero tu código postal fiscal no está dentro de esa región autorizada por el SAT.",
      "Verifica que el código postal que ingresas sea el mismo que aparece en tu Constancia de Situación Fiscal.",
      "Si el cliente tributa fuera de la franja fronteriza, consultar con el restaurante para regularizar la emisión.",
    ],
    clientMessage: "El código postal que ingresaste no corresponde a una zona autorizada de Franja Fronteriza.\n\n👉 Ten en cuenta:\n➡️ Este restaurante aplica la tasa preferencial de IVA del 8% (Estímulo Franja Fronteriza), pero tu código postal fiscal no pertenece a esa región.\n➡️ Verifica que el código postal que ingresas sea el que figura en tu Constancia de Situación Fiscal 😊",
    requiresDerivation: false,
  },
  {
    id: "mx-302-nombre-emisor-autofacturacion",
    countryId: "mexico",
    entity: "SAT",
    category: "servidor_sistema",
    errorCode: "[302] Nombre Emisor Autofacturación",
    title: "[302] No fue posible emitir por problema en la configuración del restaurante",
    errorSnippet: "[302] El campo Nombre del emisor debe pertenecer al nombre asociado al RFC registrado en el campo Rfc del Emisor.",
    rootCause: "No fue posible emitir tu factura por un problema en la configuración del restaurante. Este error no fue causado por los datos que ingresaste. (En autofacturación el restaurante debe cambiar sus datos en Fudo).",
    solutionSteps: [
      "No fue posible emitir tu factura por un problema en la configuración del restaurante.",
      "Este error no fue causado por los datos que ingresaste. Por favor contacta directamente al restaurante para que puedan corregirlo y emitirte la factura.",
      "Acción para el restaurante: ingresar a Fudo en Administración > Facturación electrónica y ajustar la Razón Social para que coincida letra por letra con su CSF ante el SAT.",
    ],
    clientMessage: "No fue posible emitir tu factura en el portal de autofacturación por un problema en la configuración del restaurante.\n\n👉 Ten en cuenta:\n➡️ Este error no fue causado por los datos que ingresaste.\n➡️ Ya estamos avisando a la administración del restaurante para que actualice su Razón Social en Fudo (en mayúsculas y sin régimen de capital) para emitir tu factura 😊",
    requiresDerivation: false,
    warningNote: "Esto ok si es autofacturación porque debe de cambiar los datos el restaurante en su módulo de Facturación Electrónica en Fudo.",
  },
  {
    id: "mx-302-error-calculo-impuestos",
    countryId: "mexico",
    entity: "SAT",
    category: "impuestos",
    errorCode: "[302] Error cálculo impuestos",
    title: "[302] No fue posible emitir tu factura por un error en el cálculo de impuestos del sistema",
    errorSnippet: "[302] El valor del campo Importe que corresponde a Traslado no se encuentra dentro del límite inferior y superior permitido",
    rootCause: "No fue posible emitir tu factura por un error en el cálculo de impuestos del sistema (límite inferior/superior de redondeo en el traslado). Este error no fue causado por los datos que ingresaste.",
    solutionSteps: [
      "No fue posible emitir tu factura por un error en el cálculo de impuestos del sistema.",
      "Este error no fue causado por los datos que ingresaste. Por favor contacta directamente al restaurante para que lo resuelvan.",
      "Acción para el restaurante: revisar en Fudo la venta afectada, desgloses de IVA o IEPS de los productos, o posibles productos en $0 o descuentos no redondeados.",
      "Reajustar la comanda y volver a timbrar la factura.",
    ],
    clientMessage: "No fue posible emitir tu factura por un error en el cálculo de impuestos del sistema (límites de redondeo en el traslado de IVA o IEPS).\n\n👉 Ten en cuenta:\n➡️ Este error no fue causado por los datos que ingresaste.\n➡️ Nuestro equipo técnico ya está ajustando los decimales en la comanda para timbrar el comprobante a la brevedad 😊",
    requiresDerivation: false,
  },

  // ==========================================
  // COLOMBIA (DIAN) - Protocolo Oficial Flowchart
  // ==========================================
  {
    id: "col-parametro-invoice-items",
    countryId: "colombia",
    entity: "DIAN",
    category: "servidor_sistema",
    errorCode: "invoice/items{x}/x",
    title: "El parámetro invoice/items{x}/x - Tildes o caracteres raros en productos",
    errorSnippet: "El parametro invoice/items{x}/x",
    rootCause: "Revisar tildes y caracteres raros (no alfanuméricos) dentro del nombre o código de los productos de la venta.",
    solutionSteps: [
      "Revisar los productos incluidos dentro de la venta o comanda que arroja el error.",
      "Verificar tildes y caracteres raros (no alfanuméricos como $, %, &, #, comillas o signos especiales) dentro del nombre o código de los productos de la venta.",
      "Ingresar en Fudo a 'Administración' > 'Productos'.",
      "Editar el nombre y el código de los productos para eliminar cualquier tilde (á, é, í, ó, ú), eñes (ñ) o caracteres no alfanuméricos.",
      "Guardar las modificaciones en cada producto.",
      "Volver a la venta y presionar nuevamente 'Emitir factura'.",
    ],
    clientMessage: "Este error se presenta porque uno o más productos de la venta contienen tildes o caracteres especiales (no alfanuméricos) en su nombre o código, los cuales no son admitidos por la plataforma de la DIAN.\n\n👉 Pasos para corregirlo:\n1️⃣ Revisa los productos incluidos dentro de la venta.\n2️⃣ Ingresa a Fudo en ➡️ Administración ➡️ Productos y edítalos quitando tildes, eñes y signos especiales.\n3️⃣ Guarda los cambios en cada producto y vuelve a emitir la factura 😊",
    requiresDerivation: false,
  },
  {
    id: "col-no-range-key-registered",
    countryId: "colombia",
    entity: "DIAN",
    category: "folios_puntos",
    errorCode: "No range key registered in La Factura",
    title: "No range key registered in La Factura (Primera emisión o renovación)",
    errorSnippet: "No range key registered in La Factura",
    rootCause: "No hay una clave de rango registrada en la factura. El procedimiento varía según si es la primera vez que el cliente emite una factura o si ya emitía previamente.",
    decisionTree: {
      question: "¿Es la primera vez que el cliente emite una factura?",
      branches: [
        {
          id: "primera-vez",
          label: "SÍ (Primera emisión del cliente)",
          summary: "Si es la primera emisión del cliente y aparece el error, se deriva al ejecutivo para la activación.",
          badgeText: "Derivar a Ejecutivo Comercial",
          badgeType: "derivation",
          derivationTarget: "Comercial",
          note: "Derivar al ejecutivo comercial / onboarding asignado para realizar la activación técnica.",
          clientMessage: "Al ser tu primera emisión de facturación electrónica en Fudo, este aviso indica que aún está pendiente la activación técnica del rango.\n\n👉 Ya estamos derivando tu caso con tu ejecutivo de cuenta para completar la activación técnica de inmediato 😊",
        },
        {
          id: "ya-emitia",
          label: "NO (El cliente emitía previamente)",
          summary: "Si el cliente emitía previamente, y aparece, el cliente debe renovar la resolución.",
          badgeText: "Renovación en DIAN (Soporte N1 / Cliente)",
          badgeType: "success",
          note: "Para actualizar la Resolución de Facturación Electrónica por vencimiento de rango o fecha, si no hubo saltos en la numeración entre resoluciones, solo deben seguir estos pasos:",
          steps: [
            "Ingresar a su sesión de la DIAN, al apartado: Facturando electrónicamente (https://catalogo-vpfe.dian.gov.co/User/Login).",
            "En configuración ir a 'Rangos de facturación'.",
            "Eliminar la resolución antigua y asociar la nueva a FUDO.",
            "Con este proceso, la actualización se reflejará automáticamente en tu cuenta.",
          ],
          clientMessage: "Para actualizar la Resolución de Facturación Electrónica por vencimiento de rango o fecha, si no hubo saltos en la numeración entre resoluciones, solo debes seguir estos pasos:\n\n👉 Pasos a seguir:\n1️⃣ Ingresa a tu sesión de la DIAN ➡️ Facturando electrónicamente: https://catalogo-vpfe.dian.gov.co/User/Login\n2️⃣ En el menú 'Configuración' dirígete a 'Rangos de facturación'.\n3️⃣ Elimina la resolución antigua y asocia la nueva a FUDO.\n\n➡️ Con este proceso, la actualización se reflejará automáticamente en tu cuenta 😊",
        },
      ],
    },
    solutionSteps: [
      "Consultar: ¿Es la primera vez que el cliente emite una factura?",
      "SI (Primera emisión): Si es la primera emisión del cliente y aparece el error, se deriva al ejecutivo para la activación.",
      "NO (El cliente emitía previamente): Si el cliente emitía previamente, y aparece, el cliente debe renovar la resolución.",
      "Paso 1 (Renovación DIAN): Ingresar a su sesión de la DIAN, al apartado: Facturando electrónicamente (https://catalogo-vpfe.dian.gov.co/User/Login).",
      "Paso 2: En configuración ir a 'Rangos de facturación'.",
      "Paso 3: Eliminar la resolución antigua y asociar la nueva a FUDO.",
      "Resultado: Con este proceso, la actualización se reflejará automáticamente en tu cuenta de Fudo.",
    ],
    clientMessage: "El error \"No range key registered in La Factura\" indica que no hay una resolución activa asociada:\n\n👉 Si es tu primera emisión: se deriva con tu ejecutivo para la activación de la cuenta.\n\n👉 Si ya emitías previamente (renovación por vencimiento de rango o fecha):\n1️⃣ Ingresa a tu sesión de la DIAN ➡️ Facturando electrónicamente (https://catalogo-vpfe.dian.gov.co/User/Login).\n2️⃣ En configuración ve a 'Rangos de facturación'.\n3️⃣ Elimina la resolución antigua y asocia la nueva a FUDO.\n\n➡️ Con este proceso, la actualización se reflejará automáticamente en tu cuenta 😊",
    requiresDerivation: true,
    derivationTarget: "Comercial",
    portalLink: {
      label: "DIAN - Facturando electrónicamente",
      url: "https://catalogo-vpfe.dian.gov.co/User/Login",
    },
  },
  {
    id: "col-intid",
    countryId: "colombia",
    entity: "DIAN",
    category: "servidor_sistema",
    errorCode: "intID",
    title: "intID - Reutilización de ID ya declarado tras borrado masivo",
    errorSnippet: "intID",
    rootCause: "Normalmente sucede cuando el cliente solicita un borrado masivo, al intentar emitir una factura reutiliza un ID ya declarado. Debe ser derivado con el área de IT directamente (canal Slack #team-invoicing).",
    solutionSteps: [
      "Confirmar si la cuenta del cliente solicitó o tuvo recientemente un borrado masivo de ventas.",
      "Al intentar emitir una factura, el sistema reutiliza un ID ya declarado en la DIAN.",
      "NO intentar refacturar repetidamente la venta para evitar inconsistencias en el correlativo.",
      "Debe ser derivado con el área de IT directamente (canal Slack #team-invoicing).",
      "Indicar en el mensaje de Slack: Nombre del restaurante, ID de cuenta Fudo, ID de venta y comprobante afectado.",
      "Aguardar la regularización del ID por parte de IT antes de emitir la factura nuevamente.",
    ],
    clientMessage: "Este aviso se presenta cuando el sistema intenta utilizar un ID de factura que ya fue declarado ante la DIAN (normalmente ocurre cuando hubo una solicitud de borrado masivo en la cuenta).\n\n👉 Ya estamos derivando tu caso de forma directa con nuestro equipo de IT / Facturación para regularizar el identificador. Apenas nos confirmen que quedó corregido te avisamos para que puedas emitir la factura con total normalidad 😊",
    requiresDerivation: true,
    derivationTarget: "IT (Slack #team-invoicing)",
    derivationChannel: "Canal Slack #team-invoicing",
  },
  {
    id: "col-rango-full",
    countryId: "colombia",
    entity: "DIAN",
    category: "folios_puntos",
    errorCode: "Rango FULL",
    title: "Rango FULL - Venció el rango de la resolución de factura electrónica / Renovar resolución",
    errorSnippet: "ERROR: Rango full",
    rootCause: "Venció el rango de la resolución de factura electrónica (por folios agotados o por vencimiento de fecha de vigencia). El cliente debe renovar la resolución en la DIAN y asociarla a Fudo.",
    dialogScreenshot: {
      type: "error",
      title: "ERROR",
      message: "Rango full",
      buttonText: "Aceptar",
    },
    solutionSteps: [
      "Acceder a la sesión de ustedes de la DIAN en el apartado: Facturando electrónicamente (https://catalogo-vpfe.dian.gov.co/User/Login).",
      "Entrar a la opción de 'Rangos de numeración'.",
      "Buscar nuestro software FUDO y asociar la nueva resolución.",
      "NOTA CRÍTICA: Tomar en cuenta NO tener saltos de numeración de una resolución a otra de lo contrario el sistema no la tomará y deberán notificarnos adelanto de contador.",
    ],
    clientMessage: "El error 'Rango full' significa que venció el rango de tu resolución de factura electrónica (por fecha o por folios agotados) y debes renovarla en la DIAN para seguir emitiendo comprobantes.\n\n👉 Pasos para asociar la nueva resolución a Fudo:\n1️⃣ Accede a tu sesión de la DIAN ➡️ Facturando electrónicamente (https://catalogo-vpfe.dian.gov.co/User/Login).\n2️⃣ Entra a la opción de 'Rangos de numeración'.\n3️⃣ Busca nuestro software FUDO y asocia la nueva resolución.\n\n⚠️ NOTA IMPORTANTE: Tomar en cuenta NO tener saltos de numeración de una resolución a otra, de lo contrario el sistema no la tomará y deberán notificarnos para realizar un 'Adelanto de contador' 😊",
    requiresDerivation: false,
    portalLink: {
      label: "DIAN - Facturando electrónicamente",
      url: "https://catalogo-vpfe.dian.gov.co/User/Login",
    },
    warningNote: "NOTA: TOMAR EN CUENTA NO TENER SALTOS DE NUMERACION DE UNA RESOLUCION A OTRA DE LO CONTRARIO EL SISTEMA NO LA TOMARA Y DEBERAN NOTIFICARNOS ADELANTO DE CONTADOR.",
  },

  // ==========================================
  // CHILE (SII) - Protocolo Oficial Flowchart
  // ==========================================
  {
    id: "cl-rut-no-autorizado-firmar",
    countryId: "chile",
    entity: "SII",
    category: "certificados",
    errorCode: "Rut No autorizado a Firmar",
    title: "Rut No autorizado a Firmar - Enrolamiento y permisos en el SII",
    errorSnippet: "Rut No autorizado a Firmar",
    rootCause: "El RUT configurado como firmante de los documentos tributarios no se encuentra enrolado o autorizado ante el Servicio de Impuestos Internos (SII) para emitir en nombre de la empresa.",
    solutionSteps: [
      "Para resolver este caso, el cliente se tendría que contactar con el SII para regularizar el tema.",
      "El representante legal debe ingresar a www.sii.cl con su RUT y Clave Tributaria.",
      "Ir a 'Servicios online' > 'Factura electrónica' > 'Sistema de facturación de mercado' > 'Administración de usuarios'.",
      "Verificar o enrolar el RUT del firmante para que tenga permisos de firma y emisión de DTE.",
      "Una vez regularizado ante el SII, volver a emitir el documento con normalidad desde Fudo.",
    ],
    clientMessage: "El aviso 'Rut No autorizado a Firmar' indica que el RUT configurado para firmar los comprobantes no se encuentra autorizado en el SII para este contribuyente.\n\n👉 Pasos para resolverlo:\n1️⃣ Ingresa a www.sii.cl con el RUT y Clave Tributaria de la empresa (o contacta al SII).\n2️⃣ Regulariza la autorización del firmante en la sección de administración de usuarios.\n3️⃣ Una vez autorizado en el SII, podrás emitir tus documentos con total normalidad desde Fudo 😊",
    requiresDerivation: false,
    portalLink: {
      label: "Portal oficial SII (www.sii.cl)",
      url: "https://www.sii.cl",
    },
  },
  {
    id: "cl-fe00-codigo-sucursal",
    countryId: "chile",
    entity: "SII",
    category: "folios_puntos",
    errorCode: "Error FE00: Código de sucursal",
    title: "Error FE00: Código de sucursal inválido en Configuración general",
    errorSnippet: "Error FE00: Código de sucursal inválido",
    rootCause: "Este error se produce porque la casilla 'Código de sucursal' en Configuración general > Facturación Electrónica tiene un código inválido. El código de sucursal es de una mayor longitud, nunca será igual a 1 dígito (un código real es por ejemplo 85664523).",
    solutionSteps: [
      "Ingresar a Fudo en 'Configuración general' > 'Facturación Electrónica'.",
      "Revisar la pestaña o campo 'Código de sucursal'.",
      "Verificar el valor cargado: el código de sucursal ante el SII es de una mayor longitud, NUNCA será igual a 1 solo dígito (un código real asignado por el SII es por ejemplo 85664523).",
      "Para corregirlo se debe eliminar el dígito si no corresponde al caso (o cargar el código real de sucursal otorgado por el SII).",
      "Guardar cambios en Fudo y volver a emitir el documento fiscal.",
    ],
    clientMessage: "El 'Error FE00' se produce porque la casilla 'Código de sucursal' en Configuración general ➡️ Facturación Electrónica tiene un código inválido.\n\n👉 Ten en cuenta que el código de sucursal asignado por el SII es de una mayor longitud y nunca será igual a 1 solo dígito (un código real es por ejemplo 85664523).\n\n👉 Pasos para corregirlo:\n1️⃣ Ingresa a Fudo en ➡️ Configuración general ➡️ Facturación Electrónica.\n2️⃣ Revisa la pestaña 'Código de sucursal'.\n3️⃣ Elimina el dígito si no corresponde o coloca el código real otorgado por el SII.\n4️⃣ Guarda los cambios y vuelve a emitir el documento fiscal 😊",
    requiresDerivation: false,
    warningNote: "El código de sucursal es de una mayor longitud, nunca será igual a 1 dígito, este es un código real 85664523, para corregirlo se debe eliminar el dígito si no corresponde al caso (revisar pestaña Código de sucursal) guardar cambios y volver a emitir el documento fiscal.",
  },
  {
    id: "cl-envio-procesado-rut",
    countryId: "chile",
    entity: "SII",
    category: "validacion_cliente",
    errorCode: "Envío procesado: RUT incorrecto",
    title: "Envío procesado - Número de RUT ingresado es incorrecto",
    errorSnippet: "Envio procesado: RUT incorrecto",
    rootCause: "Este error se produce porque el número de RUT ingresado para el receptor del documento es incorrecto o inválido según el padrón del SII.",
    solutionSteps: [
      "Identificar el RUT del cliente o empresa receptora del documento fiscal.",
      "Validar el RUT en el verificador oficial del SII: https://zeus.sii.cl/cvc/stc/stc.html",
      "Comprobar el dígito verificador y que no contenga puntos ni guiones adicionales.",
      "Corregir el número de RUT en la venta o en la ficha del cliente en Fudo.",
      "Volver a emitir (re-emitir) el documento fiscal.",
    ],
    clientMessage: "El aviso 'Envío procesado: RUT incorrecto' se debe a que el número de RUT ingresado en la venta es inválido según los registros del SII.\n\n👉 Puedes validar el RUT oficial del cliente aquí:\n➡️ https://zeus.sii.cl/cvc/stc/stc.html\n\n👉 Una vez corroborado el RUT correcto del receptor, modifícalo en Fudo y vuelve a emitir el documento fiscal 😊",
    requiresDerivation: false,
    portalLink: {
      label: "Validador oficial de RUT (SII)",
      url: "https://zeus.sii.cl/cvc/stc/stc.html",
    },
  },
  {
    id: "cl-error-500-sii",
    countryId: "chile",
    entity: "SII",
    category: "servidor_sistema",
    errorCode: "Error 500",
    title: "Error 500 - Problemas de comunicación o caída temporal del SII",
    errorSnippet: "Error 500: Error de comunicación con el SII",
    rootCause: "Este error se produce por problemas de comunicación con el SII, por ejemplo la página del SII tuvo una caída temporal, eso provocará errores de comunicación generando el error 500 en algunas cuentas.",
    solutionSteps: [
      "Verificar si los servicios web del SII presentan intermitencias o caída generalizada.",
      "Tranquilizar al cliente: la venta queda registrada en Fudo y no se pierde.",
      "Aguardar unos minutos a que el SII restablezca la comunicación con los servidores.",
      "Se debe volver a emitir el documento con normalidad desde Fudo.",
    ],
    clientMessage: "El 'Error 500' se produce por problemas de comunicación momentáneos con el SII (por ejemplo, cuando la página o los servidores del SII presentan una caída o lentitud temporal).\n\n👉 Ten en cuenta:\n➡️ Tu venta se encuentra a salvo guardada en Fudo.\n➡️ Te pedimos aguardar unos minutos a que el SII restablezca la conexión y volver a emitir el documento con normalidad 😊",
    requiresDerivation: false,
    warningNote: "Este error se produce por problemas comunicación con el SII, por ejemplo la página del SII tuvo una caída temporal, eso provocará errores de comunicación generando el error 500 en algunas cuentas. Se debe volver a emitir el documento con normalidad.",
  },
  {
    id: "cl-rechazado-caratula",
    countryId: "chile",
    entity: "SII",
    category: "folios_puntos",
    errorCode: "Rechazado por error en carátula",
    title: "Rechazado por error en carátula: Fecha, resolución o RUT receptor",
    errorSnippet: "Rechazado por error en caratula",
    rootCause: "Generalmente los errores se dan luego de emitir los documentos fiscales y se deben a errores en la información del módulo de facturación (fecha o número de resolución inconsistente) o a un RUT incorrecto de la empresa destinataria de la Factura.",
    solutionSteps: [
      "Revisar fecha de resolución y número de resolución dentro de Fudo > Administración > Facturación Electrónica.",
      "Revisar el RUT de la empresa destinataria de la factura en la venta.",
      "Validar la información oficial de la resolución en el portal del SII.",
      "Corregir los datos en Fudo (fecha de resolución, número de resolución o RUT del cliente).",
      "Volver a emitir el documento fiscal.",
    ],
    clientMessage: "El documento fue 'Rechazado por error en carátula'. Generalmente se debe a inconsistencias en la información del módulo de facturación o a un RUT incorrecto de la empresa destinataria de la factura.\n\n👉 Pasos para solucionarlo:\n1️⃣ Revisa la fecha y número de resolución en Fudo ➡️ Administración ➡️ Facturación Electrónica y compáralos con tu resolución del SII.\n2️⃣ Corrobora que el RUT de la empresa receptora sea correcto.\n3️⃣ Corrige los datos en Fudo y vuelve a emitir el documento fiscal 😊",
    requiresDerivation: false,
    warningNote: "Generalmente los errores se dan luego de emitir los documentos fiscales y se deben a errores en la información del módulo de facturación. Rut incorrecto de la empresa destinataria de la Factura.",
  },
  {
    id: "cl-fe00-no-pudo-emitir",
    countryId: "chile",
    entity: "SII",
    category: "servidor_sistema",
    errorCode: "Error FE00: No se pudo emitir",
    title: "Error FE00: No se pudo emitir el documento SII - [SII] (Flujo de verificación)",
    errorSnippet: "Error FE00: No se pudo emitir el documento SII - [SII]",
    rootCause: "Fallo en la generación o envío del documento al SII debido a descuentos procesados en app móvil, caracteres especiales o emojis en nombres/adiciones, o problemas en la integración.",
    decisionTree: {
      question: "¿Cuál es la característica de la venta afectada?",
      branches: [
        {
          id: "descuentos-movil",
          label: "¿La venta tiene descuentos?",
          summary: "Procura que el descuento se haya realizado desde una computadora y no desde la aplicación móvil.",
          badgeText: "Rehacer descuento desde PC",
          badgeType: "warning",
          steps: [
            "Verificar si la comanda tiene aplicado un descuento.",
            "Si el descuento se cargó desde la app móvil de Fudo, eliminarlo de la venta.",
            "Cargar el descuento nuevamente utilizando una computadora (navegador web).",
            "Reintentar la emisión del documento fiscal.",
          ],
          clientMessage: "Respecto al Error FE00: si la venta tiene un descuento aplicado, por favor asegúrate de haberlo cargado desde una computadora y no desde la aplicación móvil, ya que esto puede generar incompatibilidades en la estructura del comprobante ante el SII.\n\n👉 Luego vuelve a emitir el documento fiscal 😊",
        },
        {
          id: "adiciones-emojis",
          label: "¿Las adiciones tienen caracteres raros o emojis?",
          summary: "Cambiarle el nombre a los productos eliminando emojis y caracteres especiales.",
          badgeText: "Limpiar nombres y adiciones",
          badgeType: "warning",
          steps: [
            "Revisar el detalle de la venta, notas de cocina y nombres de adiciones/modificadores.",
            "Eliminar cualquier emoji, signo especial o carácter raro dentro del nombre del producto o adición.",
            "Guardar los cambios y volver a emitir el documento fiscal.",
          ],
          clientMessage: "El Error FE00 puede generarse por emojis o caracteres especiales no admitidos por el esquema XML del SII en las adiciones o nombres de productos.\n\n👉 Pasos a seguir:\n➡️ Revisa los productos y adiciones de la comanda.\n➡️ Quita cualquier emoji o carácter especial y vuelve a emitir el documento 😊",
        },
        {
          id: "escalar-integracion",
          label: "¿Sucede con una venta o persiste tras validar?",
          summary: "Repórtalo al ejecutivo comercial asignado de la integración.",
          badgeText: "Derivar a Ejecutivo Integración",
          badgeType: "derivation",
          derivationTarget: "Ejecutivo Comercial (Integraciones)",
          note: "Podemos consultar quién está encargado de la integración en el documento interno de asignación.",
          steps: [
            "Si no es por descuentos en móvil ni por emojis en adiciones, identificar el ID de cuenta Fudo y número de venta.",
            "Consultar quién está encargado de la integración en el documento interno.",
            "Reportar el caso al ejecutivo comercial asignado de la integración para su revisión técnica.",
          ],
          clientMessage: "Hemos revisado las posibles inconsistencias de formato (descuentos y caracteres).\n\n👉 Al persistir el Error FE00, estamos escalando tu caso directamente con el ejecutivo comercial encargado de tu integración para que lo revise en detalle. Te avisaremos en cuanto tengamos novedades 😊",
        },
      ],
    },
    solutionSteps: [
      "Verificación 1 (Descuentos): ¿La venta tiene descuentos? Procura que el descuento se haya realizado desde una computadora y no desde la aplicación móvil.",
      "Verificación 2 (Adiciones): ¿Las adiciones tienen algún carácter raro o emojis? Cambiarle el nombre a los productos.",
      "Verificación 3 (Escalamiento): ¿Sucede solamente con una venta o persiste? Repórtalo al ejecutivo comercial asignado de la integración (podemos consultar quién está encargado de la integración en el Doc interno).",
    ],
    clientMessage: "Para resolver el Error FE00 del SII, por favor realiza las siguientes verificaciones:\n\n👉 1️⃣ Si la venta incluye descuentos, asegúrate de aplicarlos desde una computadora y no desde la app móvil.\n👉 2️⃣ Revisa que los nombres de productos y adiciones no contengan emojis ni caracteres raros.\n\n➡️ Si tras estas validaciones el error persiste, escalaremos el caso con tu ejecutivo de integración 😊",
    requiresDerivation: true,
    derivationTarget: "Ejecutivo Comercial (Integraciones)",
  },
  {
    id: "cl-revisar-numero-folios",
    countryId: "chile",
    entity: "SII",
    category: "folios_puntos",
    errorCode: "Revisar número de folios SII",
    title: "Error: Revisar el número de boletas o facturas en el SII - [SII] / Cargar folios",
    errorSnippet: "Error: Revisar el número de boletas o facturas en el SII - [SII]",
    rootCause: "Cuando aparece este mensaje de error, es muy posible que el cliente se haya quedado sin facturas/boletas para emitir. Se deben calcular los folios restantes y descargar/cargar un nuevo archivo XML de folios (CAF) desde el sitio web del SII.",
    solutionSteps: [
      "1. ¿Cómo verificar si se quedó sin folios? El cliente deberá ingresar con el RUT de su empresa al enlace de folios del SII: http://meullin.sii.cl/cvc_cgi/dte/of_solicita_folios",
      "2. Dentro de Fudo, dirigirse a Administración > Facturación Electrónica para ver la cantidad de facturas asignadas por el SII (ej: restar 122 - 59 = 63 asignadas).",
      "3. Identificar el último número emitido desde la sección Ventas (ej: última factura 125; si el rango era de 120 a 300, quedan disponibles 300 - 125 = 175). Mismo procedimiento para boletas.",
      "4. En caso de no tener más boletas/facturas disponibles, seguir el paso a paso de cargar folios (Tutorial YouTube: https://www.youtube.com/watch?v=sjg1SKea_dc):",
      "   a) Ingresar al sitio web del SII y utilizar el certificado digital para acceder.",
      "   b) Solicitar y descargar el archivo XML de folios en el SII.",
      "   c) En Fudo, dirigirse a Configuración > Facturación Electrónica > Folios.",
      "   d) Hacer clic en 'Cargar folios'.",
      "   e) Seleccionar el archivo XML que descargaste desde el SII y subirlo al sistema.",
      "5. Si la carga fue exitosa, el sistema mostrará un mensaje de confirmación y podrás seguir emitiendo documentos electrónicos de manera normal.",
    ],
    clientMessage: "Cuando aparece este mensaje de error, es muy posible que te hayas quedado sin facturas o boletas disponibles para emitir.\n\n👉 Tutorial paso a paso:\n➡️ https://www.youtube.com/watch?v=sjg1SKea_dc\n\n👉 Pasos para cargar nuevos folios:\n1️⃣ Ingresa a www.sii.cl con tu certificado digital y solicita/descarga el archivo XML de folios (CAF).\n2️⃣ En Fudo ve a ➡️ Configuración ➡️ Facturación Electrónica ➡️ Folios.\n3️⃣ Haz clic en 'Cargar folios'.\n4️⃣ Selecciona el archivo XML descargado desde el SII y súbelo al sistema.\n\n➡️ Una vez confirmada la carga, podrás continuar emitiendo normalmente 😊",
    requiresDerivation: false,
    portalLink: {
      label: "Portal SII - Solicitar Folios DTE",
      url: "http://meullin.sii.cl/cvc_cgi/dte/of_solicita_folios",
    },
    videoLink: {
      label: "Video tutorial YouTube: Cargar Folios",
      url: "https://www.youtube.com/watch?v=sjg1SKea_dc",
    },
    warningNote: "Cuando aparece este mensaje de error, es muy posible que el cliente se haya quedado sin facturas/boletas para emitir. En caso de no tener más boletas/facturas disponibles deberá seguir el paso a paso de cargar folios en Fudo.",
  },
  {
    id: "cl-certificado-invalido-expirado",
    countryId: "chile",
    entity: "SII",
    category: "certificados",
    errorCode: "Certificado Digital Inválido",
    title: "Certificado Digital Inválido - ERROR: Expirado o no se puede encontrar (CA)",
    errorSnippet: "Certificado Digital Inválido - ERROR: Expirado o no se puede encontrar el certificado del emisor (CA)",
    rootCause: "Recomiéndale al cliente que verifique la vigencia de su certificado digital, ya que podría estar próximo a vencerse y necesitar renovación.",
    decisionTree: {
      question: "¿Venció el Certificado Digital del firmante?",
      branches: [
        {
          id: "certificado-vencido",
          label: "SÍ (El certificado venció)",
          summary: "Será necesario adquirir uno nuevo. Contactar con su ejecutivo para código promocional con E-Cert y cargar en Fudo.",
          badgeText: "Adquirir nuevo (E-Cert con Ejecutivo)",
          badgeType: "derivation",
          derivationTarget: "Ejecutivo Comercial (Código E-Cert)",
          steps: [
            "Será necesario adquirir un nuevo certificado digital.",
            "Lo ideal es que el cliente se contacte con su ejecutivo comercial de Fudo para que le brinde un código promocional con el proveedor E-Cert.",
            "El cliente puede consultar y elegir el período de validez en: https://www.e-certchile.cl/certificados-digitales/firmas.html",
            "Una vez obtenido el nuevo certificado (.pfx), deberá instalarlo en su computadora.",
            "Luego cargarlo en Fudo a través de la sección de Facturación Electrónica junto con su contraseña.",
            "Probar la emisión de un comprobante.",
          ],
          clientMessage: "Tu certificado digital ha expirado y será necesario adquirir uno nuevo para continuar emitiendo boletas y facturas.\n\n👉 Pasos a seguir:\n1️⃣ Contáctate con tu ejecutivo comercial de Fudo para que te brinde un código promocional con el proveedor E-Cert (https://www.e-certchile.cl/certificados-digitales/firmas.html).\n2️⃣ Una vez que tengas el nuevo certificado, instálalo en tu computadora.\n3️⃣ Cárgalo en Fudo ingresando a ➡️ Facturación Electrónica con su contraseña correspondiente 😊",
        },
        {
          id: "certificado-vigente",
          label: "NO (Aún está vigente)",
          summary: "Escalamiento con Customer Success Chile (fe-chile-customer-success).",
          badgeText: "Escalar a Customer Success Chile",
          badgeType: "derivation",
          derivationTarget: "Customer Success Chile (fe-chile-customer-success)",
          note: "Escalar el caso directamente con el equipo fe-chile-customer-success para revisar las cadenas de confianza de la CA emisora.",
          steps: [
            "Revisar la fecha de caducidad en el visor de certificados de Windows / Mac para confirmar que esté vigente.",
            "Si está vigente y sigue arrojando el error 'no se puede encontrar el certificado del emisor (CA)', escalar el caso con el equipo de fe-chile-customer-success.",
            "Revisar si falta instalar la clave raíz / certificado intermedio de la CA emisora en el servidor o equipo.",
          ],
          clientMessage: "Hemos verificado que tu certificado digital aún se encuentra vigente. Como el sistema del SII no logra reconocer la entidad emisora (CA), ya escalamos tu consulta con nuestro equipo especializado de Customer Success / Soporte Chile para resolverlo a la brevedad 😊",
        },
      ],
    },
    solutionSteps: [
      "Recomiéndale al cliente que verifique la vigencia de su certificado digital en el almacén de certificados de su equipo o con su entidad certificadora.",
      "¿Venció? NO: Si el certificado sigue vigente y arroja el error, realizar escalamiento con el equipo de fe-chile-customer-success.",
      "¿Venció? SÍ: Será necesario adquirir uno nuevo. Para ello, lo ideal es que se contacte con su ejecutivo comercial para que le brinde un código promocional con el proveedor E-Cert (https://www.e-certchile.cl/certificados-digitales/firmas.html).",
      "Una vez obtenido el nuevo certificado, instalarlo en la computadora y cargarlo en Fudo en la sección de Facturación Electrónica con su contraseña.",
      "Volver a emitir los documentos pendientes.",
    ],
    clientMessage: "Este error indica que el Certificado Digital del emisor ha expirado o no es reconocido por el SII.\n\n👉 Si ya venció: será necesario adquirir uno nuevo. Contáctate con tu ejecutivo comercial para que te proporcione un código con descuento promocional en E-Cert (https://www.e-certchile.cl/certificados-digitales/firmas.html). Luego descárgalo y cárgalo en Fudo ➡️ Facturación Electrónica.\n👉 Si verificas que el certificado no ha vencido, avísanos para escalarlo de inmediato con nuestro equipo de Customer Success Chile 😊",
    requiresDerivation: true,
    derivationTarget: "Customer Success Chile / Ejecutivo",
    portalLink: {
      label: "Proveedor E-Cert Chile",
      url: "https://www.e-certchile.cl/certificados-digitales/firmas.html",
    },
  },
];
