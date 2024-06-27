var title = document.title;

if (title == 'CX ONE') {
    setTimeout(executeScript, 5000);
} else {
    console.log('Voc\xEA n\xE3o est\xE1 em uma p\xE1gina do CX ONE. Tente novamente.')
}

function executeScript() {
    console.clear();
    console.log("Iniciado captura");

    StartReader();
}

function StartReader(){
    //var frame = document.getElementById("cx_hub_view");
    //var tabs = frame.contentDocument.getElementsByClassName("tabs");

    var tabs = document.getElementsByClassName("tabs");

    if (tabs === null || tabs.length === 0) {
        console.log("Nao localizado a aba de casos do CX ONE");
        return;
    }

    var casos = tabs[0].getElementsByClassName("tabcomponent");

    if (casos === null || casos === undefined || casos.length === 1 ) {
        console.log("Nao localizado nenhum caso");
        return;
    }

    for (var i = 1; i < casos.length; i++) {
        var elemento = casos[i];

        capturaNumerosCaso(elemento);
    }
}

function capturaNumerosCaso(elemento) {
    var caso = elemento.innerText;
    console.log("Caso: " + caso);
    if (caso !== "") {
        console.log("Iniciando processo de armazenamento do numero do caso")
        window.setTimeout(function () {
            var cola = capturaInformacoesCaso(caso);
            armazenaNumeroDeCaso(caso, cola);
        }, 500);

    }
}


//Gets case queue
function capturaInformacoesCaso(numeroMonitorado) {
    //var frame = document.getElementById("cx_hub_view");
    //var divInformacoes = frame.contentDocument.getElementsByClassName("secondary-navbar");

    var divInformacoes = document.getElementsByClassName("secondary-navbar");

    for (var i = 1; i < divInformacoes.length; i++) {
        var caseId = divInformacoes[i].getElementsByClassName("case-id")[0];
        var numeroCaso = caseId.innerText.replace("Caso ", "").replace("CopyCopied!", "").trim();

        if (numeroCaso === numeroMonitorado) {
            var divsPropriedades = divInformacoes[i].getElementsByTagName("div");
            for (var i = 0; i < divsPropriedades.length - 1; i++) {
                var texto = divsPropriedades[i].innerText;
                if (texto !== undefined && texto.startsWith('Fila')) {
                    texto = texto.replace("Fila", "").replace("CopyCopied!", "").trim();
                    console.log(texto);
                    return texto;
                }
            }
        }
    }
}

//Saves case number in chrome storage
function armazenaNumeroDeCaso(caso, cola) {

    var casoArmazenado = false;
    chrome.storage.local.get({ casos: [] }, function (result) {
        var lista = result.casos;
        console.log(lista);

        //SE O CASO JA EXISTE NA LISTA, NAO ARMAZENA NOVAMENTE
        for (var i = 0; i < lista.length; i++) {
            if (caso.numero === lista[i].numero) {
                console.log('Ja existe caso ' + caso + ' armazenado | Fila: ' + cola);
                return;
            }
        }

        var data = GetDate();
        lista.push({ numero: caso, abertura: data, fila: cola, tabulado: false });

        chrome.storage.local.set({ casos: lista }, function () {
            console.log('Armazenado caso ' + caso + ' | Fila: ' + cola);
        });
    });

}