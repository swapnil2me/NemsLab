document.addEventListener("DOMContentLoaded", ()=>{
  console.log('p');

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port, {cookie: true});

  socket.on("connect", ()=>{

    console.log("socket connected");
    let kt26 = document.getElementById('kt26');
    kt26.addEventListener("click", (event) => {
      socket.emit("read_kt_26", {'parameter':'volt','sample':100});
    });

    document.querySelector('form').addEventListener('submit', (e) => {
      e.preventDefault()
      const formData = new FormData(e.target);
      console.log(formData.get('inst'));
      console.log(formData.get('exp'));
      console.log(formData.get('name'));
      console.log(formData.get('param'));
      socket.emit("read_kt_26", {'inst':formData.get('inst'),
                                 'exp':formData.get('exp'),
                                 'name':formData.get('name'),
                                 'param':formData.get('inst')});
    });

    let stopButton = document.getElementById('stop_button');
    stopButton.addEventListener("click", (event) => {
      socket.emit("stop sweep", {'message':'stop this!'});
    });

  })//SocketIO Connect

  socket.on("announce read kt 26", (data) => {
    console.log(data);
  })
})//document loaded
