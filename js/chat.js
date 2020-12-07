var chat = require('http').createServer(resposta);
var fs = require('fs');
var io = require('socket.io')(chat);
var usuarios = [];
var ultimas_mensagens = [];

chat.listen(3000);
console.log("Em execução...");

function resposta (req, res) {
     var arquivo = "";
     if(req.url == "/"){
         arquivo = __dirname + '/index.html';
     }
     else{
         arquivo = __dirname + req.url;
     }
     
     fs.readFile(arquivo,
         function (err, data) {
          if (err) {
                   res.writeHead(404);
                   return res.end("Not Found");
              }
  
              res.writeHead(200);
              res.end(data);
         }
     );
}


io.on("connection", function(socket){

  socket.on("entrar", function(apelido, callback){
      if(!(apelido in usuarios)){
        socket.apelido = apelido;
        usuarios[apelido] = socket;

        for(indice in ultimas_mensagens){
          socket.emit("atualizar mensagens", ultimas_mensagens[indice]);
        }

        var mensagem = "[ " + pegarDataAtual() + " ] " + apelido + " acabou de entrar na sala";
        var obj_mensagem = {msg: mensagem, tipo: "sistema"};

      io.sockets.emit("atualizar usarios", Object.keys(usuarios));
      io.sockets.emit("atualizar mensagens", obj_mensagem);

      armazenaMensagem(obj_mensagem);

        callback(true);
      }
      else{
        callback(false);
      }
  });


  socket.on("enviar mensagem", function(dados, callback){

    var mensagem_enviada = dados.msg;
    var usuario = dados.usu;

        if(usuario == null)
          usuario = " ";

          mensagem_enviada = "[ " + pegarDataAtual() + " ]" + socket.apelido + " diz: " + mensagem_enviada;
          var obj_mensagem = {msg: mensagem_enviada, tipo: ' '};
          
          if(usuario == " "){
                  io.sockets.emit("atualizar mensagens", obj_mensagem);
                  armazenaMensagem(obj_mensagem);
          }
          else{
                  obj_mensagem.tipo = "privada";
                  socket.emit("atualizar mensagns", obj_mensagem);
                  usuarios[usuario].emit("atualizar mensagens", obj_mensagem);
          }
          
          callback();
  });

  socket.on("disconnect", function(){
    delete usuarios[socket.apelido];

    var mensagem = "[ " + pegarDataAtual() + " ] " + socket.apelido + " saiu da sala";
    var obj_mensagem = {msg: mensagem, tipo: "sistema"};
    
    io.sockets.emit("atualizar usuarios", Object.keys(usuarios));
    io.sockets.emit("atualizar mensagens", obj_mensagem);

    armazenaMensagem(obj_mensagem);
  });
});

function pegarDataAtual(){
  var dataAtual = new Date();
  
  var dia = (dataAtual.getDate()<10 ? "0" : " ") + dataAtual.getDate();
  var mes = ((dataAtual.getMonth() + 1) < 10 ? "0" : " ") + (dataAtual.getMonth() + 1);
  var ano = dataAtual.getFullYear();

  var hora = (dataAtual.getHours()<10  ? "0" : " ") + dataAtual.getHours();
  var minuto = (dataAtual.getMinutes()<10 ? "0" : " ") + dataAtual.getMinutes();
  var segundo = (dataAtual.getSeconds()<10 ? "0" : " ") + dataAtual.getSeconds();

  var dataFomatada = dia + "/" + mes + "/" + ano + "  " + hora + ":" + minuto + ":" + segundo;
  
  return dataFomatada;

}

function armazenaMensagem(mensagem){
  if(ultimas_mensagens.length>5){
    ultimas_mensagens.shift();
  }
  ultimas_mensagens.push(mensagem);
}
