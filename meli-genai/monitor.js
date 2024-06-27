// class Mensagem {
//     constructor(remetente, conteudo, data) {
//       this.remetente = remetente;
//       this.conteudo = conteudo;
//       this.data = data;
//     }
// }

var storage_available = true;
var title = document.title;
var processingConsola = false;
var listaTemporaria = [[]];
var listaTextoSemMensagens = [];
var listaMensagensComprador = new Array();
var listaMensagensVendedor = new Array();


if (title == 'CX ONE') {
    setTimeout(executeScript, 2000);
} else {
    tempAlert('Voc\xEA n\xE3o est\xE1 em uma p\xE1gina do CX ONE. Tente novamente.', 10000, 'warning', 30)
}

//Starts the instance
function executeScript() {
    console.clear();
    console.log("Iniciado captura");
    // CapturarCaso();
    StartMonitor();
}

function carregaTextoSemMensagens(){
    //TO DO: IMPLEMENTAR CAPTURA POR API
    listaTextoSemMensagens = [
        '0 mensajes',
        '0 mensagens',
        'N\xE3o h\xE1 mensagens'
    ]
}

function StartMonitor() {

    console.log('Iniciando monitor');
    try {
        observer.disconnect();
    } catch (e) {
        console.log(e);
    }

    ////Select the node that will be observed for mutations
    //var frame = document.getElementById("cx_hub_view");
    //if (frame === undefined) {
    //    tempAlert('N\xE3o foi possivel localizar o frame de conteudo do cx one', 10000, 'error', 100)
    //    return;
    //}

    //var tabs = frame.contentDocument.getElementsByClassName("navbar");

    console.log('Capturando o navbar')
    var tabs = document.getElementsByClassName("navbar");
    if (tabs === undefined || tabs.length == 0) {
        tempAlert('N\xE3o foi possivel localizar a aba de casos', 10000, 'error', 100)
        return;
    }



    if (tabs === null || tabs.length === 0) {
        tempAlert('N\xE3o foi possivel localizar a aba de casos', 10000, 'error', 100)
        return;
    }

    const targetNode = tabs[0];

    const config = { attributes: true, childList: true, subtree: true };

    const callback = (mutationList, observer) => {
        for (const mutation of mutationList) {
            if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                    if (!node.tagName) continue; // not an element
                    if (node.classList.contains('secondary-navbar')) {
                        console.log('ADICIONADO NODE SECONDARY');
                        console.log(node);
                        setTimeout(function () {
                            CapturarCaso();
                        }, 10000);
                    } 
                }
            }
        }
    };

    observer = new MutationObserver(callback);
    observer.observe(targetNode, config);

    tempAlert('GEN-AI iniciado, capturando novos casos', 5000, 'success', 100)
}

