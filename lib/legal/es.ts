import { OPERADOR, type Documento } from "./documentos";

/**
 * Termos e política em espanhol — **tradução de referência** (decisão do
 * Otávio, 05/10). A página avisa no topo que a versão que vale é a em
 * português.
 *
 * Segue o texto de `termos.ts` e `privacidade.ts` seção por seção, na mesma
 * ordem e com as mesmas âncoras: mudou lá, muda aqui. "Personal" vira
 * "entrenador" e "aluno" vira "alumno", as palavras da landing em espanhol.
 */
export const TERMOS_ES: Documento = {
  slug: "termos",
  titulo: "Términos de uso",
  resumo:
    "Las reglas de uso de Reps Club: lo que ofrecemos y lo que depende de ti y de tu entrenador.",
  secoes: [
    {
      titulo: "Qué es Reps Club",
      paragrafos: [
        "Una herramienta donde los entrenadores personales arman entrenamientos y los alumnos registran lo que hicieron — carga y repeticiones, serie por serie. También tiene un feed, donde el alumno puede publicar el entrenamiento para su propio entrenador o para los demás alumnos de ese entrenador. Nada más que eso.",
        `El servicio lo opera ${OPERADOR.nome}. Para hablar con nosotros: ${OPERADOR.contato}.`,
      ],
    },
    {
      titulo: "Quién responde por el entrenamiento",
      paragrafos: [
        "**Tu entrenador.** Es quien te evalúa y decide los ejercicios, las cargas y las repeticiones. Reps Club solo guarda y muestra lo que armó — no elige, no sugiere cargas, no corrige la técnica y no reemplaza el acompañamiento presencial.",
        "**Reps Club no es un servicio de salud.** No damos orientación médica, nutricional ni de entrenamiento. Ningún número que se muestra aquí es una recomendación: es el registro de lo que ya pasó.",
        "Antes de empezar o cambiar un programa de ejercicios, consulta a un médico. Si sientes dolor, mareo o cualquier cosa fuera de lo común durante el entrenamiento, para y busca ayuda. Esa decisión es tuya y de quien te acompaña, no de la app.",
      ],
    },
    {
      titulo: "Tu cuenta",
      paragrafos: [
        "El alumno entra por invitación de su entrenador. El entrenador crea su propia cuenta.",
        "La contraseña es tuya y no se presta — quien entra con ella ve y cambia lo que es tuyo. Si sospechas que alguien entró a tu cuenta, cambia la contraseña y avísanos.",
        "Eres responsable de lo que informas. Un dato equivocado en el perfil se convierte en un entrenamiento equivocado.",
      ],
    },
    {
      titulo: "Lo que no está permitido",
      paragrafos: [
        "Usar la cuenta de otra persona, o intentar ver datos de quien no es tu alumno.",
        "Intentar burlar las reglas de acceso del sistema, sobrecargar el servicio o automatizar un uso masivo.",
        "Usar Reps Club para cualquier cosa ilegal, o para prescribir entrenamientos sin estar habilitado para ello.",
        "En el feed: publicar fotos de otra persona sin que lo sepa y lo acepte, desnudos, contenido ofensivo o discriminatorio, publicidad, o prescripción de entrenamientos a quien no es tu alumno.",
        "Las cuentas que hagan cualquiera de estas cosas se cierran, sin aviso previo cuando haya riesgo para otra persona.",
      ],
    },
    {
      titulo: "Tus datos y tu contenido",
      paragrafos: [
        "El entrenamiento que arma tu entrenador es suyo. El historial de lo que hiciste es tuyo. Ninguno de los dos es nuestro: lo guardamos para ustedes, y la política de privacidad explica con quién se comparte.",
        "Dos campos del perfil los escribe **solo el alumno**, y ni el entrenador puede cambiarlos: la meta de peso y el perfil biológico (natural, reposición u hormonizado). No es una regla de pantalla — es la base de datos la que lo rechaza. El perfil biológico es un dato de salud, y registrar una suposición sobre el cuerpo de otra persona como si fuera un hecho es exactamente lo que esta traba impide.",
        "No usamos tu contenido para ningún otro fin, no lo vendemos y no lo publicamos.",
      ],
    },
    {
      titulo: "Lo que publicas en el feed",
      paragrafos: [
        "**La foto y el texto siguen siendo tuyos.** Solo nos das permiso para guardarlos y mostrarlos a quien elegiste en la propia publicación — solo tu entrenador, o también sus demás alumnos. Nada va a internet abierta, y ese permiso termina cuando borras la publicación.",
        "**Respondes por lo que publicas.** Fotos de otra persona, solo con su consentimiento. Esto vale especialmente en el gimnasio, donde aparece gente al fondo del encuadre.",
        `**Solo tú borras tu publicación.** Tu entrenador puede comentar, pero no puede borrarla. Si alguien publica algo que infringe estas reglas, avísanos en ${OPERADOR.contato} — quien opera Reps Club puede retirar el contenido y, si corresponde, cerrar la cuenta.`,
        "**El feed es opcional.** Puedes usar todo Reps Club sin publicar nada y sin abrir nunca la pestaña.",
      ],
    },
    {
      titulo: "Disponibilidad",
      paragrafos: [
        "Reps Club está en fase piloto. Eso significa que puede quedar fuera de línea, cambiar su funcionamiento o perder funciones sin mucho aviso. Hacemos lo posible para no perder lo que registraste, pero no prometemos disponibilidad continua en esta fase.",
        "La app funciona en parte sin internet: las series que confirmas quedan guardadas en el dispositivo y se suben cuando vuelve la señal. Si borras los datos del navegador antes de eso, lo que no se subió se pierde — por eso la app muestra en pantalla cuántas series faltan por enviar.",
      ],
    },
    {
      titulo: "Cerrar la cuenta",
      paragrafos: [
        `Puedes cerrarla cuando quieras: pídeselo a tu entrenador o escribe a ${OPERADOR.contato}. Borramos todo en un plazo de 30 días.`,
        "También podemos cerrar la tuya, con aviso, si el servicio se discontinúa o si no se cumplen estos términos.",
      ],
    },
    {
      titulo: "Límites de nuestra responsabilidad",
      paragrafos: [
        "No respondemos por lesiones, por resultados del entrenamiento ni por decisiones tomadas con base en lo que está en la app — eso es de tu entrenador y tuyo.",
        "Tampoco respondemos por la falta de disponibilidad del servicio en esta fase piloto. Nada de esto elimina los derechos que te garantiza el Código de Defensa del Consumidor de Brasil (Código de Defesa do Consumidor).",
      ],
    },
    {
      titulo: "Cambios y jurisdicción",
      paragrafos: [
        "Si estos términos cambian de forma relevante, te avisamos en la app y pedimos tu aceptación de nuevo. La fecha de la versión está al pie de esta página.",
        "Rige la ley brasileña. Se elige el fuero de tu domicilio para resolver lo que no se pueda resolver conversando.",
      ],
    },
  ],
};

