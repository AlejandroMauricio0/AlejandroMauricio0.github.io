const notasBonitas = [
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
    "Que ramdom lo que salga ¿no? como te quiero<3",
    "<a href='https://youtu.be/Fraqb7wyofE?si=yWPexJRnLsuC0aCs'>clickme</a>",
    "Dime algo que te molesta de mi 🙈",
    "Ya me diras lo de tu materia de ingles:(",
    "Quién lo diria tu y yo juntos:3",
    "Me das un abrazo:(",
    "No soy bueno pensando en frases jsjsjs",
    "A mí siempre me va gusta todo de ti💞🙈",
    // "NoTa: me duele la cabeza jajaja 30/09/2024",
    "Woow, 30 notas, no havia escrito tanto en mi vida jsjsj",
    "Tome una foto a su atardecer 🌅",
    "Tantas cosas bonitas en el mundo, pero nada como tu carita y tus ojos, mailob",
    "Deje averigüé como poner musica y talvez agg musica, si se,pero es tedioso jsjs",
    "Mi corazoncito es feliz contigo 🫂💞",
    "I miss you :(",
    "Espero tenga un bonito día",
    "Desde el fondo de mi corazoncito te quiero:3",
    "Como me encantas 🥰🥰",
    "Niña bonita:3",
    "Te quiero pequeña <3",
    "Eres lo mejor que ha llegado a mi vida<3",
    "Que bonita es mi novia🥰",
    "Berenice la mejor niña <3",
    "Que hermosa mi pulsera que me regalo mi novia<3",
    "me quieres verdad?",
    "Que me bese esa niña hermosa<3",
    "Quiero mucho a mi noviesita linda:3",
    "Textraño",
    "Unos besos o queso?",
    "Unos tutsi pop y luego unos besos a tutsi, jalas?",
    "Que bonito es que la vida me haya premiado contigo:3",
    "Que hermosos ojos tienes🥰",
    "Vendito el dia que empezamos hablar :')",
    "Eres lo que quiero para mi plan de vida",
    "Yo ya gane contigo, mi mailob",
    "Que hermosa niña",
    "Como la quiero",
    "enamorado de usted<3",
    "Le sobra un besito pa mi:3?",
    "Ay corazón te quiero mucho:3",
    "Mi noviesita la más linda osi, osi :3",
    "Feliz de tenerte a mi lado<3",
    "Feliz de que sea mi novia<3",
    "Feliz Feliz por nosotros<3",
    "Feliz por que eres lo que yo deseaba:3",
    "Tequiero como quieren los patos, patoda la vida jsjsjs",
    "Me da un abrazo:3🫂",
    "Te quiero muto mi niña",
    "Coincidir contigo es lo mejor que me ha pasado:3",
    "Aun no lo creo que este con uste niña hermosa :3",
    "Que hermoso es poder tomar su mano 🥹🥹🥹🥹🥹",
    "Quien me viera haciendo un sitio, para mi niña hermosa<33",
    "Eres mi mailob",
    // "",

];

function obtenerNotaSinRepetir() {
    const notasMostradas = JSON.parse(localStorage.getItem('notasMostradas')) || [];
    const notasDisponibles = notasBonitas.filter(nota => !notasMostradas.includes(nota));

    if (notasDisponibles.length === 0) {
        localStorage.removeItem('notasMostradas');
        return obtenerNotaSinRepetir();
    }

    const indiceAleatorio = Math.floor(Math.random() * notasDisponibles.length);
    const nuevaNota = notasDisponibles[indiceAleatorio];

    notasMostradas.push(nuevaNota);
    localStorage.setItem('notasMostradas', JSON.stringify(notasMostradas));

    return nuevaNota;
}

function mostrarNota() {
    const nuevaNota = obtenerNotaSinRepetir();
    document.getElementById('notaDelDia').textContent = nuevaNota;
}