async function CapturarCaso(){
    try {

        var listaFinal = [];

        //INFORMATIVO
        console.clear();
        console.log('Novo caso capturado');

        //OBTEM NUMERO DO CASO
        var numeroCaso = document
            .getElementsByClassName("secondary-navbar-selected")[0]
            .getElementsByClassName("case-id")[0]
            .textContent.replace('Caso ','')
            .replace('Case','')
            .replace('CopyCopied!','');


        //OBTEM MENSAGERIA
        var frameCaso = document.getElementById('wow-content-' + numeroCaso);

        var casesIframes = document.getElementsByClassName('case-iframes')
        var caseIframe = null;
        for (var i = 0; i < casesIframes.length; index++) {
            var parent = casesIframes[i].parentElement.parentElement;
            if (parent.outerHTML.includes('display: contents')){
                caseIframe = casesIframes[i];
                break;
            }
            
        }
        var frameMensagensMediacao = document.getElementById('coco-content-' + numeroCaso);
        
        var frameMediacao = frameCaso.contentDocument.querySelector('[title="Fenrir"]')
        var containerMensagens = frameMediacao.contentDocument.getElementsByClassName('container-messages')[0];
        var qtdMensagens = containerMensagens.getElementsByTagName('span')[0].textContent.trim();
        if (listaTextoSemMensagens.includes(qtdMensagens)){
            //TO DO: IMPLEMENTAR METODO DE ALERTA QUE NAO HÁ MENSAGENS
            alert('Não consta mensagens no caso selecionado')
            // return;
        }      

        //OBTEM TIPIFICACAO
        var tipificacao = frameMediacao.contentDocument.getElementsByClassName('container-claim__tipification')[0];
        var itensTipificacao = tipificacao.getElementsByTagName('li');
        var textoTipoficacao = '';
        for(var i = 0; i < itensTipificacao.length; i++){
            if (textoTipoficacao == ''){
                textoTipoficacao = itensTipificacao[i].textContent;
            }
            else {
                textoTipoficacao = textoTipoficacao + '; ' + itensTipificacao[i].textContent;
            }
        }
        
        //OBTEM MEDIACAO
        var mensagensMediacao = caseIframe.getElementsByClassName('message');

        //EXPANDE TODAS AS MENSAGENS
        for (var i = 0; i < mensagensMediacao.length; i++) {
            var botaoVerMais = mensagensMediacao[i].getElementsByClassName('more-link');
            if (botaoVerMais.length > 0) {
                botaoVerMais[0].click();
            }
        }

        //CAPTURA AS MENSAGENS DE MEDIACAO
        mensagensMediacao = document.getElementsByClassName('message');
        for (var i = 0; i < mensagensMediacao.length; i++) {
            var remetente = mensagensMediacao[i].getElementsByClassName('username')[0].textContent;
            var destinatario = mensagensMediacao[i].getElementsByClassName('receiver')[0].textContent;
            var mensagem = mensagensMediacao[i].getElementsByClassName('content-span')[0].textContent;
            var data = mensagensMediacao[i].getElementsByClassName('date')[0].textContent;

            console.log('REMETENTE: ' + remetente);
            console.log('DESTINATARIO: ' + destinatario);
            console.log('DATA: ' + data);
            console.log('MENSAGEM: ' + mensagem);
            var mensagemMediacao = '['+data+'](' + remetente + ') - ' + mensagem;
            listaFinal.push(mensagemMediacao)
        }

        //TODO: ACESSO AO CAMPO DE MEDIACAO

        //OBTEM HISTORICO DE MENSAGENS
        var linkMensagens = frameMediacao.contentDocument.getElementsByClassName('container-messages__link')[0]
        linkMensagens.getElementsByTagName('a')[0].click();
        var mensagensSeller = frameMediacao.contentDocument.getElementsByClassName('message-user margin-seller')
        for(var i = 0; i < mensagensSeller.length; i++){
            listaMensagensVendedor.push(carregaMensagem(mensagensSeller[i], 'Seller'));
        }

        var mensagensBuyer = frameMediacao.contentDocument.getElementsByClassName('message-user margin-buyer')
        for(var i = 0; i < mensagensBuyer.length; i++){
            listaMensagensComprador.push(carregaMensagem(mensagensBuyer[i], 'Buyer'));
        }

        for(var i = 0; i < listaMensagensComprador.length; i++){
            listaFinal.push(listaMensagensComprador[i]);
        }
        for(var i = 0; i < listaMensagensVendedor.length; i++){
            listaFinal.push(listaMensagensVendedor[i]);
        }
        listaFinal.sort();

        //GERA RESUMO OPEN AI

        //POPUP INFORMATIVO

        console.log('Total mensagens: ' + qtdMensagens);
        console.log('Mensagens vendedor: ' + listaMensagensVendedor.length);
        console.log('Mensagens comprador: ' + listaMensagensComprador.length);
        console.log('Tipificacao: ' + textoTipoficacao);
        var interacoes = '';
        for(var i = 0; i < listaFinal.length; i++){
            console.log(listaFinal[i]);
            interacoes = interacoes + listaFinal[i] + ';'
        }

        var retorno = await acionaChatGPT(interacoes);
        var objRetorno = JSON.parse(retorno);
        // console.log(objRetorno);
        
        var resumoPerfil = objRetorno.choices[0].message.content;

        chrome.runtime.sendMessage({ name: "popup", mensagens: qtdMensagens, resumo: resumoPerfil, genAiId: objRetorno.IdResumo});

        // popupResultado('ate entao tudo certo', 60000, 'error', 100, qtdMensagens, resumo, numeroCaso);

    } catch (e) {
        console.log(e);
    }
}

function carregaMensagem(divMensagem, remetente){
    var data = divMensagem.getElementsByClassName('message-user__date')[0].textContent;
    var conteudo = divMensagem.querySelector('[data-testid="message_html_sanitizer"]').textContent;
    var mensagem = '['+data+'](' + remetente + ') - ' + conteudo;
    return mensagem;
}