export const PRIVACIDADE_ES: Documento = {
  slug: "privacidade",
  titulo: "Política de privacidad",
  resumo:
    "Qué guarda Reps Club sobre ti, para qué sirve, quién lo ve y cómo pedir que lo borremos.",
  secoes: [
    {
      titulo: "El resumen, en cinco líneas",
      paragrafos: [
        "Guardamos lo que informas al registrarte y lo que registras entrenando. Sirve para armar tu entrenamiento y mostrar tu evolución — nada más.",
        "Tu entrenador ve tus datos. Ningún otro alumno ve tu entrenamiento, tu historial, tu perfil ni tus medidas y fotos de reevaluación.",
        "**La excepción es lo que publicas en el feed**, y solo eso: cada publicación tiene su propia elección de quién la ve — solo tu entrenador, o también sus demás alumnos. Nada de Reps Club va a internet abierta.",
        "No vendemos nada a nadie, no usamos tus datos para anuncios y no entrenamos inteligencia artificial con ellos.",
        `Puedes borrar una publicación al instante, y pedir ver, corregir o borrar todo, en cualquier momento: ${OPERADOR.contato}.`,
      ],
    },
    {
      titulo: "Qué datos recopilamos",
      paragrafos: [
        "**Para crear tu cuenta:** nombre, correo y contraseña. La contraseña se guarda cifrada, y ni nosotros podemos leerla.",
        "**Que informas en el primer acceso:** fecha de nacimiento, peso, altura, objetivo (ganar masa muscular, perder grasa, acondicionamiento o salud) y nivel de experiencia.",
        "**Que puedes informar en tu perfil, si quieres:** teléfono con código de área, ciudad y estado, una meta de peso y si usas alguna terapia hormonal (natural, reposición u hormonizado). **Los cuatro son opcionales y quedan en blanco hasta que los completes** — ninguna pantalla de la app deja de funcionar sin ellos. El teléfono sirve para que tu entrenador hable contigo por WhatsApp, que es donde esa conversación ya ocurre; la meta de peso dibuja la barra de progreso que solo tú y tu entrenador ven. **Esos dos últimos los escribes tú, y solo tú:** la base de datos rechaza la escritura si no viene de tu cuenta, ni siquiera cuando es tu entrenador quien lo intenta.",
        "**Que nace de tu entrenamiento:** los entrenamientos que tu entrenador armó para ti y, en cada serie que registras, la carga, las repeticiones, si saltaste la serie, cuándo empezó y terminó la sesión y cuánto duró.",
        "**Que publicas, si quieres:** foto, texto y comentarios en el feed, además del registro de qué publicaciones te gustaron. Publicar es opcional de principio a fin — puedes usar todo Reps Club sin abrir nunca el feed.",
        "**Que completas en la reevaluación, si quieres:** peso, porcentaje de grasa, medidas de brazo, pecho, cintura, cadera y muslo, una observación tuya, y hasta tres fotos tuyas — de frente, de lado y de espaldas. Tu entrenador habilita el formulario; completarlo es tu elección, campo por campo, y la reevaluación se puede enviar sin ninguna foto.",
        "**Que tu entrenador escribe sobre tu acompañamiento:** en tu ficha tiene un espacio de notas — una lesión, una preferencia de ejercicio, el motivo de una falta, lo que necesite recordar para armar tu próximo entrenamiento. **Esas notas son de tu entrenador y tú no las ves en la app**, igual que la ficha en papel de un entrenador siempre fue suya. Siguen siendo datos sobre ti: si quieres saber lo que está escrito ahí, pregúntale o escribe a " + OPERADOR.contato + ", y las borramos junto con tu cuenta.",
        "**Nada más que eso.** No pedimos documento, dirección completa, tarjeta ni ubicación del dispositivo — la app nunca accede al GPS. El teléfono y la ciudad solo existen si los escribes. No usamos cookies de rastreo ni herramientas de publicidad.",
      ],
    },
    {
      titulo: "Esto es un dato de salud",
      paragrafos: [
        "El peso, la altura y la fecha de nacimiento, junto con lo que levantas, dicen cosas sobre tu cuerpo. Una foto de entrenamiento, más todavía. **Las medidas y las fotos de la reevaluación son el caso más fuerte de todos**: son un retrato de tu cuerpo, hecho para compararse con el de hace tres meses. La ley brasileña (LGPD) llama a esto **dato personal sensible** y exige un cuidado mayor — incluido tu consentimiento explícito, que es lo que das al aceptar esta política en el primer acceso.",
        "**La información sobre terapia hormonal es el caso más directo de esto.** No se deduce de nada: es una pregunta sobre tu salud, y por eso es opcional, queda en blanco por defecto y puede volver a “no informado” en cualquier momento desde tu perfil. La ven tú y tu entrenador, nadie más, y existe por un único motivo — el cuerpo responde distinto al entrenamiento, y quien arma tu entrenamiento decide mejor sabiéndolo. Si prefieres no decirlo, no lo digas: ninguna pantalla lo exige y nada en el producto deja de funcionar.",
        "Un consentimiento dado es un consentimiento que se puede retirar. Si lo retiras, la cuenta se cierra, porque sin estos datos el producto no tiene nada que hacer.",
      ],
    },
    {
      titulo: "La foto del feed",
      paragrafos: [
        "**Tú eliges quién la ve, publicación por publicación**, y la elección aparece en pantalla antes de publicar: “solo tu entrenador” o “tu entrenador y sus demás alumnos”. No existe una opción que envíe la foto más allá de eso. Reps Club no tiene perfil público, no tiene enlace para compartir y no aparece en buscadores.",
        "**Quien lo verifica es la base de datos, no la pantalla.** El permiso del archivo de la foto sigue la misma regla que la publicación: quien no puede ver la publicación no puede abrir la imagen, ni con su dirección en la mano. La foto queda en un almacenamiento cerrado y solo se sirve mediante un enlace temporal, emitido en el momento para quien tiene permiso.",
        "**La foto que sale de tu celular es una copia reducida.** Antes de subirla, la app reduce la imagen y la vuelve a codificar. Eso descarta los metadatos que la cámara guarda con ella — **incluido el lugar donde se tomó la foto**, que nunca nos llega. El archivo original no sale de tu dispositivo.",
        "**La borras cuando quieras**, en la propia pantalla de la publicación. La foto sale de Reps Club y los comentarios se van con ella. Tu entrenador puede comentar tu publicación, pero no puede borrarla.",
        "**No usamos tus fotos para nada más.** No aparecen en promociones, no se muestran a otros entrenadores y no alimentan ningún modelo de inteligencia artificial.",
        "Algo que depende de ti: publicar para el grupo es publicar para personas reales, que pueden ver la imagen en su pantalla. Si una publicación es para quedar entre tú y quien te entrena, elige “solo tu entrenador” — es la opción que ya viene marcada.",
      ],
    },
    {
      titulo: "Las fotos y las medidas de la reevaluación",
      paragrafos: [
        "**Solo tú y tu entrenador.** Ningún otro alumno ve tu reevaluación — ni las medidas, ni las fotos, ni la observación —, y aquí no hay elección de alcance, a diferencia del feed. Una reevaluación **nunca** se convierte en publicación: son pantallas separadas, y nada pasa de una a la otra.",
        "**Quien lo verifica es la base de datos, no la pantalla.** Las fotos quedan en un almacenamiento cerrado, separado del del feed, y solo se sirven mediante un enlace temporal emitido en el momento para ti o para tu entrenador. Quien no es uno de los dos no abre la imagen ni con su dirección en la mano.",
        "**La foto que sale de tu celular es una copia reducida**, como la del feed: la app reduce y vuelve a codificar la imagen antes de subirla, lo que descarta los metadatos de la cámara — **incluido el lugar donde se tomó la foto**. El archivo original no sale de tu dispositivo.",
        "**Borras las fotos cuando quieras**, en la propia pantalla de la reevaluación, incluso después de enviarla. Salen de Reps Club y tu entrenador deja de verlas.",
        `**Los números, una vez enviados, se quedan.** El peso, las medidas y la observación ya no cambian, y es a propósito: existen para compararse con la próxima reevaluación, y un valor reescrito después de leído haría que tu entrenador siguiera una evolución que no ocurrió. Si quieres borrar una reevaluación entera, es un pedido como cualquier otro: escribe a ${OPERADOR.contato}.`,
        "**Completarla es opcional, campo por campo.** Tu entrenador habilita el formulario y ve lo que respondiste; no escribe ninguna medida en tu lugar.",
      ],
    },
    {
      titulo: "Para qué lo usamos",
      paragrafos: [
        "Para que tu entrenador arme y ajuste tu entrenamiento. Para que veas tu historial, tus récords y tu evolución por ejercicio. Para que la app sepa qué entrenamiento sugerir hoy. Para mostrar en el feed lo que publicaste, a quien elegiste. Para comparar tu reevaluación con la anterior y mostrar esa comparación a ti y a tu entrenador.",
        "No usamos tus datos para ningún otro fin. Si algún día eso cambia, te pediremos permiso de nuevo antes — no con un aviso escondido en una actualización.",
      ],
    },
    {
      titulo: "Quién ve tus datos",
      paragrafos: [
        "**Tu entrenador**, el mismo que te invitó: ve tu perfil, tus entrenamientos, todo tu historial de ejecución, tus reevaluaciones — medidas y fotos — y todo lo que publicas en el feed, incluidas las publicaciones marcadas como “solo tu entrenador”. Es el sentido del producto — lo necesita para entrenarte.",
        "**Las notas que tu entrenador hace sobre ti quedan solo con tu entrenador.** Ningún otro alumno, ningún otro entrenador y ningún alumno de fuera del grupo las ve — y tú tampoco, en pantalla. Quien lo verifica es la base de datos, en cada consulta, como en todo lo demás.",
        "**Los demás alumnos de tu entrenador**, y solo ellos, ven las publicaciones que marcaste para el grupo: la foto, el texto, los comentarios y la cantidad de me gusta. Nada más tuyo: ni perfil, ni peso, ni entrenamiento, ni historial, ni reevaluación. Tú también ves las publicaciones que ellos marcaron para el grupo.",
        "**Ningún otro entrenador**, y ningún alumno de fuera de tu grupo, ve nada tuyo — incluidas las publicaciones del grupo. Esto no es una promesa: es una regla en la base de datos, verificada en cada consulta.",
        "**Quien opera Reps Club**, para mantener el servicio en línea y responder a tus pedidos.",
        "**Supabase**, la empresa que aloja la base de datos y las fotos, y **Vercel**, que aloja el sitio. Almacenan los datos para que el servicio funcione; no los usan para nada propio. La base de datos está en una región de Brasil (São Paulo).",
        "¿Cambias de entrenador? Quien te invita define el vínculo, y el historial va contigo — es tuyo.",
      ],
    },
    {
      titulo: "Por cuánto tiempo lo guardamos",
      paragrafos: [
        "Mientras exista tu cuenta. Tu historial de entrenamiento solo tiene valor porque es largo: borrar el año pasado borraría tu evolución.",
        "Las publicaciones y fotos quedan hasta que borres la publicación. La borraste, se fue — junto con sus me gusta y comentarios.",
        "Las fotos de la reevaluación quedan hasta que las borres, en la pantalla de la reevaluación. Las medidas quedan mientras exista la cuenta: la serie histórica es lo que da sentido a la comparación.",
        "Cuando pidas borrar la cuenta, borramos todo en un plazo de 30 días — perfil, entrenamientos, todas las series registradas, tus publicaciones, tus reevaluaciones, todas tus fotos y las notas que tu entrenador hizo sobre ti. No guardamos copia después de eso.",
      ],
    },
    {
      titulo: "Tus derechos",
      paragrafos: [
        "La LGPD te da el derecho a saber qué tenemos sobre ti, corregir lo que esté mal, pedir una copia y pedir que lo borremos. También a retirar el consentimiento y a saber con quién lo compartimos.",
        "Buena parte de esto ya lo haces solo en la app: tu perfil y tu historial están ahí, el perfil se puede editar, cada publicación tiene el botón de borrar, y las fotos de cada reevaluación también.",
        "**La excepción son las notas de tu entrenador sobre tu acompañamiento**, que no aparecen en ninguna pantalla tuya. Existen, son datos sobre ti, y tu derecho a saber lo que está escrito ahí sigue vigente — solo que no es un botón, es un pedido: habla con tu entrenador, o escribe a " + OPERADOR.contato + ".",
        `Para todo lo demás — una copia de todo o borrar la cuenta —, pídeselo a tu entrenador o escribe a ${OPERADOR.contato}. Respondemos en un plazo de 15 días.`,
        "Si no quedas conforme, puedes reclamar ante la ANPD, la autoridad nacional de protección de datos de Brasil.",
      ],
    },
    {
      titulo: "Seguridad",
      paragrafos: [
        "El acceso es con contraseña, y todo el tráfico va cifrado. En la base de datos, cada fila tiene una regla de quién puede leerla y escribirla, verificada por la propia base de datos en cada consulta — no por código de pantalla, que es donde este tipo de regla suele fallar. Las fotos siguen la misma lógica: el permiso del archivo del feed refleja el de la publicación, y el de la foto de reevaluación alcanza solo a ti y a tu entrenador.",
        "Ningún sistema es perfecto. Si hay una filtración que pueda ponerte en riesgo, te avisamos a ti y a la ANPD.",
      ],
    },
    {
      titulo: "Cookies",
      ancora: "cookies",
      paragrafos: [
        "**Usamos solo cookies esenciales**, sin las cuales el sitio no funciona: la que mantiene tu sesión iniciada, la que recuerda si dejaste contraída la barra lateral del panel, la que recuerda el idioma que elegiste para el sitio y la que guarda tu respuesta al aviso de cookies. No piden permiso, porque desactivarlas desactivaría el inicio de sesión.",
        "**Las cookies de medición de uso** — las que cuentan visitas y muestran cómo se usa el sitio — **solo se activan si aceptas** en el aviso de la página de inicio. Hoy Reps Club no usa ninguna; si algún día las usa, solo se cargarán para quien aceptó. **Cookies de publicidad, nunca.**",
        "No es una cookie, pero se parece: durante el entrenamiento, la app del alumno guarda en el propio dispositivo las series que todavía no llegaron al servidor y en qué ejercicio estás, para que el entrenamiento no se pierda cuando se cae el internet del gimnasio. Eso queda solo en tu celular, y se borra cuando las series se envían y el entrenamiento termina.",
        "Para cambiar tu elección, usa el enlace **“Cookies”** al pie de la página de inicio: el aviso vuelve y respondes de nuevo.",
      ],
    },
    {
      titulo: "Si te uniste a la lista en el sitio",
      ancora: "contato-pelo-site",
      paragrafos: [
        "La página de inicio tiene una forma de hablar con nosotros, para quien **todavía no usa** Reps Club: **“Unirme a la lista”**. Guarda tu correo y si estabas en la versión de la página para entrenadores o para alumnos — nada más.",
        "**Sirve para una sola cosa: que nuestro equipo te escriba** por correo. No se convierte en una cuenta, no entra en listas de publicidad, no se pasa a nadie — ni a un entrenador, salvo que lo pidas — y no aparece para ningún usuario de la app. Quien lo lee es quien opera Reps Club.",
        `Para ver, corregir o borrar lo que enviaste, escribe a ${OPERADOR.contato}. Lo borramos en un plazo de 15 días.`,
      ],
    },
    {
      titulo: "Menores de edad",
      paragrafos: [
        "Reps Club es para mayores de 18 años. Un menor de 18 solo puede usarlo con el consentimiento de quien tiene su tutela, dado al entrenador que lo invita.",
      ],
    },
    {
      titulo: "Cambios en esta política",
      paragrafos: [
        "Si cambiamos lo que recopilamos, para qué, con quién lo compartimos o por cuánto tiempo lo guardamos, te avisamos en la app y pedimos tu aceptación de nuevo. La fecha de la versión está al pie de esta página, y guardamos el registro de qué versión aceptaste y cuándo.",
        "**Cambió el 14 de septiembre de 2026:** el feed. Ahora se puede publicar foto y texto, eligiendo en cada publicación si queda solo con tu entrenador o también con sus demás alumnos. Antes, nada tuyo era visible para otro alumno — y por eso pedimos tu aceptación de nuevo.",
      ],
    },
  ],
};
