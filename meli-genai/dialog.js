document.addEventListener('DOMContentLoaded', function () {

    //init();
    // AtualizaCasos();
    // window.setInterval(carregaTempos, 1000);

    document.getElementById('btnInformacoesUteis').addEventListener(
        'click', function(){
            avaliaInformacaoUtil(true, document.getElementById('idGenAi').textContent);
            finalizacao();
        });

        document.getElementById('resumo').addEventListener(
            'click', function(){
                copiar();
            });

    document.getElementById('btnInformacoesNaoUteis').addEventListener(
        'click', function(){
            avaliaInformacaoUtil(false, document.getElementById('idGenAi').textContent);
            finalizacao();
        });

    document.getElementById('fecharModal').addEventListener(
        'click', fechaModal);

    populaDados();

})

function copiar() {
    // Get the text field
    var copyText = document.getElementById('resumo');
    navigator.clipboard.writeText(copyText.textContent);
  
    exibeModal('Texto copiado!');
  }
  

async function populaDados(){
    var dados = await chrome.runtime.sendMessage({ name: "carrega-dados"});
    console.log(dados);
    document.getElementById('resumo').textContent = dados.resumo;
    document.getElementById('qtdMensagens').textContent = dados.mensagens;
    document.getElementById('idGenAi').textContent = dados.id;
}

function finalizacao(){
    document.getElementById('btnInformacoesUteis').setAttribute("disabled","disabled");
    document.getElementById('btnInformacoesNaoUteis').setAttribute("disabled","disabled");
    exibeModal('Obrigado pelo feedback');
}

//EXIBE A DIV MODAL
function exibeModal(texto) {
    document.getElementById('texto-popup').textContent = texto;
    $('#popup').modal('show');
}

//FECHA A DIV MODAL
function fechaModal() {
    $('#popup').modal('hide');
}

function avaliaInformacaoUtil(avaliacao, id){

    var url = "https://smartbko-kwai.teleperformance.com.br/tpgenai-mercadolivre-api";
    var json = MontaCorpo(avaliacao, id);
    var retornoAPI = GetResponse('POST', url + '/AtualizarInformacaoUtil', false, "application/json", json);
    console.log(retornoAPI);
    return retornoAPI;
}

function MontaCorpo(avaliacao, id) {
    var data = JSON.stringify({
        "Id": id,
        "Util": avaliacao
      });

    console.log('===== CORPO =====');
    console.log(data);
    return data;
}

function GetResponse(method, uri, syncrhonous, contentType, body) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(method, uri, syncrhonous);
    xmlHttp.setRequestHeader("Content-Type", contentType);
    console.log('BODY');
    console.log(body);
    xmlHttp.send(body);
    return xmlHttp.responseText;
}