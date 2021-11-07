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
  let unit_dict = {I:'nA','vsd':'mV','vg':'V','V':'V',R:'ohm'}
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

  let xyValues = [];

  let sweepPlot = new Chart("sweep_plot", {
    type: "scatter",
    data: {
      datasets: [{
        backgroundColor: "#4e73df",
        borderColor: "#4e73df",
        label: "raw",
        pointRadius: 4,
        pointBackgroundColor: "#4e73df",
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

  let histPlot;

  function changeDatasetColor(chart, e) {
    let colorHex = (e.target.value.startsWith('#')) ? e.target.value : '#' + e.target.value;
    chart.data.datasets[0].backgroundColor = colorHex;
    chart.data.datasets[0].borderColor = colorHex;
    chart.data.datasets[0].pointBackgroundColor = colorHex;
    e.target.style.backgroundColor = colorHex;
    e.target.style.color = '#FAFAFA';
    chart.update();
  }

  function changeMarker(chart,e) {
    let shape = e.target.value;
    chart.data.datasets[0].pointStyle= shape;
    chart.update();
  }

  function changeMarkerSize(chart,e) {
    let size = e.target.value;
    chart.data.datasets[0].pointRadius= size;
    chart.update();
  }

  function attachEvent(elemId,eType,funHandle,chart) {
    document.getElementById(elemId).addEventListener(eType, (e) => {
      if (chart) {
        funHandle(chart, e)
      }
    })
  }

  attachEvent('sw-marker-color-ip','change',changeDatasetColor,sweepPlot);
  attachEvent('sw-marker-shape','change',changeMarker,sweepPlot);
  attachEvent('sw-marker-size','change',changeMarkerSize,sweepPlot);

  function clearChart(chart, label) {
    chart.data.datasets[0].data = [];
    // chart.data.datasets[0].backgroundColor= "#858796",
    // chart.data.datasets[0].borderColor= "#858796",
    // chart.data.datasets[0].label= "old",
    // chart.data.datasets[0].pointBackgroundColor= "#858796",
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
              ticks: {min: (param_dict.sweep_type == "mirror") ? -1*(Number(param_dict.sweep_end)) : Number(param_dict.sweep_start),
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
  let updateHistory = document.getElementById('update_history')
  let historyCard = document.getElementById('history_card')

  socket.on("connect", ()=>{
    console.log("socket connected");
    socket.emit("list_history", {'message':'list_history!'});
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

    updateHistory.addEventListener("click", (event) => {
      socket.emit("list_history", {'message':'list_history!'});
    })

    historyCard.addEventListener("click", (e) => {
      let cl = e.target.classList;
      let eId = [...cl].filter((i)=>{return i.endsWith('.csv')})[0];
      // cl.filter((i)=>{return i.endsWith('.csv')});
      socket.emit("get_file_data", {'fname':eId})
    })
  })//SocketIO Connect

  socket.on("dara_read", (data) => {
    addData(sweepPlot, 'raw', {x:data.x, y:data.y})
    console.log(data);
  });

  socket.on("sweep_end", (data) => {
    startButton.disabled = false;
    startButton.innerHTML = 'Start';
    startButton.style.backgroundColor = '#1cc88a';
    startButton.style.borderColor = '#1cc88a';
    document.getElementById('card_read').style.pointerEvents = 'auto';
    console.log("sweep end announce");
    console.log(data);
  });

  socket.on("send_history", (data) => {

    let listNode = document.getElementById('datafile_list');
    listNode.innerHTML = '';

    data.datafiles.forEach((item, i) => {
      let li = document.createElement("li")
      li.classList.add("list-group-item")
      li.innerHTML =`
        <div class="row align-items-center no-gutters">
          <div class="col me-2 ${item}"  id="${item}" style="cursor:pointer;">
            <h6 class="mb-0 ${item}"><strong class="${item}" style="font-size: 12px;">${item}</strong></h6><span class="text-xs ${item}">
            ${item.split('_').filter((e)=>{return e.startsWith('h')})[0].split('h')[1]}
            :
            ${item.split('_').filter((e)=>{return e.startsWith('m')})[0].split('m')[1]}
            </span>
          </div>
          <div class="col-auto">
            <button class="btn"><i class="fa fa-download"></i></button>
          </div>
        </div>
        `;
      listNode.appendChild(li);
    });

  });

  socket.on("send_file_data", (data) => {
    document.getElementById('history_plot_leg').innerHTML='';
    let plotData = JSON.parse(data.data);
    let xlabel, ylabel
    [xlabel, ylabel] = data.columns
    let currentColor = document.getElementById('marker-color-ip').value;
    let color = (currentColor==='') ? "#4e73df":
                (currentColor.startsWith('#')) ?
                currentColor :
                '#'+currentColor;
    let shape = (document.getElementById('marker-shape').value==='shape') ? "circle":
            document.getElementById('marker-shape').value;
    let size = (document.getElementById('marker-size').value==="") ? 4:
            document.getElementById('marker-size').value;

    if (histPlot) {
      histPlot.destroy();
    }

    histPlot = new Chart("sweep_history_plot", {
      type: "scatter",
      data: {
        datasets: [{
          backgroundColor: color,
          borderColor: color,
          // label: "raw",
          pointStyle: shape,
          pointRadius: size,
          pointBackgroundColor: color,
          data: plotData
        }]
      },
      options:{
          responsive: true,
          maintainAspectRatio: false,
          legend: {
          display: false,
          labels: { fontStyle: "normal" }
        },
         scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: xlabel
            },
            // ticks:{min:-1,max:1}
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: ylabel
            },
            // ticks:{min:-1,max:1}
          }]
        }
    }
    });

    attachEvent('marker-color-ip','change',changeDatasetColor,histPlot);
    attachEvent('marker-shape','change',changeMarker,histPlot);
    attachEvent('marker-size','change',changeMarkerSize,histPlot);
  });

})//document loaded
