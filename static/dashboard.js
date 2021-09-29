document.addEventListener("DOMContentLoaded", ()=>{
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
  let unit_dict = {I:'A','vsd':'mV','vg':'V','V':'V',R:'ohm'}
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
      updataChartKhubsurati(sweepPlot, run_dict)
    })
  }

  function check_run_health(run_dict) {
    let incomplete_things = [];
    for (let key in run_dict) {
      if (run_dict.hasOwnProperty(key)) {
        if (run_dict[key]==="") {
          incomplete_things.push(key)
        }
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

  let xyValues = [

  ];

  let sweepPlot = new Chart("sweep_plot", {
    type: "scatter",
    data: {
      datasets: [{
        backgroundColor: "rgba(242,26,26,0.87)",
        borderColor: "#4e73df",
        label: "raw",
        pointRadius: 4,
        pointBackgroundColor: "rgba(0,0,255,1)",
        data: xyValues
      }]
    },
    options:{
        responsive: true,
        maintainAspectRatio: false,
        legend: {
        display: true,
        labels: { fontStyle: "normal" }
      },
       scales: {
        xAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'x'
          },
          ticks:{min:-1,max:1}
        }],
        yAxes: [{
          scaleLabel: {
            display: true,
            labelString: 'y'
          },
          ticks:{min:-1,max:1}
        }]
      }
  }
  });

  function clearChart(chart, label) {
    chart.data.datasets[0].data = [];
    chart.update();
  }

  function addData(chart, label, data) {
    // chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(data);
    });
    chart.update();
  }

  function updataChartKhubsurati(chart, param_dict) {
    chart.data.datasets[0].label = param_dict.fixed_var + ': ' + param_dict.fixed_var_val + ' (' + unit_dict[param_dict.fixed_var] + ')';
    chart.options = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: param_dict.sweep_var + ' (' + unit_dict[param_dict.sweep_var] + ')'
              },
              ticks: {min: (param_dict.sweep_type == "mirror") ? -1*Number(param_dict.sweep_end) : Number(param_dict.sweep_start),
                      max: Number(param_dict.sweep_end)}
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: param_dict.read_param + ' (' + unit_dict[param_dict.read_param] + ')'
              },
            }]
          }
      };
    chart.update();
  }

  let socket = io.connect(location.protocol + '//' + document.domain + ':' + location.port, {cookie: true});
  let startButton = document.getElementById('run_start');
  let stopButton = document.getElementById('run_stop');

  socket.on("connect", ()=>{

    console.log("socket connected");
    startButton.addEventListener("click", (event) => {

      if (run_health) {
        if (sweep_makes_cense(run_dict)) {
          startButton.disabled = true;
          startButton.innerHTML = 'running...';
          startButton.style.backgroundColor = '#f6c23e';
          startButton.style.borderColor = '#f6c23e';
          document.getElementById('card_read').style.pointerEvents = 'none';
          clearChart(sweepPlot,'swap');
          socket.emit("sweep_start", run_dict);
        } else {
          alert('sweep values dont make CeNSE, please check again.')
        }
      } else {
        alert('Please complete following: ' + check_run_health(run_dict).join(' '))
      }


    });

    stopButton.addEventListener("click", (event) => {
      socket.emit("stop_sweep", {'message':'stop this!'});
    });

  })//SocketIO Connect

  socket.on("dara_read", (data) => {
    addData(sweepPlot, 'swap', {x:data.x, y:data.y})
    console.log(data);
  });

  socket.on("sweep_end", () => {
    startButton.disabled = false;
    startButton.innerHTML = 'Start';
    startButton.style.backgroundColor = '#1cc88a';
    startButton.style.borderColor = '#1cc88a';
    document.getElementById('card_read').style.pointerEvents = 'auto';
    console.log("sweep end announce");
  });
})//document loaded
