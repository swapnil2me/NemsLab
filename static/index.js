document.addEventListener("DOMContentLoaded", ()=>{
  console.log('p');
  let sweep_var, fixed_var;
  let i = document.getElementById('sweep_sd');
  i.addEventListener("change", () => {
    console.log(i.checked);
    if (i.checked) {
      document.getElementById('sweep_g_params').hidden = true;
      document.getElementById('g_start').placeholder = 0;
      document.getElementById('sweep_sd_params').hidden = false;
      document.getElementById('sd_start').placeholder = 'start';
      sweep_var = 'vsd';
      fixed_var = 'vg';
    }
  });

  let j = document.getElementById('sweep_g');
  j.addEventListener("change", () => {
    console.log(j.checked);
    if (j.checked) {
      document.getElementById('sweep_sd_params').hidden = true;
      document.getElementById('sd_start').placeholder = 0;
      document.getElementById('sweep_g_params').hidden = false;
      document.getElementById('g_start').placeholder = 'start';
      sweep_var = 'vg';
      fixed_var = 'vsd';
      // document.querySelector('input[name=sweep_type]:checked').id
    }
  });

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
