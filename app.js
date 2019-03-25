let chart = document.getElementById('chart')
let ctx = chart.getContext('2d')

chart.width = innerWidth - 30
chart.height = innerHeight / 2
chart.style.width = (innerWidth - 30) + 'px'
chart.style.height = (innerHeight / 2) + 'px'

let chart_map = document.getElementById('chart_map')
let ctxMinMap = chart_map.getContext('2d')

chart_map.width = innerWidth - 30
chart_map.style.width = (innerWidth - 30) + 'px'
chart_map.height = innerHeight / 5
chart_map.style.height = (innerHeight / 5) + 'px'

let history = document.getElementById('history')
let switcher = document.getElementById('switch')

let win = document.getElementById('window')
let settings = chart_map.getBoundingClientRect()
win.style.height = settings.height + 'px'
win.style.top = settings.top + 'px'
win.style.width = settings.width + 'px'
win.style.left = (settings.left + 10) + 'px'

let showed = document.getElementById('showed')

showed.style.left = 0 + 'px'
showed.style.top = 0 + 'px'
showed.style.bottom = 0 + 'px'
showed.style.right = 0 + 'px'

let toggle_switcher = true
switcher.innerHTML = 'Switch to Day Mode'
switcher.addEventListener('click', function (e) {
  if (toggle_switcher) {
    switcher.innerHTML = 'Switch to Night Mode'
  } else {
    switcher.innerHTML = 'Switch to Day Mode'
  }
  document.body.classList.toggle('night_mode')
  toggle_switcher = !toggle_switcher
})



function init(data) {
  let colors = data.colors
  let columns = data.columns
  let names = data.names
  let types = data.types
  ctx.beginPath();
  for (const key in colors) {
    if (colors.hasOwnProperty(key)) {
      const color = colors[key];
      let data_line = columns.find((column) => {
        return key === column[0]
      })
      data_line = data_line.slice(1)
      ctx.strokeStyle = color
      ctxMinMap.strokeStyle = color
      const length_data = data_line.length
      let min = Math.min(...data_line)
      let max = Math.max(...data_line)
      let o = chart.height / max // вычисляем коэффициент отношения
      let minO = chart_map.height / max // вычисляем для миникарты
      ctx.moveTo(0, chart.height - (data_line[0] * o))
      ctxMinMap.moveTo(0, chart_map.height - (data_line[0] * minO))
      data_line.forEach((h, i) => {
        ctx.lineTo(chart.width / length_data * i, chart.height - (h * o))
        ctxMinMap.lineTo(chart_map.width / length_data * i, chart_map.height - (h * minO))
      })
      ctx.stroke()
      ctx.moveTo(0, chart.height - (data_line[0] * o))
      ctx.closePath();
      ctxMinMap.stroke()
    }
  }
}

function show(data, start, end) {
  start = start || 0;
  end = end || chart_map.width;
  let colors = data.colors
  let columns = data.columns
  let names = data.names
  let types = data.types
  ctx.clearRect(0, 0, chart.width, chart.height)
  ctx.beginPath();
  for (const key in colors) {
    if (colors.hasOwnProperty(key)) {
      const color = colors[key];
      let data_line = columns.find((column) => {
        return key === column[0]
      })
      data_line = data_line.slice(1)
      data_line = data_line.filter((h, i, arr) => {
        let m = (chart.width / arr.length * i)
        return (start <= m && m <= end) && h
      })
      ctx.strokeStyle = color
      const length_data = data_line.length
      let min = Math.min(...data_line)
      let max = Math.max(...data_line)
      let o = chart.height / max // вычисляем коэффициент отношения
      let minO = chart_map.height / max // вычисляем для миникарты
      ctx.moveTo(0, chart.height - (data_line[0] * o))
      data_line.forEach((h, i) => {
        ctx.lineTo(chart.width / length_data * i, chart.height - (h * o))
      })
      ctx.stroke()
      ctx.moveTo(0, chart.height - (data_line[0] * o))
      ctx.closePath();
    }
  }
}

init(chart_data[0])

let moveble = false
function down(e) {moveble = true}
function up(e) {moveble = false}

function move(e) {
  if (moveble) {
    let left = e.target.id === 'showed' ? (Number(showed.style.left.slice(0, showed.style.left.length - 2)) + e.offsetX) : e.offsetX
    showed.style.left = left + 'px'
    let right = chart.width
    show(chart_data[0], left, right)
  }
}

function touchmove(e){
  if (moveble) {
    console.log(e)
    let firstTouch = e.targetTouches[0]
    let left = firstTouch.target.id === 'showed' ? (Number(showed.style.left.slice(0, showed.style.left.length - 2)) + firstTouch.clientX) : firstTouch.clientX
    showed.style.left = left + 'px'
    let right = chart.width
    show(chart_data[0], left, right)
  }
}
win.addEventListener('mousedown', down)
win.addEventListener('mouseup', up)
win.addEventListener('mousemove', move)


win.addEventListener('touchstart', down)
win.addEventListener('touchend', up)
win.addEventListener('touchmove', touchmove)