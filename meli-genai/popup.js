var numero;

//FUNCAO DE LEITURA DE STORAGE
var readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], function (result) {
            if (result[key] === undefined) {
                reject();
            } else {
                resolve(result[key]);
            }
        });
    });
};

var keys = [];

//EVENTOS
document.addEventListener('DOMContentLoaded', function () {

    //init();
    // AtualizaCasos();
    // window.setInterval(carregaTempos, 1000);

    document.getElementById('iniciar').addEventListener(
        'click', Iniciar);

    document.getElementById('fecharModal').addEventListener(
        'click', fechaModal);

    // carregaTextoEstado();

})

async function carregaTextoEstado() {
    var estado = await chrome.runtime.sendMessage({ name: "estado-captura" });
    console.log(estado);

    if (estado == true) {
        document.getElementById('iniciar').textContent = "Reiniciar Captura";
    }
    else {
        document.getElementById('iniciar').textContent = "Iniciar";
    }
}

//LOG DE MENSAGEM
function appendMessage(text) {
    document.getElementById('log').innerHTML += text + "<br>";
}

//REALIZA UMA CHAMADA DE URL
function GetResponse(method, uri, syncrhonous, contentType, body) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(method, uri, syncrhonous);
    xmlHttp.setRequestHeader("Content-Type", contentType);
    xmlHttp.send(body);
    return xmlHttp.responseText;
}

//OBT�M A DATA ATUAL
function GetDate() {
    let current = new Date();
    let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
    let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
    let dateTime = cDate + ' ' + cTime;
    return dateTime
}

async function GetCasosPendentes() {
    try {
        var url = await chrome.runtime.sendMessage({ name: "url-api" });
        console.log(url);
        var userinfo = await chrome.runtime.sendMessage({ name: "username" });
        console.log(userInfo);
        var urlConsulta = url.host + '/api/Tabulacao/ObterTabulacoesPendentesUsuarioDia?loginDeRede=' + userinfo.Username;
        console.log(urlConsulta);
        var retornoAPI = GetResponse('GET', urlConsulta, false, "application/json", null);
        console.log(retornoAPI);
        var retornoJson = JSON.parse(retornoAPI);
        console.log(retornoJson);

        return retornoJson.Tabulacoes;

    } catch (e) {

    }
}

//ATUALIZA A LISTA DE CASOS
// async function AtualizaCasos() {

//     console.log('Atualizando token');
//     //var casos = await readLocalStorage('casos');
//     var url = await chrome.runtime.sendMessage({ name: "url-api" });
//     var userinfo = await chrome.runtime.sendMessage({ name: "username" });
//     var urlConsulta = url.host + '/api/Tabulacao/ObterTabulacoesPendentesUsuarioDia?loginDeRede=' + userinfo.Username;
//     var retornoAPI = GetResponse('GET', urlConsulta, false, "application/json", null);
//     var retornoJson = JSON.parse(retornoAPI);
//     console.log(retornoJson);

//     var casos = retornoJson.Tabulacoes;

//     if (casos == undefined) {
//         return;
//     }

//     var bloco = '';
//     var delay = 0;
//     var table = document.getElementById("tabela-casos");
//     var tbody = table.getElementsByTagName('tbody')[0];
//     tbody.innerHTML = '';

//     for (var i = 0; i < casos.length; i++) {
        

//         // Create an empty <tr> element and add it to the 1st position of the table:
//         var row = tbody.insertRow();
//         row.setAttribute("style", "font-size: 75%;");
        
//         // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
//         var cell1 = row.insertCell(0);
//         var cell2 = row.insertCell(1);
//         var cell3 = row.insertCell(2);
//         var cell4 = row.insertCell(3);
//         var cell5 = row.insertCell(4);