async function MontaCorpo(interacoes) {
    interacoes = interacoes.replace('"',"´");
    console.log('===== INTERACOES =====');
    console.log(interacoes);
    var userinfo = await chrome.runtime.sendMessage({ name: "username" });
    console.log('username');
    console.log(userinfo);
    var data = JSON.stringify({
        //"request": 'Trace um resumo de perfil pessoal para o comprador e vendedor, considerando que eles tiveram as seguintes interações: '+ interacoes +''
        "request": 'Resuma em bullets em portugues seguintes interações: '+ interacoes +'',
        "username": userinfo.Username
    });

    console.log('===== CORPO =====');
    console.log(data);
    return data;
}

async function acionaChatGPT(interacoes){

    var json = await MontaCorpo(interacoes)
    var url = "https://smartbko-kwai.teleperformance.com.br/tpgenai-mercadolivre-api";
    var retornoAPI = GetResponse('POST', url + '/AcionarChatGPT', false, "application/json", json);
    console.log(retornoAPI);
    return retornoAPI;
    //   var xhr = new XMLHttpRequest();
    //   xhr.withCredentials = true;
      
    //   xhr.addEventListener("readystatechange", function() {
    //     if(this.readyState === 4) {
    //       console.log(this.responseText);
    //     }
    //   });
      
    //   xhr.open("POST", "https://smartbko-kwai.teleperformance.com.br/tpgenai-mercadolivre-api/AcionarChatGPT");
    //   xhr.setRequestHeader("api-key", "");
    //   xhr.setRequestHeader("Content-Type", "application/json");
      
    //   xhr.send(data);
}


//Prepares data and elements to be monitored and starts the observer
// function StartMonitor() {

//     try {
//         observer.disconnect();
//     } catch (e) {
//         console.log(e);
//     }

//     ////Select the node that will be observed for mutations
//     //var frame = document.getElementById("cx_hub_view");
//     //if (frame === undefined) {
//     //    tempAlert('N\xE3o foi possivel localizar o frame de conteudo do cx one', 10000, 'error', 100)
//     //    return;
//     //}

//     //var tabs = frame.contentDocument.getElementsByClassName("navbar");

//     console.log('Capturando o navbar')
//     var tabs = document.getElementsByClassName("navbar");
//     if (tabs === undefined || tabs.length == 0) {
//         tempAlert('N\xE3o foi possivel localizar a aba de casos', 10000, 'error', 100)
//         return;
//     }

//     console.log('Capturando o console-wrapper')
//     var consolewrapper = document.getElementsByClassName("console-wrapper");
//     if (consolewrapper === undefined || consolewrapper.length == 0) {
//         tempAlert('N\xE3o foi possivel localizar a aba da consola', 10000, 'error', 100)
//         return;
//     }

//     console.log('Capturando os labels da consola')
//     //var labelsConsola = consolewrapper[0].getElementsByTagName("label");
//     //if (labelsConsola === undefined || labelsConsola.length == 0) {
//     //    tempAlert('N\xE3o foi possivel localizar os labels da consola', 10000, 'error', 100)
//     //    return;
//     //}

//     var consolaStates = document.getElementById('btn-rep-states');
//     var divEstado = consolaStates.getElementsByTagName('div')[1];

//     console.log('Determinando o label da consola')
//     var consola = divEstado;


//     if (tabs === null || tabs.length === 0) {
//         tempAlert('N\xE3o foi possivel localizar a aba de casos', 10000, 'error', 100)
//         return;
//     }

//     const targetNode = tabs[0];
//     const targetConsola = consola;

//     const config = { attributes: true, childList: true, subtree: true };
//     const configConsola = { characterData: true, attributes: false, childList: false, subtree: true };

//     const callback = (mutationList, observer) => {
//         for (const mutation of mutationList) {
//             if (mutation.type === 'childList') {
//                 for (const node of mutation.addedNodes) {
//                     if (!node.tagName) continue; // not an element
//                     if (node.classList.contains('secondary-navbar')) {
//                         console.log('ADICIONADO NODE SECONDARY');
//                         console.log(node);
//                         setTimeout(function () {
//                             capturaNumerosCaso(node);
//                         }, 3000);
//                     } 
//                 }
//             }

//             else if (mutation.type === 'characterData') {
//                 var consolaStates = document.getElementById('btn-rep-states');
//                 var divEstado = consolaStates.getElementsByTagName('div')[1];
//                 AtualizaEstadoConsola(divEstado.textContent);
//             }
//         }
//     };

