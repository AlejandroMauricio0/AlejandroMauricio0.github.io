var datos=[]
var finalDatos=[]
var nClase
var rango
var classLenght
var li=[]
var ls=[]
var fabs=[]
var fAcum=[]
var marcaClase=[]
var marcaFrecuencia=[]
var marcaClaseMenosMediaAlCuadrado = []
var marcaClaseMenosMedia=[]

let input = document.querySelector('input');
input.addEventListener('keyup', (e) => {
    if(e.keyCode === 13) {
        console.log(e.target.value);
        datos.push(e.target.value);
        finalDatos = datos.map(Number)
        finalDatos.sort(function(a, b) {
            return a - b;
        });
        console.log(finalDatos);
    }
})

function mostrarArreglo() {
    let resultado = document.getElementById('resultado');
    resultado.innerHTML = '';
    for (const dato of datos) {
        let datoParrafo = document.createElement('p');
        datoParrafo.innerText = dato+",";
        resultado.appendChild(datoParrafo);
    }
    calcularLimites();
    genera_tabla();
}

function calcularLimites() {
    nClase=Math.sqrt(datos.length)
    rango=(datos[datos.length-1])-(datos[0])
    classLenght=Math.round(rango/nClase)

    console.log("nClase: "+nClase)
    console.log("classLenght: "+classLenght)
    console.log("rango: "+rango)
    let limiteInferiorAux=finalDatos[0]

    li.push(limiteInferiorAux)
    for (let i=0;i<nClase-1;i++){
        limiteInferiorAux=li[i]
        li.push((limiteInferiorAux+classLenght)+1);
    }
    let limiteSuperiorAux=li[1]-1
    ls.push(limiteSuperiorAux)
    for (let i=0;i<nClase-1;i++){
        limiteSuperiorAux=ls[i]
        ls.push((limiteSuperiorAux+classLenght)+1);
    }

    let contador=0
    for (let i=0;i<nClase;i++){
        for (let j=0;j<finalDatos.length;j++){
            if (finalDatos[j] >= li[i] && finalDatos[j] <= ls[i])
                contador = contador+1
        }
        fabs.push(contador)
        contador=0
    }
    let fAcumAux= fabs[0]
    fAcum.push(fAcumAux)
    for (let i=0;i<nClase-1;i++){
        fAcumAux=fAcum[i]
        fAcum.push(fAcumAux+fabs[i+1])
    }
    for (let i=0;i<nClase;i++){
        marcaClase.push((li[i]+ls[i])/2)
    }

    let marcaFrecuenciaSuma=0
    for (let i=0;i<nClase;i++){
        marcaFrecuencia.push(marcaClase[i]*fabs[i])
        marcaFrecuenciaSuma= marcaFrecuenciaSuma+marcaFrecuencia[i]
    }
    let moda=0
    for (let i=0;i<nClase;i++){
        if (fabs[i] === Math.max(...fabs) && i>0 && i+1<nClase) {
            moda = li[i] + ((fabs[i] - fabs[i - 1]) / ((2 * fabs[i]) - fabs[i - 1] - fabs[i + 1]))
        }
    }
    let media= marcaFrecuenciaSuma/finalDatos.length
    let marcaClaseMenosMediaSuma=0
    let marcaClaseMenosMediaAlCuadradoSuma=0
    for (let i=0;i<nClase;i++) {
        marcaClaseMenosMedia.push(Math.abs(marcaClase[i] - media) * fabs[i])
        marcaClaseMenosMediaAlCuadrado.push((marcaClaseMenosMedia[i] ** 2))
        marcaClaseMenosMediaSuma = (marcaClaseMenosMediaSuma + marcaClaseMenosMedia[i])
        marcaClaseMenosMediaAlCuadradoSuma = (marcaClaseMenosMediaAlCuadradoSuma + marcaClaseMenosMediaAlCuadrado[i])
    }
    let desviacionMedia=marcaClaseMenosMediaSuma/finalDatos.length
    let varianza=marcaClaseMenosMediaAlCuadradoSuma/finalDatos.length
    let desviacionEstandar=Math.sqrt(varianza)

    let modaLabel = document.getElementById('moda');
    modaLabel.innerHTML = "Moda: "+moda;
    let mediaLabel = document.getElementById('media');
    mediaLabel.innerHTML = "Media: "+media;
    let dmLabel = document.getElementById('dm');
    dmLabel.innerHTML = "DM: "+desviacionMedia;
    let destLabel = document.getElementById('dest');
    destLabel.innerHTML = "Desviación Estándar: "+desviacionEstandar;
    let varianzaLabel = document.getElementById('varianza');
    varianzaLabel.innerHTML = "Varianza: "+varianza;

    console.log("li: "+li)
    console.log("ls: "+ls)
    console.log("fabs: "+fabs)
    console.log("facum: "+fAcum)
    console.log("marca: "+marcaClase)
    console.log("marcaFrecuencia: "+marcaFrecuencia)
    console.log("moda: "+moda)
    console.log("media: "+media)
    console.log("DM: "+desviacionMedia)
    console.log("DEST: "+desviacionEstandar)
    console.log("Varianza: "+varianza)
}

