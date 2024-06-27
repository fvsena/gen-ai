var userinfo = null;
var capturaAtiva = false;
var iniciadoAutomaticamente = false;
var url = {
    host: "https://automation.teleperformance.com.br/smarttab-mercadolivre-api"
}

var genAiResumo = null;
var genAiMensagens = null;
var genAiId = null;

//REMOVIDO ATÉ TER AMBIENTE DE HOMOLOG
// init();
userinfo = {"Username":"genai"}

chrome.storage.local.set({ casos: [] }, function () {
    console.log('Criado instancia de armazenamento de casos');
});

//LISTENER ACIONADO QUANDO HOUVER ALTERACOES NAS ABAS DO CHROME
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {

    if (!iniciadoAutomaticamente) {
        if (ValidatePage(tab)) {
            CapturarCaso();
            capturaAtiva = true;
            iniciadoAutomaticamente = true;
        }
    }
    
})



chrome.runtime.onMessage.addListener(

    function (request, sender, sendResponse) {
        console.log(request);

        if (request.name == "username") {
            sendResponse(userinfo);
        }

        else if (request.name == "url-api") {
            sendResponse(url);
        }
        
        else if (request.name == "refresh-case-list") {
            atualizaCasos();
        }

        else if (request.name == "log") {
            SendLog();
        }

        else if (request.name == "capturar-caso") {
            CapturarCaso();
            sendResponse({iniciado:true});
        }

        else if (request.name == "estado-captura") {
            sendResponse(capturaAtiva);
        }

        else if (request.name == "popup"){

            genAiResumo = request.resumo;
            console.log('genaiResumo = ' + genAiResumo)
            genAiMensagens = request.mensagens
            console.log('genAiMensagens = ' + genAiMensagens)
            genAiId = request.genAiId
            console.log('genAiId = ' + genAiId)
            chrome.tabs.create({
                url: 'dialog.html',
                active: false
            }, function(tab) {
                // After the tab has been created, open a window to inject the tab
                chrome.windows.create({
                    tabId: tab.id,
                    type: 'popup',
                    focused: true,
                    height: 600, width:800
                    // incognito, top, left, ...
                });

                
            });


        }

        else if (request.name == "carrega-dados"){
            console.log('rodando carrega dados');
            console.log('genaiResumo = ' + genAiResumo);
            console.log('genAiMensagens = ' + genAiMensagens);
            sendResponse({resumo:genAiResumo, mensagens:genAiMensagens, id:genAiId});
        }
    }
);

async function CapturarCaso() {

    tabId = await getTabId()
    console.log('TabID: ' + tabId)
    chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['/monitor.js']
    })
}

async function getTabId() {
    var tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    return tabs[0].id;
}

function atualizaCasos() {

}

function ValidatePage(tab) {
    if (tab.url.includes('https://cx-one.adminml.com/')) {
        return true;
    }
    else {
        return false;
    }

}

function init() {

    try {
        connect();

        sendMessageParam('EnvironmentInfo');
    } catch (e) {
        console.log('Erro ao inicializar a comunica��o com o host');
    }
    
}


//ENVIO DE MENSAGEM
function sendMessage() {
    var msg = { "text": document.getElementById("txtMensagem").value };
    sendNativeMessage(msg);
}

//ENVIO DE MENSAGEM
function sendMessageParam(texto) {
    var msg = { "text": texto };
    sendNativeMessage(msg);
}

//HOST - CONEXAO
function connect() {
    var hostName = "tp.ext.host";

    try {
        port = chrome.runtime.connectNative(hostName);
        port.onMessage.addListener(onNativeMessage);
        port.onDisconnect.addListener(onDisconnected);
    } catch (e) {
        console.log(e);
    }
    
}

//HOST - ENVIO DE MENSAGEM
function sendNativeMessage(message) {
    try {
        port.postMessage(message);
    } catch (e) {
        console.log(e);
    }
    
}

//HOST - RECEBIMENTO DE MENSAGEM
function onNativeMessage(message) {
    console.log(message);

    try {
        userinfo = message.data.Content;
        console.log(userinfo);
    } catch (e) {
        console.log(e);
    }
    
}


//HOST - DESCONEX�O
function onDisconnected() {
    port = null;
}