//     observer = new MutationObserver(callback);
//     observer.observe(targetNode, config);
//     observer.observe(targetConsola, configConsola);

//     obtemConsolaManual();

//     tempAlert('Tabulador iniciado, capturando novos casos', 5000, 'success', 100)
// }

//function StartMonitor() {

//    try {
//        observer.disconnect();
//    } catch (e) {
//        console.log(e);
//    }

//    //Select the node that will be observed for mutations
//    var frame = document.getElementById("cx_hub_view");
//    if (frame === undefined) {
//        tempAlert('N\xE3o foi possivel localizar o frame de conteudo do cx one', 10000, 'error', 100)
//        return;
//    }

//    var tabs = frame.contentDocument.getElementsByClassName("tabs");
//    if (tabs === undefined || tabs.length == 0) {
//        tempAlert('N\xE3o foi possivel localizar a aba de casos', 10000, 'error', 100)
//        return;
//    }

//    var consolewrapper = document.getElementsByClassName("console-wrapper");
//    if (consolewrapper === undefined || consolewrapper.length == 0) {
//        tempAlert('N\xE3o foi possivel localizar a aba da consola', 10000, 'error', 100)
//        return;
//    }

//    var labelsConsola = consolewrapper[0].getElementsByTagName("label");
//    if (labelsConsola === undefined || labelsConsola.length == 0) {
//        tempAlert('N\xE3o foi possivel localizar os labels da consola', 10000, 'error', 100)
//        return;
//    }

//    var consola = labelsConsola[0];

//    if (tabs === null || tabs.length === 0) {
//        tempAlert('N\xE3o foi possivel localizar a aba de casos', 10000, 'error', 100)
//        return;
//    }

//    const targetNode = tabs[0];
//    const targetConsola = consola;

//    const config = { attributes: true, childList: true, subtree: true };
//    const configConsola = { characterData: true, attributes: false, childList: false, subtree: true };

//    const callback = (mutationList, observer) => {
//        for (const mutation of mutationList) {
//            if (mutation.type === 'childList') {
//                if (mutation.addedNodes.length > 0) {
//                    console.log(mutation.addedNodes);
//                    for (var i = 0; i < mutation.addedNodes.length; i++) {
//                        capturaNumerosCaso(mutation.addedNodes[i]);
//                    }
//                }
//            }

//            else if (mutation.type === 'characterData') {
//                AtualizaEstadoConsola(mutation.target.data);
//            }
//        }
//    };

//    observer = new MutationObserver(callback);
//    observer.observe(targetNode, config);
//    observer.observe(targetConsola, configConsola);

//    obtemConsolaManual();

//    tempAlert('Tabulador iniciado, capturando novos casos', 5000, 'success', 100)
//}

//Gets the case number and case queue

//function capturaNumerosCaso(elemento) {
//    try {
//        var caso = "";
//        var baseURI = elemento.baseURI;
//        if (baseURI != null && baseURI != undefined && baseURI != '') {
//            console.log('BASE URI: ' + baseURI)
//            var dadosUrl = baseURI.split('/');
//            caso = dadosUrl[dadosUrl.length - 1];
//            console.log("Caso: " + caso);
//        }

//        if (caso == "" || caso == undefined || caso == null) {
//            caso = elemento.innerText;
//            console.log("Caso: " + caso);
//        }

//        if (caso !== "" && caso !== undefined) {
//            console.log("Iniciando processo de armazenamento do numero do caso")
//            window.setTimeout(function () {
//                var cola = capturaInformacoesCaso(caso);
//                armazenaNumeroDeCaso(caso, cola);
//            }, 5000);
//        }
//    } catch (e) {
//        tempAlert('Falha ao capturar o caso aberto', 5000, 'danger', 100)
//    }
//}

// function capturaNumerosCaso(elemento) {
//     try {   
//         console.log("PARAMETRO ELEMENTO");
//         console.log(elemento);

//         console.log("INICIANDO CAPTURA DE NUMERO DO CASO")
//         var caso = "";
//         var cola = "";

//         console.log("OBTENDO DIVS CASEID")
//         var caseIds = elemento.getElementsByClassName("case-id");
//         if (caseIds.length > 0) {
//             //NUMERO DO CASO
//             caso = caseIds[0].innerText.replace("Caso ", "").replace("CopyCopied!", "").trim();

