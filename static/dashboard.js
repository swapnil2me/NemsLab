document.addEventListener("DOMContentLoaded", ()=>{
  console.log('p');
  let sweep_var, fixed_var;
  let i = document.getElementById('vsd_sweep_state');
  i.addEventListener("change", () => {
    console.log(i.checked);
    if (i.checked) {
      let gg = document.getElementsByClassName("sweep_g_params");
      for (g of gg) {
        g.hidden = true;
      }
      document.getElementById('vg_sweep_start').placeholder = 'Vg';
      let ss = document.getElementsByClassName("sweep_sd_params");
      for (s of ss) {
        s.hidden = false;
      }
      document.getElementById('vsd_sweep_start').placeholder = 'Start';
      sweep_var = 'vsd';
      fixed_var = 'vg';
    }
  });

  let j = document.getElementById('vg_sweep_state');
  j.addEventListener("change", () => {
    console.log(j.checked);
    if (j.checked) {
      let gg = document.getElementsByClassName("sweep_g_params");
      for (g of gg) {
        g.hidden = false;
      }
      document.getElementById('vg_sweep_start').placeholder = 'Start';
      let ss = document.getElementsByClassName("sweep_sd_params");
      for (s of ss) {
        s.hidden = true;
      }
      document.getElementById('vsd_sweep_start').placeholder = 'Vs';
      sweep_var = 'vsd';
      fixed_var = 'vg';
    }
  });

  var socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port, {cookie: true});

  socket.on("connect", ()=>{

    console.log("socket connected");
    let startButton = document.getElementById('run_start');
    startButton.addEventListener("click", (event) => {
      startButton.disabled = true;
      document.getElementById('card_read').style.pointerEvents = 'none';
      socket.emit("read_kt_26", {'parameter':'volt','sample':100});

    });

    let stopButton = document.getElementById('run_stop');
    stopButton.addEventListener("click", (event) => {
      socket.emit("stop sweep", {'message':'stop this!'});
    });

  })//SocketIO Connect

  socket.on("announce read kt 26", (data) => {
    console.log(data);
  });

  socket.on("enable start button", () => {
    document.getElementById('run_start').disabled = false;
    document.getElementById('card_read').style.pointerEvents = 'auto';
  });
})//document loaded
