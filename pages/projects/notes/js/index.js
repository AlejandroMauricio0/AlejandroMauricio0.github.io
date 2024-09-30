const notasBonitas = [
    "La vida es como un libro; cada día es una nueva página en tu historia.",
    "No cuentes los días, haz que los días cuenten.",
    "El futuro pertenece a aquellos que creen en la belleza de sus sueños.",
    "Cada día es una nueva oportunidad para ser la mejor versión de ti mismo.",
    "La felicidad no es algo hecho. Viene de tus propias acciones.",
    "Cree en ti mismo y todo será posible.",
    "El éxito no es la clave de la felicidad. La felicidad es la clave del éxito.",
    "Hoy es un buen día para empezar algo nuevo.",
    "La vida es un viaje, no un destino. Disfruta el camino.",
    "Sé el cambio que deseas ver en el mundo.",
    "Te quiero 💞",
    "Eres la niña más bonita que mis ojos han visto",
    "Enamorado de ti corazón 🥰",
    "MI CORAZÓN DE MELÓN 💓🍈",
    "Que hermoso tenerne en mi vida:3",
    "Esta sitio lo hice con el fin de que sepas que si te quiero mucho 😪🫂",
    "Apoko no esta bonita mi niña hermosa",
    "Dime una frase bonita (tienes mi numero) jsjsjs",
    "Quieres que agregue algo? Dimelo jsjs",
    // "Te regalo un cupón para lo que gustes",
    "En cada momento, estoy pensando en ti:3",
    "Dato curioso: estaba despierto hasta las 4:00 am",
    "Que ramdom lo que salga ¿no?",
    "<a href='https://youtu.be/Fraqb7wyofE?si=yWPexJRnLsuC0aCs'>clickme</a>",
    "Dime algo que te molesta de mi 🙈",
    "Ya me diras lo de tu materia de ingles:(",
    "Quién lo diria tu y yo juntos:3",
    "Me das un abrazo:(",
    "No soy bueno pensando en frases jsjsjs",
    "A mí siempre me va gusta todo de ti💞🙈",
    "NoTa: me duele la cabeza jajaja 30/09/2024",
    "Woow, 30 notas, no havia escrito tanto en mi vida jsjsj",
    "Tome una foto a su atardecer 🌅",
    "Tantas cosas bonitas en el mundo, pero nada como tu carita y tus ojos, mailob",
    "Deje averigüé como poner musica y talvez agg musica, si se,pero es tedioso jsjs",
    "Mi corazoncito es feliz contigo 🫂💞"
    // "",

];

function obtenerNotaSinRepetir() {
    const notasMostradas = JSON.parse(localStorage.getItem('notasMostradas')) || [];

    // Filtrar las notas que no se han mostrado
    const notasDisponibles = notasBonitas.filter(nota => !notasMostradas.includes(nota));

    if (notasDisponibles.length === 0) {
        // Si no hay notas disponibles, se restablecen las mostradas
        localStorage.removeItem('notasMostradas');
        return obtenerNotaSinRepetir(); // Volver a llamar para obtener una nota nueva
    }

    const indiceAleatorio = Math.floor(Math.random() * notasDisponibles.length);
    const nuevaNota = notasDisponibles[indiceAleatorio];

    // Guardar la nueva nota en las mostradas
    notasMostradas.push(nuevaNota);
    localStorage.setItem('notasMostradas', JSON.stringify(notasMostradas));

    return nuevaNota;
}

// Función para mostrar la nota
function mostrarNota() {
    const ahora = new Date().getTime(); // Obtener la hora actual en milisegundos
    const ultimaActualizacion = localStorage.getItem('ultimaActualizacion');

    // Comprobar si han pasado más de 24 horas desde la última actualización
    if (!ultimaActualizacion || (ahora - ultimaActualizacion) > 24 * 60 * 60 * 1000) {
        const nuevaNota = obtenerNotaSinRepetir();
        document.getElementById('notaDelDia').textContent = nuevaNota;
        localStorage.setItem('notaDelDia', nuevaNota); // Guardar la nueva nota
        localStorage.setItem('ultimaActualizacion', ahora); // Actualizar la fecha de la última actualización
    } else {
        // Si no ha pasado 24 horas, mostrar la nota anterior
        document.getElementById('notaDelDia').textContent = localStorage.getItem('notaDelDia');
    }
}