//             //COLA
//             var divInformacoes = elemento.getElementsByClassName("case-secondary-navbar");
//             var divsPropriedades = divInformacoes[0].getElementsByTagName("div");
//             for (var i = 0; i < divsPropriedades.length - 1; i++) {
//                 try {
//                     var texto = divsPropriedades[i].innerText;
//                     if (texto !== undefined && texto.startsWith('Fila')) {
//                         texto = texto.replace("Fila", "").replace("CopyCopied!", "").trim();
//                         cola = texto;
//                     }
//                 } catch (e) {
//                     console.log('Falha ao ler o HTML de propriedades para captura da cola do caso')
//                 }
//             }
//         }
//         else {
//             console.log("CASEIDS VAZIO")
//         }

//         if (caso !== "" && caso !== undefined) {
//             console.log("Iniciando processo de armazenamento do numero do caso")
//             window.setTimeout(function () {
//                 //var cola = capturaInformacoesCaso(caso);
//                 armazenaNumeroDeCaso(caso, cola);
//             }, 5000);
//         }
//     } catch (e) {
//         tempAlert('Falha ao capturar o caso aberto', 5000, 'danger', 100);
//         console.log(e);
//     }
// }

//Gets case queue
// function capturaInformacoesCaso(numeroMonitorado) {
//     //var frame = document.getElementById("cx_hub_view");
//     //var divInformacoes = frame.contentDocument.getElementsByClassName("secondary-navbar");

//     var divInformacoes = document.getElementsByClassName("secondary-navbar");

//     for (var i = 1; i < divInformacoes.length; i++) {
//         try {
//             var caseId = divInformacoes[i].getElementsByClassName("case-id")[0];
//             console.log(caseId);
//             var numeroCaso = caseId.innerText.replace("Caso ", "").replace("CopyCopied!", "").trim();

//             if (numeroCaso === numeroMonitorado) {
//                 var divsPropriedades = divInformacoes[i].getElementsByTagName("div");
//                 for (var i = 0; i < divsPropriedades.length - 1; i++) {
//                     try {
//                         var texto = divsPropriedades[i].innerText;
//                         if (texto !== undefined && texto.startsWith('Fila')) {
//                             texto = texto.replace("Fila", "").replace("CopyCopied!", "").trim();
//                             return texto;
//                         }
//                     } catch (e) {
//                         console.log('Falha ao ler o HTML de propriedades para captura da cola do caso')
//                     }
//                 }
//             }
//         } catch (ex) {
//             console.log('Falha ao ler o HTML de ID de caso para captura da cola do caso')
//         }
//     }
// }

//Saves case number in chrome storage
// async function armazenaNumeroDeCaso(caso, cola) {
//     try {

//         var data = GetDate();
//         console.log('Caso: ' + caso + '| Aberto: ' + data + ' | Fila: ' + cola + ' | Tabulado: false');
//         console.log('OBJETO');
//         var obj = { numero: caso, abertura: data, fila: cola, tabulado: false };

//         //Generates json data
//         console.log('Chamando a API para gravacao do caso');
//         var userinfo = await chrome.runtime.sendMessage({ name: "username" });
//         var url = await chrome.runtime.sendMessage({ name: "url-api" });
//         var json = MontaCorpo(userinfo.Username, obj.numero, obj.fila, obj.abertura);
//         var retornoAPI = GetResponse('POST', url.host + '/api/Tabulacao/InserirTabulacao', false, "application/json", json);
//         console.log(retornoAPI);
//         tempAlert('Capturado caso numero ' + caso, 5000, 'success', 80);
        

//     } catch (e) {
//         console.log('Liberando storage apos erro no caso ' + caso);
//         console.log(e);
//     }
// }

async function wait(ms) {
    await sleep(ms);
}

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

//Gets the console status and send it to database
// async function AtualizaEstadoConsola(estado) {

//     if (processingConsola) {
//         return;
//     }

//     try {
//         processingConsola = true;
//         var userinfo = await chrome.runtime.sendMessage({ name: "username" });
//         var url = await chrome.runtime.sendMessage({ name: "url-api" });
//         var retornoAPI = GetResponse('POST', url.host + '/api/User/AtualizaStatusConsola?loginDeRede=' + userinfo.Username + '&status=' + estado + '', false, "application/json", null);
//         processingConsola = false;
//     } catch (e) {
//         processingConsola = false;
//         console.log(e);
//     }


// }

//Get current date
function GetDate() {
    let current = new Date();
    let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
    let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
    let dateTime = cDate + ' ' + cTime;
    return dateTime
}