//         // Add some text to the new cells:
//         //cell1.innerHTML = casos[i].numero;
//         //cell2.innerHTML = DiferencaTempo(casos[i].abertura);
//         //cell3.innerHTML = '<select id="finalizacao_' + casos[i].numero + '"><option value="-1">--Selecione--</option><option value="1">Encerrado</option><option value="2">Derivado</option><option value="3">Escalado</option><option value="4">Consulta</option></select>';
//         //cell4.innerHTML = '<button class="btn btn-primary btn-sm" value="' + casos[i].numero + '" id="' + casos[i].numero +'"  >Tabular</button>';
//         //cell5.innerHTML = casos[i].abertura;
//         //cell5.setAttribute("style", "visibility: hidden; width:0px; overflow:hidden");
//         //numero = casos[i].numero;
//         //console.log(numero);

//         //document.getElementById(casos[i].numero).addEventListener(
//         //    'click', GravaTabulacao);

//         // Add some text to the new cells:
//         cell1.innerHTML = casos[i].Protocolo;
//         cell2.innerHTML = DiferencaTempo(casos[i].DataHoraInicio);
//         cell3.innerHTML = '<select id="finalizacao_' + casos[i].Protocolo + '"><option value="-1">--Selecione--</option><option value="1">Encerrado</option><option value="2">Derivado</option><option value="3">Escalado</option><option value="4">Consulta</option></select>';
//         cell4.innerHTML = '<button class="btn btn-primary btn-sm" value="' + casos[i].Protocolo + '" id="' + casos[i].Protocolo + '" fila="' + casos[i].Fila + '" abertura="' + casos[i].DataHoraInicio + '" >Tabular</button>';
//         cell5.innerHTML = casos[i].DataHoraInicio;
//         cell5.setAttribute("style", "visibility: hidden; width:0px; overflow:hidden");
//         numero = casos[i].Protocolo;

//         document.getElementById(casos[i].Protocolo).addEventListener(
//             'click', GravaTabulacao);
//     }

    
// }

//MONTA O CORPO DA REQUISICAO DE GRAVACAO DE TABULACAO
function MontaCorpo(username, protocolo, fila, inicio, fim, idTratativa) {
    var json = '{"username": "' + username + '","protocolo": "' + protocolo + '","fila": "' + fila + '","dataHoraInicio": "' + inicio + '","dataHoraFim": "' + fim + '","idTratativa": ' + idTratativa + '}';

    return json;
}

//EFETIVA A GRAVACAO DA TABULACAO
async function GravaTabulacao(e) {

    console.log(e.target);
    console.log(e.target.fila);

    var select = document.getElementById('finalizacao_' + e.target.id);
    var tabulacao = select.selectedOptions[0].value;

    if (tabulacao == "-1") {
        window.alert("Necess�rio escolher uma motivo de tabula��o!");
        return;
    }

    var userinfo = await chrome.runtime.sendMessage({ name: "username" });
    var url = await chrome.runtime.sendMessage({ name: "url-api" });
    console.log(url);
    var json = MontaCorpo(userinfo.Username, e.target.id, e.target.getAttribute("fila"), e.target.getAttribute("abertura"), GetDate(), tabulacao);
    var retornoAPI = GetResponse('POST', url.host + '/api/Tabulacao/AtualizarTabulacao', false, "application/json", json);
    console.log('RETORNO TAB');
    console.log(retornoAPI);
    var retornoJSON = JSON.parse(retornoAPI);
    if (retornoJSON.ProcessOk === true) {
        exibeModal(e.target.id);

        await AtualizaCasos();

        return;
    }
    else {
        window.alert('Ocorreu uma falha ao gravar a tabula��o: ' + retornoJSON.Msg + ' | ' + retornoJSON.MsgCatch);
        return;
    }


    //////////////
    //var lista = await readLocalStorage('casos');

    //for (var i = 0; i < lista.length; i++) {

    //    if (lista[i].numero === e.target.id) {

    //        console.log('Encontrado caso no storage: ' + e.target.id)
    //        var select = document.getElementById('finalizacao_' + lista[i].numero);
    //        var tabulacao = select.selectedOptions[0].value;

    //        if (tabulacao == "-1") {
    //            window.alert("Necess�rio escolher uma motivo de tabula��o!");
    //            return;
    //        }

    //        var userinfo = await chrome.runtime.sendMessage({ name: "username" });
    //        var url = await chrome.runtime.sendMessage({ name: "url-api" });
    //        console.log(url);
    //        var json = MontaCorpo(userinfo.Username, lista[i].numero, lista[i].fila, lista[i].abertura, GetDate(), tabulacao);
    //        var retornoAPI = GetResponse('POST', url.host + '/api/Tabulacao/AtualizarTabulacao', false, "application/json", json);
    //        console.log('RETORNO TAB');
    //        console.log(ret);
    //        var retornoJSON = JSON.parse(retornoAPI);
    //        if (retornoJSON.ProcessOk === true) {
    //            exibeModal(lista[i].numero);

    //            console.log('Lista atualizada antes de remover');
    //            console.log(lista);
    //            lista.splice(i, 1);
    //            console.log('Lista atualizada ap�s remover');
    //            console.log(lista);
    //            await chrome.storage.local.set({ casos: lista }, function () {
    //                console.log('Casos atualizados');
    //            });

    //            await AtualizaCasos();

    //            return;
    //        }
    //        else {
    //            window.alert('Ocorreu uma falha ao gravar a tabula��o: ' + retornoJSON.Msg + ' | ' + retornoJSON.MsgCatch);
    //            return;
    //        }

    //        console.log(retornoAPI);

    //    }

    //}
}

