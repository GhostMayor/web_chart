chart = function () {
  let chartMap
  let chart
  let ctx
  let self = {}

  self.init = function (canvas, width, height) {

    this.canvas = canvas
    this.canvas.width = width || innerWidth - 30
    this.canvas.height = height || innerHeight * 0.7
    this.canvas.style.width = this.canvas.width + 'px'
    this.canvas.style.height = this.canvas.height + 'px'
    ctx = this.canvas.getContext('2d')

    ctx.fillStyle = '#FAFAFA'

    let padding = 40

    chartMap = {
      x: padding,
      y: this.canvas.height * 0.8,
      width: this.canvas.width - (padding * 2),
      height: this.canvas.height * 0.2
    }
    chart = {
      x: padding,
      y: 0,
      width: this.canvas.width - (padding * 2),
      height: this.canvas.height * 0.7
    }

    let move = false // TODO: rename

    let mousedown = function (e) {
      if (chartMap.y <= e.offsetY && e.offsetY <= (chartMap.y + chartMap.height)) {
        move = true
      }
    }
    let mouseup = function (e) {
      move = false
    }
    let mousemove = function (e) {
      let x = e.offsetX
      if (move) {
        self.showRange(x)
      }
    }

    this.canvas.addEventListener('mousedown', mousedown)
    this.canvas.addEventListener('mouseup', mouseup)
    this.canvas.addEventListener('mousemove', mousemove)

    let touchdown = function (e) {}
    let touchup = function (e) {
      move = false
    }
    let touchmove = function (e) {}

    this.canvas.addEventListener('touchstart', touchdown)
    this.canvas.addEventListener('touchend', touchup)
    this.canvas.addEventListener('touchmove', touchmove)
  }

  let clearChart = function () {
    ctx.clearRect(chart.x, chart.y, chart.width, chart.height)
  }

  self.showRange = function (start, end) {
    start = start || 0
    end = end || chart.width
    clearChart()
    let data = this.data
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
        data_line = data_line.slice(1) //delete first name
        data_line = data_line.filter((h, i, arr) => {
          let m = (chart.width / arr.length * i)
          return (start <= m && m <= end) && h
        })
        ctx.strokeStyle = color
        const length_data = data_line.length
        const ratio = chart.height / this.max // вычисляем коэффициент отношения
        const ratioForMap = chartMap.height / this.max // вычисляем для миникарты
        // отрисовка основная
        ctx.moveTo(chart.x, chart.height - (data_line[0] * ratio))
        data_line.forEach((h, i) => {
          ctx.lineTo((chart.width / length_data * i) + chart.x, chart.height - (h * ratio))
        })
        ctx.stroke()
        ctx.moveTo(chart.x, chart.height - (data_line[0] * ratio))
        ctx.closePath();
      }
    }
  }

  self.renderMinMax = function () {
    let length_max_str = `${this.max} -`.length
    let toMaxStr = function(str) {
      while (length_max_str > str.length) {
        str = " " + str
      }
      return str
    }
    ctx.fillText(`${this.max} -`, 0, 30);
    let total = 10
    for (let i = 1; i < total; i++) {
      ctx.fillText(toMaxStr(`${Math.round((this.max - this.min) / total * i)} -`), 0, chart.height - (chart.height / total * i) + 30);       
    }
    ctx.fillText(toMaxStr(`${this.min} -`), 0, chart.height + 30);
    
  }

  self.setTextColor = function (color) {
    ctx.fillStyle = color
    self.renderMinMax()
  }

  self.render = function (data) {
    this.data = data
    let colors = data.colors
    let columns = data.columns
    let names = data.names
    let types = data.types
    for (const key in colors) {
      if (colors.hasOwnProperty(key)) {
        const color = colors[key];
        let data_line = columns.find((column) => key === column[0])
        data_line = data_line.slice(1)
        let oldMin = this.min || data_line[0]
        let oldMax = this.max || data_line[0]
        this.min = Math.min(...data_line, oldMin)
        this.max = Math.max(...data_line, oldMax)
      }
    }
    ctx.beginPath();
    for (const key in colors) {
      if (colors.hasOwnProperty(key)) {
        const color = colors[key];
        let data_line = columns.find((column) => {
          return key === column[0]
        })
        data_line = data_line.slice(1) //delete first name
        ctx.strokeStyle = color

        const length_data = data_line.length
        const ratio = chart.height / this.max // вычисляем коэффициент отношения
        const ratioForMap = chartMap.height / this.max // вычисляем для миникарты
        // отрисовка основная
        ctx.moveTo(chart.x, chart.height - (data_line[0] * ratio))
        data_line.forEach((h, i) => {
          ctx.lineTo((chart.width / length_data * i) + chart.x, chart.height - (h * ratio))
        })
        ctx.stroke()
        ctx.moveTo(chart.x, chart.height - (data_line[0] * ratio))
        ctx.closePath();
        // отрисовка карты
        ctx.moveTo(chartMap.x, (chartMap.y + chartMap.height) - (data_line[0] * ratioForMap))
        data_line.forEach((h, i) => {
          ctx.lineTo((chartMap.width / length_data * i) + chartMap.x, (chartMap.y + chartMap.height) - (h * ratioForMap))
        })
        ctx.stroke()
        ctx.moveTo(chartMap.x, (chartMap.y + chartMap.height) - (data_line[0] * ratioForMap))
        ctx.closePath();
      }
    }
    self.renderMinMax()
  }
  return self
}