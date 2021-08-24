document.addEventListener("DOMContentLoaded", ()=>{
  console.log('p');

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port, {cookie: true});

  socket.on("connect", ()=>{
    console.log("socket connected");
    let kt26 = document.getElementById('kt26');
    kt26.addEventListener("click", (event) => {
      console.log(kt26);
      socket.emit("read_kt_26", {'parameter':'volt','sample':100});
    });
  })//SocketIO Connect

  socket.on("announce read kt 26", (data) => {
    console.log(data);
  })
})//document loaded