//REALIZA UMA CHAMADA DE URL
function GetResponse(method, uri, syncrhonous, contentType, body) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(method, uri, syncrhonous);
    xmlHttp.setRequestHeader("Content-Type", contentType);
    console.log('BODY');
    console.log(body);
    xmlHttp.send(body);
    return xmlHttp.responseText;
}

//Shows a custom alert in the top of document
function tempAlert(msg, duration, type, opacity) {
    console.log('TEMP ALERT: ' + msg);
    var el = document.createElement("div");
    var color = 'yellow';
    var fontcolor = 'black';
    if (type == 'success') {
        color = 'green';
        fontcolor = 'white';
    }
    else if (type == 'warning') {
        color = 'orange';
        fontcolor = 'white';
    }
    else if (type == 'danger') {
        color = 'red';
        fontcolor = 'white';
    }

    el.setAttribute("style", "position:absolute;top:0%;left:0%;width: 100%;background-color:" + color + ";color:" + fontcolor + ";opacity:" + opacity + "%;text-align:center");
    el.innerHTML = msg;
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, duration);

    var root = document.getElementsByClassName('secondary-navbar secondary-navbar-selected')[0];
    root.insertBefore(el, root.firstChild);
}

//Scrolls to top of document
async function ScrollToTop() {
    try {
        var conversation = document.querySelector("#app > div > div > main > div > div.contact-pane.margin-right-25 > div > div.conversation-pane.conversation-pane--scrollshadow-top");
        conversation.scrollTop = 0;
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved');
            }, 2000);
        });
    } catch (e) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve('resolved');
            }, 2000);
        });
    }
}

async function obtemConsolaManual() {
    var consolaStates = document.getElementById('btn-rep-states');
    var divEstado = consolaStates.getElementsByTagName('div')[1];
    await AtualizaEstadoConsola(divEstado.textContent);
}

function popupResultado(msg, duration, type, opacity, quantidadeMensagens, resumo, numeroCaso) {
    console.log('TEMP ALERT: ' + msg);
    var frameCaso = document.getElementById('wow-content-' + numeroCaso);
    var frameMediacao = frameCaso.contentDocument.querySelector('[title="Fenrir"]')

    var el = frameMediacao.contentDocument.createElement("div");
    var color = 'yellow';
    var fontcolor = 'black';
    if (type == 'success') {
        color = 'green';
        fontcolor = 'white';
    }
    else if (type == 'warning') {
        color = 'orange';
        fontcolor = 'white';
    }
    else if (type == 'danger') {
        color = 'red';
        fontcolor = 'white';
    }

    el.setAttribute("style", "position:absolute;bottom:0%;left:0%;width: 100%;background-color:" + color + ";color:" + fontcolor + ";opacity:" + opacity + "%;text-align:center");
    el.innerHTML = htmlPopupAlerta(quantidadeMensagens, resumo);
    setTimeout(function () {
        el.parentNode.removeChild(el);
    }, duration);

    var root = document.getElementsByClassName('secondary-navbar secondary-navbar-selected')[0];
    root.insertBefore(el, root.firstChild);
}

function htmlPopupAlerta(quantidadeMensagens, resumo){
    var html = ''+

    '<div style="width:50%;z-index: -1">' + 

    '<p><span style="color:#c0392b; font-family:Arial, Helvetica, sans-serif"><span style="font-size:20px"><strong>MEDIA&Ccedil;&Otilde;ES</strong></span></span></p>'+

    '<p><span style="color:#c0392b; font-family:Arial, Helvetica, sans-serif"><span style="font-size:16px"><strong>Quantidade de mensagens trocadas</strong></span><span style="font-size:20px"><strong>: </strong></span></span><span style="font-family:Arial, Helvetica, sans-serif"><span style="font-size:12px">'+quantidadeMensagens+'</span></span></p>'+
    
    '<p><span style="color:#c0392b; font-family:Arial, Helvetica, sans-serif"><span style="font-size:16px"><strong>Perfil dos envolvidos</strong></span><span style="font-size:20px"><strong>:&nbsp;</strong></span></span><span style="font-family:Arial,Helvetica,sans-serif"><span style="font-size:12px">'+resumo+'</span></span></p>'+
    
    '<p>&nbsp;</p>'+
    
    '<p><span style="font-size:16px"><strong>Esse resumo foi &uacute;til?</strong></span></p>'+
    
    '<p>SIM&nbsp; &nbsp; &nbsp; &nbsp;NAO</p>' +

    '</div>'
    return html;
}