function genera_tabla() {
    // Obtener la referencia del elemento body
    let labels=["Li", "Ls", "F. Absoluta", "F. Acumulada","Marca de Clase","Marca x Frecuencia","Marca - Media x Frecuencia","Marca - Media x Frecuencia**2"]
    var body = document.getElementsByTagName("body")[0];

    // Crea un elemento <table> y un elemento <tbody>
    var tabla   = document.createElement("table");
    var tblBody = document.createElement("tbody");

    // Crea las celdas
    for (var i = 0; i < nClase+1; i++) {
        // Crea las hileras de la tabla
        var hilera = document.createElement("tr");

        for (var j = 0; j < 8; j++) {
            // Crea un elemento <td> y un nodo de texto, haz que el nodo de
            // texto sea el contenido de <td>, ubica el elemento <td> al final
            // de la hilera de la tabla
            var celda = document.createElement("td");
            var cabecera= document.createElement("th");
            var textoCelda
            if (i===0){
               textoCelda = document.createTextNode(labels[j]);
               cabecera.appendChild(textoCelda);
               hilera.appendChild(cabecera);
            }
            else {
                switch (j) {
                    case 0:
                        textoCelda = document.createTextNode(li[i-1]);
                        break;
                    case 1:
                        textoCelda = document.createTextNode(ls[i-1]);
                        break;
                    case 2:
                        textoCelda = document.createTextNode(fabs[i-1]);
                        break;
                    case 3:
                        textoCelda = document.createTextNode(fAcum[i-1]);
                        break;
                    case 4:
                        textoCelda = document.createTextNode(marcaClase[i-1]);
                        break;
                    case 5:
                        textoCelda = document.createTextNode(marcaFrecuencia[i-1]);
                        break;
                    case 6:
                        textoCelda = document.createTextNode(marcaClaseMenosMedia[i-1]);
                        break;
                    case 7:
                        textoCelda = document.createTextNode(marcaClaseMenosMediaAlCuadrado[i-1]);
                        break;
                }
                celda.appendChild(textoCelda);
                hilera.appendChild(celda);
            }
        }
        // agrega la hilera al final de la tabla (al final del elemento tblbody)
        tblBody.appendChild(hilera);
    }
    // posiciona el <tbody> debajo del elemento <table>
    tabla.appendChild(tblBody);
    // appends <table> into <body>
    body.appendChild(tabla);
    // modifica el atributo "border" de la tabla y lo fija a "2";
    tabla.setAttribute("border", "2");
}


function mostrarNoAgrupados(){
    let resultado = document.getElementById('resultado');
    resultado.innerHTML = '';
    for (const dato of datos) {
        let datoParrafo = document.createElement('p');
        datoParrafo.innerText = dato;
        resultado.appendChild(datoParrafo);
    }
    let sumall = finalDatos.map(item => item).reduce((prev, curr) => prev + curr, 0);
    let media = sumall/finalDatos.length
    let mediaLabel = document.getElementById('media');
    let medianaLabel = document.getElementById('mediana');
    let modaLabel = document.getElementById('moda');
    let mediana
    if (finalDatos.length%2==0) {
        let pos1=finalDatos.length/2
        let pos2=pos1-1
        let elem1=finalDatos[pos1]
        let elem2=finalDatos[pos2]
        mediana=(elem1+elem2)/2
    } else {
        let pos_central=(finalDatos.length-1)/2
        mediana=finalDatos[pos_central]
    }
    mediaLabel.innerHTML = "Media: "+media;
    medianaLabel.innerHTML = "Medina: "+mediana;
    modaLabel.innerHTML="Moda: "+getMode(finalDatos);
    dispersion(media);
}

function getMode(array) {
    // count amount of occurences of each number

    // create object
    const obj = {};
    // loop over array
    array.forEach(number => {
        // for each number in array,
        // if it doesn't already exist as a key on the
        // object, create one and set its value to 1.
        if (!obj[number]) {
            obj[number] = 1;
        } else {
            // if it already exists as key on the object,
            // increment its corresponding value.
            obj[number] += 1;
        }
    });

    // return object key with highest value.
    let highestValue = 0;
    let highestValueKey = -Infinity;

    for (let key in obj) {
        const value = obj[key];
        if (value > highestValue) {
            highestValue = value;
            highestValueKey = key;
        }
    }

    // convert key back to number
    return Number(highestValueKey);
}

function dispersion(media){
    let desvMedia, desvEstandar, varianza
    let sumatoria=0
    let sumatoriaCuadrada=0
    for (let i=0;i<finalDatos.length;i++){
        let constante=finalDatos[i]-media
        sumatoria=sumatoria+(Math.abs(constante))
        sumatoriaCuadrada=sumatoriaCuadrada+((Math.abs((finalDatos[i]-media))**2));
    }
    console.log(sumatoria)
    console.log(sumatoriaCuadrada)
    desvMedia=sumatoria/finalDatos.length
    varianza=sumatoriaCuadrada/finalDatos.length
    desvEstandar=Math.sqrt(varianza)
    console.log("DM:"+desvMedia)
    console.log("Varianza: "+varianza)
    console.log("DE:"+desvEstandar)
    let dmLabel = document.getElementById('dm');
    dmLabel.innerHTML = "DM: "+desvMedia;
    let destLabel = document.getElementById('dest');
    destLabel.innerHTML = "Desviación Estándar: "+desvEstandar;
    let varianzaLabel = document.getElementById('varianza');
    varianzaLabel.innerHTML = "Varianza: "+varianza;

}



