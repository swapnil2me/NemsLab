document.addEventListener("DOMContentLoaded", ()=>{
  console.log('p');
  let sweep_var, fixed_var, run_health;
  let run_dict = {'sweep_var':'',
                  'sweep_start':'',
                  'sweep_step':'',
                  'sweep_end':'',
                  'sweep_type':'',
                  'fixed_var':'',
                  'fixed_var_val':'',
                  'read_param':''
                };
  let i = document.getElementById('vsd_sweep_state');
  i.addEventListener("change", () => {
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
      sweep_var = 'vg';
      fixed_var = 'vsd';
    }
  });

  j.checked = true;
  j.dispatchEvent(new Event('change'));

  let run_dict_elems = document.getElementsByClassName('run_dict_elem');
  for (let elem of run_dict_elems) {
    elem.addEventListener("change", (e) => {
      run_dict['sweep_var'] = sweep_var;
      run_dict['sweep_start'] = document.getElementById(sweep_var+"_sweep_start").value;
      run_dict['sweep_step'] = document.getElementById(sweep_var+"_sweep_step").value;
      run_dict['sweep_end'] = document.getElementById(sweep_var+"_sweep_end").value;
      run_dict['sweep_type'] = document.querySelector('input[name=sweep_direction]:checked').id.split('_')[2]
      run_dict['fixed_var'] = fixed_var;
      run_dict['fixed_var_val'] = document.getElementById(fixed_var+"_sweep_start").value;
      run_dict['read_param'] = document.querySelector('input[name=record_param]:checked').id.split('_')[2];
      // check_run_health(run_dict)
      run_health = check_run_health(run_dict).length === 0;
      console.log(run_health);
    })
  }

  function check_run_health(run_dict) {
    let incomplete_things = [];
    for (let key in run_dict) {
      if (run_dict.hasOwnProperty(key)) {
        if (run_dict[key]==="") {
          incomplete_things.push(key)
        }
        // console.log(key,run_dict[key]==="");
      }
    }
    return incomplete_things
  }

  function sweep_makes_cense(run_dict) {
    if (run_dict['sweep_start']+run_dict['sweep_step'] >= run_dict['sweep_end']) {
      return false
    }
    return true
  }

  let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port, {cookie: true});

  socket.on("connect", ()=>{

    console.log("socket connected");
    let startButton = document.getElementById('run_start');
    startButton.addEventListener("click", (event) => {

      if (run_health) {
        if (sweep_makes_cense(run_dict)) {
          console.log(run_health);
          startButton.disabled = true;
          document.getElementById('card_read').style.pointerEvents = 'none';
          socket.emit("read_kt_26", {'parameter':'volt','sample':100});
        } else {
          alert('sweep values dont make CeNSE, please check again.')
        }
      } else {
        console.log( check_run_health(run_dict).join(' '));
        alert('Please complete following: ' + check_run_health(run_dict).join(' '))
      }


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