//EXIBE A DIV MODAL
function exibeModal(caso) {
    document.getElementById('idcaso').innerText = caso;
    $('#popup').modal('show');
}

//FECHA A DIV MODAL
function fechaModal() {
    $('#popup').modal('hide');
}

//CARREGA O TEMPO DE DURACAO DO CASO
function carregaTempos() {
    var table = document.getElementById("tabela-casos");
    for (var i = 1; i < table.rows.length; i++) {
        table.rows[i].cells[1].innerHTML = DiferencaTempo(table.rows[i].cells[4].innerHTML);
    }
}

//CALCULA O TEMPO DE DURACAO DO CASO
function DiferencaTempo(dataAbertura) {
    var dataInicio = new Date(dataAbertura.replace(/-/g, "/").replace('T', ' '));
    //console.log(dataInicio);

    var current = new Date();

    // get total seconds between the times
    var delta = Math.abs(dataInicio - current) / 1000;

    // calculate (and subtract) whole days
    var days = Math.floor(delta / 86400);
    delta -= days * 86400;

    // calculate (and subtract) whole hours
    var hours = Math.floor(delta / 3600) % 24;
    delta -= hours * 3600;

    // calculate (and subtract) whole minutes
    var minutes = Math.floor(delta / 60) % 60;
    delta -= minutes * 60;

    // what's left is seconds
    var seconds = Math.floor(delta % 60);  // in theory the modulus is not required

    var horas = hours.toString();
    var minutos = minutes.toString();
    var segundos = seconds.toString();

    if (horas.length == 1) {
        horas = '0' + horas;
    }

    if (minutos.length == 1) {
        minutos = '0' + minutos;
    }

    if (segundos.length == 1) {
        segundos = '0' + segundos;
    }
    var tempo = horas + ':' + minutos + ':' + segundos;
    //console.log(tempo);
    return tempo;

}

//ALTERA O TEMA DO TABULADOR
function mudarTema(tema) {
    if (tema === 'light') {
        document.getElementsByTagName('body')[0].classList.remove('bg-dark');
        document.getElementsByTagName('body')[0].classList.remove('text-white')
        document.getElementsByTagName('body')[0].classList.add('bg-light');
        document.getElementsByTagName('body')[0].classList.remove('text-dark')

    }
}

async function Iniciar() {
    var resposta = await chrome.runtime.sendMessage({ name: "capturar-caso" });
    // document.getElementById('iniciar').textContent = "Reiniciar captura";
}