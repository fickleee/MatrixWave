<template>
  <div>
    <Card style="height: 600px">
      <svg
        id="svgMatrix"
        className="svgMatrix"
        style="height: 560px; width: 1000px"
      >
        <g id="blue_line"></g>
        <g id="zoom"></g>
      </svg>
    </Card>
  </div>
</template>
<script>
import * as d3 from 'd3'
export default {
  data () {
    return {
      colorArr: [
        '#670a67', '#810c81', '#9a3d9a', '#a755a7', '#c086c0', '#FFFFFF',
        '#FFE0A3', '#FFC168', '#FF9D2D', '#FFA500', '#FF7800'
      ],
      pageColor: [
        '#008080', '#1F78B4', '#E66100', '#33A02C', '#FFA500',
        '#6A3D9A', '#FF7F00', '#B15928', '#B2DF8A', '#FB9A99',
        '#988ED5', '#FFD92F', '#8C564B', '#A6CEE3', '#000000'
      ],
      pages: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Off'],
      // 0-13 + off length:15
      dataSetA: this.dataSet(),
      dataSetB: this.dataSet(),
      // steps: 7,
      nodeMaxVol: 0,
      nodeMinVol: 1000,
      linkMaxVol: 0,
      linkMinVol: 1000,
      // page data
      dataAForSteps: [],
      dataBForSteps: [],
      dataForSteps: [],
      changeForSteps: [],
      // link data
      linkDataA: [],
      linkDataB: [],
      linksData: [],
      changeForLinks: [],
      // length data
      rect_edge: 12,
      rect_max: 12,
      rect_min: 2,
      height_max: 60,
      height_min: 10,
      // page交互逻辑
      page_lock: 0,
      page_lock_id: "",
      red_rect_lock: 0,
      red_rect_id: "",
      red_rect_lock_id: "",
      page_lock_set: [],
      link_lock_set: [],
      // link交互逻辑
      link_lock: 0,
      link_lock_id: "",
      // page_lock与link_lock最多只能有一个为1（00，01，10）
    }
  },
  // 组件通信
  computed: {
    steps () {
      return this.$store.state.steps
    },
    node_filter () {
      return this.$store.state.node_filter
    },
    link_filter () {
      return this.$store.state.link_filter
    },
  },
  // 监测限制条件的变化重新刷新页面绘图
  watch: {
    steps: {
      handler () {
        this.refresh()
      }
    },
    node_filter: {
      handler () {
        this.refresh()
      }
    },
    link_filter: {
      handler () {
        this.refresh()
      }
    }
  },
  // 初始化
  mounted () {
    this.stepData()
    this.linkData()
    this.zoom()
    this.render()
  },
  methods: {
    // svg缩放平移
    zoom () {
      const svg = d3.select('#svgMatrix')
      const g = d3.select('#zoom')
      const line_g = d3.select('#blue_line')
      svg.call(d3.zoom().scaleExtent([1.0, 2.0]).on("zoom", (event) => {
        g.attr("transform", event.transform)
        line_g.attr("transform", event.transform)
      }))
    },
    // 产生随机的数据
    dataSet () {
      let data = []
      let times = [0, 0, 0, 0, 0, 0, 0]
      for (let i = 0; i < 100; i++) {
        let steps = Math.ceil(Math.random() * 7)
        while (steps >= 1 && Math.random > 0.98 - 0.12 * (steps + 1)) steps--
        times[steps - 1]++
        let string = []
        for (let j = 0; j < steps; j++) {
          let randomNum
          if (j < 3) randomNum = Math.floor(Math.random() * 14)
          else if (j < 5) randomNum = Math.floor(Math.random() * 8)
          else if (j < 6) randomNum = Math.floor(Math.random() * 4)
          else randomNum = Math.floor(Math.random() * 2)
          while (j != 0 && randomNum == string[j - 1]) {
            if (j < 3) randomNum = Math.floor(Math.random() * 14)
            else if (j < 5) randomNum = Math.floor(Math.random() * 8)
            else if (j < 6) randomNum = Math.floor(Math.random() * 4)
            else randomNum = Math.floor(Math.random() * 2)
          }
          string.push(randomNum)
        }
        data.push(string)
      }
      return data
    },
    // 处理两个数据集中每一步的每个页面的对应流量和变化
    stepData () {
      let stepMaxVol = 0, stepMinVol = 1000
      let dataAForSteps = [], dataBForSteps = [], dataForSteps = [], changeForSteps = []
      for (let i = 0; i < this.steps; i++) {
        let onceVolA = [], onceVolB = [], onceVol = [], change = []
        for (let j = 0; j < this.pages.length - 1; j++) {
          let timesA = 0, timesB = 0
          this.dataSetA.map((data) => {
            if (data[i] == j) {
              timesA++
            }
          })
          this.dataSetB.map((data) => {
            if (data[i] == j) {
              timesB++
            }
          })
          let changeRate = 0
          if (timesA == 0 && timesB == 0) changeRate = 0
          else if (timesA == 0) changeRate = 1e9 // 无穷
          else changeRate = Number((timesB / timesA - 1).toFixed(5))
          onceVolA.push(timesA)
          onceVolB.push(timesB)
          onceVol.push(timesA + timesB)
          change.push(changeRate)
        }
        let offVolA = 0, offVolB = 0
        this.dataSetA.map((data) => {
          if (data[i] == undefined && data[i - 1] != undefined) {
            offVolA++
          }
        })
        this.dataSetB.map((data) => {
          if (data[i] == undefined && data[i - 1] != undefined) {
            offVolB++
          }
        })
        let changeRate = 0
        if (offVolA == 0 && offVolB == 0) changeRate = 0
        else if (offVolA == 0) changeRate = 1e9 // 无穷
        else changeRate = Number((offVolB / offVolA - 1).toFixed(5))
        change.push(changeRate)
        changeForSteps.push(change)
        onceVolA.push(offVolA)
        onceVolB.push(offVolB)
        onceVol.push(offVolA + offVolB)
        onceVol.map((data) => {
          if (data > stepMaxVol) {
            stepMaxVol = data
          }
          if (data != 0 && data < stepMinVol) {
            stepMinVol = data
          }
        })
        dataAForSteps.push(onceVolA)
        dataBForSteps.push(onceVolB)
        dataForSteps.push(onceVol)
      }
      // 过滤
      this.$store.commit('setNodeMax', stepMaxVol)
      this.$store.commit('setNodeMin', stepMinVol)
      dataForSteps.map((stepData, i) => {
        stepData.map((data, j) => {
          if (data > this.node_filter) {
            dataForSteps[i][j] = 0
          }
        })
      })
      this.nodeMaxVol = stepMaxVol
      this.nodeMinVol = stepMinVol
      this.dataAForSteps = dataAForSteps
      this.dataBForSteps = dataBForSteps
      this.dataForSteps = dataForSteps
      this.changeForSteps = changeForSteps
    },
    // 处理两个数据集中每一步发生页面跳转的对应流量和变化
    linkData () {
      let linkMaxVol = 0, linkMinVol = 1000
      let linkDataA = [], linkDataB = [], linksData = [], changeForLinks = []
      for (let i = 0; i < this.steps - 1; i++) {
        let onceVolA = [], onceVolB = [], onceVol = [], onceChange = []
        for (let j = 0; j < this.pages.length - 1; j++) {
          let volA = [], volB = [], vol = [], change = []
          for (let k = 0; k < this.pages.length - 1; k++) {
            let timesA = 0, timesB = 0
            this.dataSetA.map((data) => {
              if (data[i] == j && data[i + 1] == k) {
                timesA++
              }
            })
            this.dataSetB.map((data) => {
              if (data[i] == j && data[i + 1] == k) {
                timesB++
              }
            })
            let changeRate = 0
            if (timesA == 0 && timesB == 0) changeRate = 0
            else if (timesA == 0) changeRate = 1e9 // 无穷
            else changeRate = Number((timesB / timesA - 1).toFixed(5))
            change.push(changeRate)
            volA.push(timesA)
            volB.push(timesB)
            vol.push(timesA + timesB)
          }
          let offVolA = 0, offVolB = 0
          this.dataSetA.map((data) => {
            if (data[i] == j && data[i + 1] == undefined) {
              offVolA++
            }
          })
          this.dataSetB.map((data) => {
            if (data[i] == j && data[i + 1] == undefined) {
              offVolB++
            }
          })
          let changeRate = 0
          if (offVolA == 0 && offVolB == 0) changeRate = 0
          else if (offVolA == 0) changeRate = 1e9 // 无穷
          else changeRate = Number((offVolB / offVolA - 1).toFixed(5))
          change.push(changeRate)
          onceChange.push(change)
          volA.push(offVolA)
          volB.push(offVolB)
          vol.push(offVolA + offVolB)
          onceVolA.push(volA)
          onceVolB.push(volB)
          onceVol.push(vol)
          vol.map((data) => {
            if (data > linkMaxVol) {
              linkMaxVol = data
            }
            if (data != 0 && data < linkMinVol) {
              linkMinVol = data
            }
          })
        }
        changeForLinks.push(onceChange)
        linkDataA.push(onceVolA)
        linkDataB.push(onceVolB)
        linksData.push(onceVol)
      }
      this.$store.commit('setLinkMax', linkMaxVol)
      this.$store.commit('setLinkMin', linkMinVol)
      // 过滤link
      linksData.map((stepData1, i) => {
        stepData1.map((stepData2, j) => {
          stepData2.map((data, k) => {
            if (data > this.link_filter) {
              linksData[i][j][k] = 0
            }
          })

        })
      })
      this.changeForLinks = changeForLinks
      this.linkDataA = linkDataA
      this.linkDataB = linkDataB
      this.linksData = linksData
      this.linkMinVol = linkMinVol
      this.linkMaxVol = linkMaxVol
    },
    // 渲染界面
    render () {
      const g = d3.select('#zoom')
      // 起始点
      let start_x = 50, start_y = 200
      // 先处理每一步的页面数，计算相应的页面矩形长度
      let pageNums = [], pagesDetail = []
      for (let i = 0; i < this.steps; i++) pageNums.push(0)
      // console.log(this.dataForSteps)
      this.dataForSteps.map((stepData, index) => {
        let detail = []
        stepData.map((data, idx) => {
          if (data != 0 && data != undefined) {
            pageNums[index]++
            detail.push(idx)
          }
        })
        pagesDetail.push(detail)
      })
      // console.log(pageNums)
      // console.log(pagesDetail)
      // 画步数的圆形标识\每一次跳转矩阵的虚线框\pages的label
      let circleR = 12
      let circle_centerX = start_x - circleR / Math.sqrt(2), circle_centerY = start_y - circleR / Math.sqrt(2)
      let label_x = start_x + (this.height_max / 2 + pageNums[1] * this.rect_edge + 1.5 * this.rect_edge) / Math.sqrt(2) + this.rect_edge / 2 / Math.sqrt(2)
      let label_y = start_y - (this.height_max / 2 + pageNums[1] * this.rect_edge + 1.5 * this.rect_edge) / Math.sqrt(2) + this.rect_edge / 2 / Math.sqrt(2)
      for (let i = 0; i < this.steps; i++) {
        g.append('circle')
          .attr('cx', circle_centerX)
          .attr('cy', circle_centerY)
          .attr('r', circleR - 3)
          .attr('fill', 'none')
          .attr('stroke', 'black')
        g.append('text')
          .attr('x', circle_centerX - circleR / 2 / Math.sqrt(2))
          .attr('y', circle_centerY + circleR / 2 / Math.sqrt(2))
          .text(i + 1)
        for (let j = 0; j < pageNums[i]; j++) {
          g.append('circle')
            .attr('cx', label_x)
            .attr('cy', label_y)
            .attr('r', this.rect_edge / 2)
            .attr('fill', this.pageColor[pagesDetail[i][j]])
            .attr('stroke', 'none')
          label_x = label_x + this.rect_edge / Math.sqrt(2)
          label_y = label_y + this.rect_edge / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
        }
        if (i != this.steps - 1) {
          if (i % 2 == 0) {
            label_x = label_x + (this.rect_edge + this.height_max - this.rect_edge * (pageNums[i + 1] + 1)) / Math.sqrt(2)
            label_y = label_y + (this.rect_edge + this.height_max + this.rect_edge * (pageNums[i + 1] + 1)) / Math.sqrt(2)
          }
          else {
            label_x = label_x + (this.rect_edge + this.height_max - this.rect_edge * (pageNums[i + 1] + 1)) / Math.sqrt(2)
            label_y = label_y - (this.rect_edge + this.height_max + this.rect_edge * (pageNums[i + 1] + 1)) / Math.sqrt(2)
          }
          if (i != this.steps - 2) {
            label_x = label_x + this.rect_edge * pageNums[i + 2] / Math.sqrt(2)
            label_y = label_y + this.rect_edge * pageNums[i + 2] / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
          }
          else {
            label_x = label_x - (this.rect_edge * pageNums[i] + this.height_max + this.rect_edge * 3) / Math.sqrt(2)
            label_y = label_y - (this.rect_edge * pageNums[i] + this.height_max + this.rect_edge * 3) / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
          }
        }
        let rect_str = ""
        if (i % 2 == 0) {
          let rect_x = circle_centerX + (circleR + this.height_max / 2) / Math.sqrt(2), rect_y = circle_centerY + (circleR - this.height_max / 2) / Math.sqrt(2)
          rect_str = rect_str + String(rect_x) + "," + String(rect_y) + " "
          rect_x = rect_x + this.rect_edge * pageNums[i] / Math.sqrt(2), rect_y = rect_y + this.rect_edge * pageNums[i] / Math.sqrt(2)
          rect_str = rect_str + String(rect_x) + "," + String(rect_y) + " "
          rect_x = rect_x + this.rect_edge * pageNums[i + 1] / Math.sqrt(2), rect_y = rect_y - this.rect_edge * pageNums[i + 1] / Math.sqrt(2)
          rect_str = rect_str + String(rect_x) + "," + String(rect_y) + " "
          rect_x = rect_x - this.rect_edge * pageNums[i] / Math.sqrt(2), rect_y = rect_y - this.rect_edge * pageNums[i] / Math.sqrt(2)
          rect_str = rect_str + String(rect_x) + "," + String(rect_y)
          circle_centerX = circle_centerX + (circleR + pageNums[i] * this.rect_edge) / Math.sqrt(2) + (2 * this.height_max / 2 - circleR) / Math.sqrt(2)
          circle_centerY = circle_centerY + (circleR + pageNums[i] * this.rect_edge) / Math.sqrt(2) + this.rect_edge / Math.sqrt(2)
        }
        else {
          let rect_x = circle_centerX + (circleR + this.height_max / 2) / Math.sqrt(2), rect_y = circle_centerY - (circleR - this.height_max / 2) / Math.sqrt(2)
          rect_str = rect_str + String(rect_x) + "," + String(rect_y) + " "
          rect_x = rect_x + this.rect_edge * pageNums[i + 1] / Math.sqrt(2), rect_y = rect_y + this.rect_edge * pageNums[i + 1] / Math.sqrt(2)
          rect_str = rect_str + String(rect_x) + "," + String(rect_y) + " "
          rect_x = rect_x + this.rect_edge * pageNums[i] / Math.sqrt(2), rect_y = rect_y - this.rect_edge * pageNums[i] / Math.sqrt(2)
          rect_str = rect_str + String(rect_x) + "," + String(rect_y) + " "
          rect_x = rect_x - this.rect_edge * pageNums[i + 1] / Math.sqrt(2), rect_y = rect_y - this.rect_edge * pageNums[i + 1] / Math.sqrt(2)
          rect_str = rect_str + String(rect_x) + "," + String(rect_y)
          circle_centerX = circle_centerX + (circleR + pageNums[i] * this.rect_edge) / Math.sqrt(2) + (2 * this.height_max / 2 - circleR) / Math.sqrt(2)
          circle_centerY = circle_centerY - (circleR + pageNums[i] * this.rect_edge) / Math.sqrt(2) - circleR / Math.sqrt(2)
        }
        if (i == this.steps - 1) continue
        g.append("polygon")
          .attr("points", rect_str)
          .attr("fill", "none")
          .attr("stroke", "#999999")
          .attr("stroke-dasharray", "6, 6")
      }
      // 画每一列矩形
      let draw_rect = []
      let draw_centerX = start_x, draw_centerY = start_y
      for (let i = 0; i < this.steps; i++) {
        pagesDetail[i].map((page, index) => {
          let draw_string = ""
          let data = this.dataForSteps[i][page]
          if (data == 0) return
          let rect_length = (data - this.nodeMinVol) / (this.nodeMaxVol - this.nodeMinVol) * (this.height_max - this.height_min) + this.height_min
          if (i % 2 == 0) {
            let x = draw_centerX - rect_length / 2 / Math.sqrt(2), y = draw_centerY + rect_length / 2 / Math.sqrt(2)
            draw_string = draw_string + String(x) + "," + String(y) + " "
            x = x + this.rect_edge / Math.sqrt(2), y = y + this.rect_edge / Math.sqrt(2)
            draw_string = draw_string + String(x) + "," + String(y) + " "
            x = x + rect_length / Math.sqrt(2), y = y - rect_length / Math.sqrt(2)
            draw_string = draw_string + String(x) + "," + String(y) + " "
            x = x - this.rect_edge / Math.sqrt(2), y = y - this.rect_edge / Math.sqrt(2)
            draw_string = draw_string + String(x) + "," + String(y)
            draw_centerX = draw_centerX + this.rect_edge / Math.sqrt(2)
            draw_centerY = draw_centerY + this.rect_edge / Math.sqrt(2)
          }
          else {
            let x = draw_centerX + rect_length / 2 / Math.sqrt(2), y = draw_centerY + rect_length / 2 / Math.sqrt(2)
            draw_string = draw_string + String(x) + "," + String(y) + " "
            x = x + this.rect_edge / Math.sqrt(2), y = y - this.rect_edge / Math.sqrt(2)
            draw_string = draw_string + String(x) + "," + String(y) + " "
            x = x - rect_length / Math.sqrt(2), y = y - rect_length / Math.sqrt(2)
            draw_string = draw_string + String(x) + "," + String(y) + " "
            x = x - this.rect_edge / Math.sqrt(2), y = y + this.rect_edge / Math.sqrt(2)
            draw_string = draw_string + String(x) + "," + String(y)
            draw_centerX = draw_centerX + this.rect_edge / Math.sqrt(2)
            draw_centerY = draw_centerY - this.rect_edge / Math.sqrt(2)
          }
          let colorIndex
          if (this.changeForSteps[i][page] <= -1) {
            colorIndex = 0
          }
          else if (this.changeForSteps[i][page] >= 1) {
            colorIndex = 10
          }
          else {
            colorIndex = Number(((this.changeForSteps[i][page] + 1) / 2 * 10).toFixed(0))
          }
          let this_ = this
          // page
          g.append("polygon")
            .attr("points", draw_string)
            .attr("fill", this.colorArr[colorIndex])
            .attr("stroke", "black")
            .attr("class", "page_rect") // page矩阵class
            .attr("id", "P" + String(i) + String(page)) // page矩阵id
            .attr("lock", 0)
            .on("mouseover", function () {
              // 画page对应的一条长矩形
              if (i != this_.steps - 1) {
                let rel_x = start_x, rel_y = start_y
                for (let j = 0; j < i; j++) {
                  rel_x = rel_x + (pageNums[j] * this_.rect_edge + this_.height_max) / Math.sqrt(2)
                  rel_y = rel_y + (pageNums[j] * this_.rect_edge) / Math.sqrt(2) * (j % 2 == 0 ? 1 : -1)
                }
                let red_x = rel_x + ((index + 1) * this_.rect_edge + this_.height_max / 2) / Math.sqrt(2)
                let red_y = rel_y + ((index + 1) * this_.rect_edge - this_.height_max / 2) / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
                let red_str = "" + String(red_x) + "," + String(red_y) + " "
                red_x = red_x + this_.rect_edge * pageNums[i + 1] / Math.sqrt(2)
                red_y = red_y - this_.rect_edge * pageNums[i + 1] / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
                red_str = red_str + String(red_x) + "," + String(red_y) + " "
                red_x = red_x - this_.rect_edge / Math.sqrt(2)
                red_y = red_y - this_.rect_edge / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
                red_str = red_str + String(red_x) + "," + String(red_y) + " "
                red_x = red_x - this_.rect_edge * pageNums[i + 1] / Math.sqrt(2)
                red_y = red_y + this_.rect_edge * pageNums[i + 1] / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
                red_str = red_str + String(red_x) + "," + String(red_y)
                g.append("polygon")
                  .attr("points", red_str)
                  .attr("fill", "none")
                  .attr("stroke", "red")
                  .attr("class", "red_str")
                  .attr("id", "R" + String(i) + "R" + String(page)) // 鼠标经过形成的红框id
                this_.red_rect_id = "R" + String(i) + "R" + String(page)
              }
              // 没有page被选中时
              if (this_.page_lock == 0) {
                d3.selectAll('.page_rect')
                  .attr('opacity', 0.2)

                d3.select(this)
                  .attr('opacity', 1)
                  .attr('stroke', 'red')
                d3.selectAll('.color_rect')
                  .attr("opacity", 0.2)
                d3.selectAll('.black_rect')
                  .attr("opacity", 0.2)
                // 后续相关节点也高亮
                let pageSet = []
                if (page != 14) {
                  pageSet.push(page)
                }
                for (let index = i; index < this_.steps - 1; index++) {
                  let newSet = new Set()
                  if (pageSet.length == 0) break
                  pageSet.map((pageFrom) => {
                    this_.linksData[index][pageFrom].map((data, pageTo) => {
                      if (this_.linksData[index][pageFrom][pageTo] > 0) {
                        if (pageTo != 14) {
                          newSet.add(pageTo)
                        }
                        d3.select("#C" + String(index) + "C" + String(pageFrom) + "C" + String(pageTo))
                          .attr("opacity", 1)
                        d3.select("#B" + String(index) + "B" + String(pageFrom) + "B" + String(pageTo))
                          .attr("opacity", 1)
                        d3.select("#P" + String(index + 1) + String(pageTo))
                          .attr("opacity", 1)

                      }
                    })
                  })
                  pageSet = [...newSet]
                }
              }
              else {
                d3.select(this)
                  .attr('opacity', 1)
                  .attr('stroke', 'red')
                pagesDetail[i + 1].map((nextPage) => {
                  d3.select("#C" + String(i) + "C" + String(page) + "C" + String(nextPage))
                    .attr("opacity", 1)
                  d3.select("#B" + String(i) + "B" + String(page) + "B" + String(nextPage))
                    .attr("opacity", 1)
                })
              }


              // 提示框(都有)
              {
                let x = this.points[1].x
                let y = this.points[1].y
                g.append("rect")
                  .attr("x", x)
                  .attr("y", y + 10)
                  .attr("rx", 10)
                  .attr("ry", 10)
                  .attr("width", 170)
                  .attr("height", 50)
                  .attr("fill", "white")
                  .attr("opacity", 0.8)
                  .attr("stroke", "black")
                  .attr("class", "tip")
                g.append("text")
                  .attr("x", x + 5)
                  .attr("y", y + 30)
                  .text("Pages:" + this_.pages[page])
                  .attr("class", "tip")
                g.append("text")
                  .attr("x", x + 5)
                  .attr("y", y + 50)
                  .text("Visitors: " + this_.dataAForSteps[i][page] + ", " + this_.dataBForSteps[i][page] + " (" + (100 * this_.changeForSteps[i][page]).toFixed(2) + "%)")
                  .attr("class", "tip")
              }
            })
            .on("mouseleave", function () {
              if (this_.page_lock == 0) {
                d3.selectAll('.page_rect')
                  .attr('opacity', 1)
                  .attr('stroke', 'black')
                d3.selectAll('.color_rect')
                  .attr('opacity', 1)
                d3.selectAll('.black_rect')
                  .attr('opacity', 1)
              }
              else {
                if (d3.select(this).attr('id') != this_.page_lock_id) {
                  if (!this_.page_lock_set.includes("#P" + String(i) + String(page))) {
                    d3.select(this)
                      .attr('opacity', 0.2)
                      .attr('stroke', 'black')

                    pagesDetail[i + 1].map((nextPage) => {
                      if (!this_.page_lock_set.includes("#C" + String(i) + "C" + String(page) + "C" + String(nextPage))) {
                        d3.select("#C" + String(i) + "C" + String(page) + "C" + String(nextPage))
                          .attr("opacity", 0.2)
                        d3.select("#B" + String(i) + "B" + String(page) + "B" + String(nextPage))
                          .attr("opacity", 0.2)
                      }

                    })
                  }
                  else {
                    d3.select(this)
                      .attr('stroke', 'black')
                  }




                }
              }
              if (this_.red_rect_id != "") {
                d3.select("#" + this_.red_rect_id).remove()
              }
              d3.selectAll(".tip").remove()
            })
            .on("click", function () {
              // 有line后都不要红框
              this_.page_lock_set = []
              this_.link_lock_set = []
              d3.selectAll(".red_str").remove()
              if (d3.select(this).attr('id') == this_.page_lock_id) {
                this_.page_lock = 0
                this_.page_lock_id = ""
                d3.selectAll('.line').remove()
                d3.selectAll('.page_rect')
                  .attr('opacity', 1)
                  .attr('stroke', 'black')
                d3.selectAll('.color_rect')
                  .attr('opacity', 1)
                d3.selectAll('.black_rect')
                  .attr('opacity', 1)
                this_.red_rect_lock = 0
                // 谜之bug 必须删除两次...
                if (this_.red_rect_lock_id != "") {
                  d3.select("#" + this_.red_rect_lock_id).remove()
                  d3.select("#" + this_.red_rect_lock_id).remove()
                }
                this_.red_rect_id = ""
                this_.red_rect_lock_id = ""
              }
              else {
                if (this_.page_lock == 0) {
                  this_.page_lock = 1
                  this_.page_lock_id = d3.select(this).attr('id')
                }
                else {
                  this_.page_lock_id = d3.select(this).attr('id')
                  d3.selectAll('.line').remove()
                  d3.selectAll('.page_rect')
                    .attr('opacity', 0.2)
                    .attr('stroke', 'black')
                  d3.select(this)
                    .attr('opacity', 1)
                    .attr('stroke', 'red')
                  d3.selectAll('.color_rect')
                    .attr("opacity", 0.2)
                  d3.selectAll('.black_rect')
                    .attr("opacity", 0.2)
                }


                let line_g = d3.select('#blue_line')
                let pageSet = []
                if (page != 14) {
                  pageSet.push(page)
                }
                for (let index = i; index < this_.steps - 1; index++) {
                  let newSet = new Set()
                  if (pageSet.length == 0) break
                  pageSet.map((pageFrom) => {
                    this_.linksData[index][pageFrom].map((data, pageTo) => {
                      if (this_.linksData[index][pageFrom][pageTo] > 0) {
                        if (pageTo != 14) {
                          newSet.add(pageTo)
                        }
                        d3.select("#C" + String(index) + "C" + String(pageFrom) + "C" + String(pageTo))
                          .attr("opacity", 1)
                        d3.select("#B" + String(index) + "B" + String(pageFrom) + "B" + String(pageTo))
                          .attr("opacity", 1)
                        d3.select("#P" + String(index + 1) + String(pageTo))
                          .attr("opacity", 1)
                        this_.page_lock_set.push("#P" + String(index + 1) + String(pageTo))
                        this_.link_lock_set.push("#C" + String(index) + "C" + String(pageFrom) + "C" + String(pageTo))
                        this_.link_lock_set.push("#B" + String(index) + "B" + String(pageFrom) + "B" + String(pageTo))

                        // 画line
                        let base = d3.select("#C" + String(index) + "C" + String(pageFrom) + "C" + String(pageTo)).attr('points')
                        let strArr = base.split(" ")[0].split(",")
                        let x = Number(strArr[0]), y = Number(strArr[1])
                        let x1 = x + this_.rect_edge / Math.sqrt(2), y1 = y
                        let x2 = x1 - (this_.rect_edge * (0.5 + pagesDetail[index + 1].indexOf(pageTo))) / Math.sqrt(2)
                        let y2 = y1 + (this_.rect_edge * (0.5 + pagesDetail[index + 1].indexOf(pageTo))) / Math.sqrt(2) * (index % 2 == 0 ? 1 : -1)
                        let x3 = x1 + (this_.rect_edge * (0.5 + pageNums[index] - pagesDetail[index].indexOf(pageFrom) - 1)) / Math.sqrt(2)
                        let y3 = y1 + (this_.rect_edge * (0.5 + pageNums[index] - pagesDetail[index].indexOf(pageFrom) - 1)) / Math.sqrt(2) * (index % 2 == 0 ? 1 : -1)
                        line_g.append("line")
                          .attr("x1", x1)
                          .attr("x2", x2)
                          .attr("y1", y1)
                          .attr("y2", y2)
                          .attr("stroke", 'blue')
                          .attr("class", 'line')
                        line_g.append("line")
                          .attr("x1", x1)
                          .attr("x2", x3)
                          .attr("y1", y1)
                          .attr("y2", y3)
                          .attr("stroke", 'blue')
                          .attr("class", 'line')

                      }
                    })
                  })
                  pageSet = [...newSet]
                }


                this_.red_rect_lock = 1
                // if (i != this_.steps - 1) {
                //   let rel_x = start_x, rel_y = start_y
                //   for (let j = 0; j < i; j++) {
                //     rel_x = rel_x + (pageNums[j] * this_.rect_edge + this_.height_max) / Math.sqrt(2)
                //     rel_y = rel_y + (pageNums[j] * this_.rect_edge) / Math.sqrt(2) * (j % 2 == 0 ? 1 : -1)
                //   }
                //   let red_x = rel_x + ((index + 1) * this_.rect_edge + this_.height_max / 2) / Math.sqrt(2)
                //   let red_y = rel_y + ((index + 1) * this_.rect_edge - this_.height_max / 2) / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
                //   let red_str = "" + String(red_x) + "," + String(red_y) + " "
                //   red_x = red_x + this_.rect_edge * pageNums[i + 1] / Math.sqrt(2)
                //   red_y = red_y - this_.rect_edge * pageNums[i + 1] / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
                //   red_str = red_str + String(red_x) + "," + String(red_y) + " "
                //   red_x = red_x - this_.rect_edge / Math.sqrt(2)
                //   red_y = red_y - this_.rect_edge / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
                //   red_str = red_str + String(red_x) + "," + String(red_y) + " "
                //   red_x = red_x - this_.rect_edge * pageNums[i + 1] / Math.sqrt(2)
                //   red_y = red_y + this_.rect_edge * pageNums[i + 1] / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
                //   red_str = red_str + String(red_x) + "," + String(red_y)
                //   // g.append("polygon")
                //   //   .attr("points", red_str)
                //   //   .attr("fill", "none")
                //   //   .attr("stroke", "red")
                //   //   .attr("class", "red_str")
                //   //   .attr("id", "R" + String(i) + "R" + String(page)) // 鼠标经过形成的红框id

                //   if (this_.red_rect_lock_id == "") {
                //     this_.red_rect_lock_id = "R" + String(i) + "R" + String(page)
                //   }
                //   else {
                //     d3.select("#" + this_.red_rect_lock_id).remove()
                //     this_.red_rect_lock_id = "R" + String(i) + "R" + String(page)
                //   }

                // }
              }
            })
          draw_rect.push(draw_string)
        })
        draw_centerX = draw_centerX + this.height_max / Math.sqrt(2)
      }

      // 画changeForLinks代表的矩形（固定边长） + 交互逻辑
      let changeRect_x = start_x + this.height_max / 2 / Math.sqrt(2)
      let changeRect_y = start_y - this.height_max / 2 / Math.sqrt(2)
      for (let i = 0; i < this.steps - 1; i++) { // 每一步
        let row_x = changeRect_x, row_y = changeRect_y
        pagesDetail[i].map((j) => { // 每一行
          let col_x = row_x, col_y = row_y
          pagesDetail[i + 1].map((k) => { // 每一列
            if (j != 14 && this.linksData[i][j][k] != 0) {
              let colorIndex
              let data = this.changeForLinks[i][j][k]
              if (data <= -1) {
                colorIndex = 0
              }
              else if (data >= 1) {
                colorIndex = 10
              }
              else {
                colorIndex = Number(((data + 1) / 2 * 10).toFixed(0))
              }
              // 小矩阵轨迹
              let x = col_x, y = col_y
              let path = "" + String(x) + "," + String(y) + " "
              x = x + this.rect_edge / Math.sqrt(2), y = y + this.rect_edge / Math.sqrt(2)
              path = path + String(x) + "," + String(y) + " "
              x = x + this.rect_edge / Math.sqrt(2), y = y - this.rect_edge / Math.sqrt(2)
              path = path + String(x) + "," + String(y) + " "
              x = x - this.rect_edge / Math.sqrt(2), y = y - this.rect_edge / Math.sqrt(2)
              path = path + String(x) + "," + String(y)
              let this_ = this
              g.append("polygon")
                .attr("points", path)
                .attr("fill", this.colorArr[colorIndex])
                .attr("stroke", "white")
                .attr("class", "color_rect")
                .attr("id", "C" + String(i) + "C" + String(j) + "C" + String(k))
                .on("mouseover", function () {
                  if (this_.page_lock == 0 && this_.link_lock == 0) {
                    d3.selectAll(".color_rect")
                      .attr("opacity", 0.2)
                    d3.selectAll(".black_rect")
                      .attr("opacity", 0.2)
                    d3.selectAll(".page_rect")
                      .attr("opacity", 0.2)

                    d3.select(this)
                      .attr("opacity", 1)
                    d3.select("#B" + String(i) + "B" + String(j) + "B" + String(k))
                      .attr("opacity", 1)
                    d3.select("#P" + String(i) + String(j))
                      .attr("opacity", 1)
                    d3.select("#P" + String(i + 1) + String(k))
                      .attr("opacity", 1)
                    // 后续相关节点也高亮
                    let pageSet = []
                    if (k != 14) {
                      pageSet.push(k)
                    }
                    for (let index = i + 1; index < this_.steps - 1; index++) {
                      let newSet = new Set()
                      if (pageSet.length == 0) break
                      pageSet.map((pageFrom) => {
                        this_.linksData[index][pageFrom].map((data, pageTo) => {
                          if (this_.linksData[index][pageFrom][pageTo] > 0) {
                            if (pageTo != 14) {
                              newSet.add(pageTo)
                            }
                            d3.select("#C" + String(index) + "C" + String(pageFrom) + "C" + String(pageTo))
                              .attr("opacity", 1)
                            d3.select("#B" + String(index) + "B" + String(pageFrom) + "B" + String(pageTo))
                              .attr("opacity", 1)
                            d3.select("#P" + String(index + 1) + String(pageTo))
                              .attr("opacity", 1)

                          }
                        })
                      })
                      pageSet = [...newSet]
                    }
                  }
                  else {
                    d3.select(this)
                      .attr("opacity", 1)
                    d3.select("#B" + String(i) + "B" + String(j) + "B" + String(k))
                      .attr("opacity", 1)
                    d3.select("#P" + String(i) + String(j))
                      .attr("opacity", 1)
                    d3.select("#P" + String(i + 1) + String(k))
                      .attr("opacity", 1)
                  }
                  // 两条红框
                  {
                    let x = this.points[0].x, y = this.points[0].y
                    let str1 = "", str2 = ""
                    // 第一条
                    let x1, y1
                    x1 = x - (i % 2 == 0 ? j : k) * this_.rect_edge / Math.sqrt(2) // bug?
                    y1 = y - (i % 2 == 0 ? j : k) * this_.rect_edge / Math.sqrt(2)
                    str1 = str1 + String(x1) + "," + String(y1) + " "
                    x1 = x1 + (i % 2 == 0 ? pageNums[i] : pageNums[i + 1]) * this_.rect_edge / Math.sqrt(2)
                    y1 = y1 + (i % 2 == 0 ? pageNums[i] : pageNums[i + 1]) * this_.rect_edge / Math.sqrt(2)
                    str1 = str1 + String(x1) + "," + String(y1) + " "
                    x1 = x1 + this_.rect_edge / Math.sqrt(2)
                    y1 = y1 - this_.rect_edge / Math.sqrt(2)
                    str1 = str1 + String(x1) + "," + String(y1) + " "
                    x1 = x1 - (i % 2 == 0 ? pageNums[i] : pageNums[i + 1]) * this_.rect_edge / Math.sqrt(2)
                    y1 = y1 - (i % 2 == 0 ? pageNums[i] : pageNums[i + 1]) * this_.rect_edge / Math.sqrt(2)
                    str1 = str1 + String(x1) + "," + String(y1)
                    // 第二条
                    let x2, y2
                    x2 = x - (i % 2 == 0 ? k : j) * this_.rect_edge / Math.sqrt(2) // bug?
                    y2 = y + (i % 2 == 0 ? k : j) * this_.rect_edge / Math.sqrt(2)
                    str2 = str2 + String(x2) + "," + String(y2) + " "
                    x2 = x2 + this_.rect_edge / Math.sqrt(2)
                    y2 = y2 + this_.rect_edge / Math.sqrt(2)
                    str2 = str2 + String(x2) + "," + String(y2) + " "
                    x2 = x2 + (i % 2 == 0 ? pageNums[i + 1] : pageNums[i]) * this_.rect_edge / Math.sqrt(2)
                    y2 = y2 - (i % 2 == 0 ? pageNums[i + 1] : pageNums[i]) * this_.rect_edge / Math.sqrt(2)
                    str2 = str2 + String(x2) + "," + String(y2) + " "
                    x2 = x2 - this_.rect_edge / Math.sqrt(2)
                    y2 = y2 - this_.rect_edge / Math.sqrt(2)
                    str2 = str2 + String(x2) + "," + String(y2)
                    g.append("polygon")
                      .attr("points", str1)
                      .attr("fill", "none")
                      .attr("stroke", "red")
                      .attr("class", "red_rect")
                    g.append("polygon")
                      .attr("points", str2)
                      .attr("fill", "none")
                      .attr("stroke", "red")
                      .attr("class", "red_rect")
                  }
                  // 提示框
                  {
                    let x = this.points[1].x
                    let y = this.points[1].y
                    g.append("rect")
                      .attr("x", x)
                      .attr("y", y + 10)
                      .attr("rx", 10)
                      .attr("ry", 10)
                      .attr("width", 170)
                      .attr("height", 50)
                      .attr("fill", "white")
                      .attr("opacity", 0.8)
                      .attr("stroke", "black")
                      .attr("class", "tip")
                    g.append("text")
                      .attr("x", x + 5)
                      .attr("y", y + 30)
                      .text("Link: from " + this_.pages[j] + " to " + this_.pages[k])
                      .attr("class", "tip")
                    g.append("text")
                      .attr("x", x + 5)
                      .attr("y", y + 50)
                      .text("Visitors: " + this_.linkDataA[i][j][k] + ", " + this_.linkDataB[i][j][k] + " (" + (this_.changeForLinks[i][j][k] == 1e9 ? "infinite" : ((100 * this_.changeForLinks[i][j][k]).toFixed(2) + "%")) + ")")
                      .attr("class", "tip")
                  }
                })
                .on("mouseleave", function () {
                  d3.selectAll(".tip").remove()
                  d3.selectAll(".red_rect").remove()
                  if (this_.page_lock == 0 && this_.link_lock == 0) {
                    d3.selectAll(".color_rect")
                      .attr("opacity", 1)
                    d3.selectAll(".black_rect")
                      .attr("opacity", 1)
                    d3.selectAll(".page_rect")
                      .attr("opacity", 1)
                  }
                  else if (this_.page_lock == 1) {
                    if (!this_.link_lock_set.includes("#C" + String(i) + "C" + String(j) + "C" + String(k))) {
                      d3.select(this)
                        .attr('opacity', 0.2)
                      d3.select("#B" + String(i) + "B" + String(j) + "B" + String(k))
                        .attr('opacity', 0.2)
                      if (!this_.page_lock_set.includes("#P" + String(i) + String(j))) {
                        d3.select("#P" + String(i) + String(j))
                          .attr('opacity', 0.2)
                      }
                      if (!this_.page_lock_set.includes("#P" + String(i + 1) + String(k))) {
                        d3.select("#P" + String(i + 1) + String(k))
                          .attr('opacity', 0.2)
                      }

                    }
                  }
                  else if (this_.link_lock == 1) {
                    if (d3.select(this).attr('id') != this_.link_lock_id) {
                      if (!this_.link_lock_set.includes("#C" + String(i) + "C" + String(j) + "C" + String(k))) {
                        d3.select(this)
                          .attr('opacity', 0.2)
                        d3.select("#B" + String(i) + "B" + String(j) + "B" + String(k))
                          .attr('opacity', 0.2)
                        if (!this_.page_lock_set.includes("#P" + String(i) + String(j))) {
                          d3.select("#P" + String(i) + String(j))
                            .attr('opacity', 0.2)
                        }
                        if (!this_.page_lock_set.includes("#P" + String(i + 1) + String(k))) {
                          d3.select("#P" + String(i + 1) + String(k))
                            .attr('opacity', 0.2)
                        }

                      }

                    }
                  }

                })
                .on("click", function () {
                  this_.page_lock_set = []
                  this_.link_lock_set = []
                  d3.selectAll(".red_rect").remove()
                  if (d3.select(this).attr('id') == this_.link_lock_id) {
                    this_.link_lock = 0
                    this_.link_lock_id = ""
                    d3.selectAll('.line').remove()
                    d3.selectAll('.page_rect')
                      .attr('opacity', 1)
                      .attr('stroke', 'black')
                    d3.selectAll('.color_rect')
                      .attr('opacity', 1)
                    d3.selectAll('.black_rect')
                      .attr('opacity', 1)
                    // 不确定需不需要。。
                    // this_.red_rect_lock = 0
                    // // 谜之bug 必须删除两次...
                    // if (this_.red_rect_lock_id != "") {
                    //   d3.select("#" + this_.red_rect_lock_id).remove()
                    //   d3.select("#" + this_.red_rect_lock_id).remove()
                    // }
                    // this_.red_rect_id = ""
                    // this_.red_rect_lock_id = ""
                  }
                  else {
                    if (this_.link_lock == 0) {
                      this_.link_lock = 1
                      this_.link_lock_id = d3.select(this).attr('id')
                    }
                    else {
                      this_.link_lock_id = d3.select(this).attr('id')
                      d3.selectAll('.line').remove()
                      d3.selectAll('.page_rect')
                        .attr('opacity', 0.2)
                        .attr('stroke', 'black')
                      d3.select(this)
                        .attr('opacity', 1)
                        .attr('stroke', 'red')
                      d3.selectAll('.color_rect')
                        .attr("opacity", 0.2)
                      d3.selectAll('.black_rect')
                        .attr("opacity", 0.2)
                    }
                    let line_g = d3.select('#blue_line')
                    // 补上第i步没画的线和高亮
                    let line_x = this.points[0].x + this_.rect_edge / Math.sqrt(2)
                    let line_y = this.points[0].y

                    line_g.append("line")
                      .attr("x1", line_x)
                      .attr("x2", line_x + (0.5 + pageNums[i] - pagesDetail[i].indexOf(j) - 1) * this_.rect_edge / Math.sqrt(2))
                      .attr("y1", line_y)
                      .attr("y2", line_y + (i % 2 == 0 ? 1 : -1) * (0.5 + pageNums[i] - pagesDetail[i].indexOf(j) - 1) * this_.rect_edge / Math.sqrt(2))
                      .attr("stroke", 'blue')
                      .attr("class", 'line')
                    line_g.append("line")
                      .attr("x1", line_x)
                      .attr("x2", line_x - (0.5 + pagesDetail[i + 1].indexOf(k)) * this_.rect_edge / Math.sqrt(2))
                      .attr("y1", line_y)
                      .attr("y2", line_y + (0.5 + pagesDetail[i + 1].indexOf(k)) * this_.rect_edge / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1))
                      .attr("stroke", 'blue')
                      .attr("class", 'line')
                    d3.select(this)
                      .attr("opacity", 1)
                    d3.select("#P" + String(i) + String(j))
                      .attr("opacity", 1)
                    d3.select("#P" + String(i + 1) + String(k))
                      .attr("opacity", 1)
                    this_.page_lock_set.push("#P" + String(i) + String(j))
                    this_.link_lock_set.push("#C" + String(i) + "C" + String(j) + "C" + String(k))
                    this_.link_lock_set.push("#B" + String(i) + "B" + String(j) + "B" + String(k))
                    let pageSet = []
                    if (k != 14) {
                      pageSet.push(k)
                    }
                    for (let index = i + 1; index < this_.steps - 1; index++) {
                      let newSet = new Set()
                      if (pageSet.length == 0) break
                      pageSet.map((pageFrom) => {
                        this_.linksData[index][pageFrom].map((data, pageTo) => {
                          if (this_.linksData[index][pageFrom][pageTo] > 0) {
                            if (pageTo != 14) {
                              newSet.add(pageTo)
                            }
                            d3.select("#C" + String(index) + "C" + String(pageFrom) + "C" + String(pageTo))
                              .attr("opacity", 1)
                            d3.select("#B" + String(index) + "B" + String(pageFrom) + "B" + String(pageTo))
                              .attr("opacity", 1)
                            d3.select("#P" + String(index + 1) + String(pageTo))
                              .attr("opacity", 1)
                            this_.page_lock_set.push("#P" + String(index + 1) + String(pageTo))
                            this_.link_lock_set.push("#C" + String(index) + "C" + String(pageFrom) + "C" + String(pageTo))
                            this_.link_lock_set.push("#B" + String(index) + "B" + String(pageFrom) + "B" + String(pageTo))

                            // 画line
                            let base = d3.select("#C" + String(index) + "C" + String(pageFrom) + "C" + String(pageTo)).attr('points')
                            let strArr = base.split(" ")[0].split(",")
                            let x = Number(strArr[0]), y = Number(strArr[1])
                            let x1 = x + this_.rect_edge / Math.sqrt(2), y1 = y
                            let x2 = x1 - (this_.rect_edge * (0.5 + pagesDetail[index + 1].indexOf(pageTo))) / Math.sqrt(2)
                            let y2 = y1 + (this_.rect_edge * (0.5 + pagesDetail[index + 1].indexOf(pageTo))) / Math.sqrt(2) * (index % 2 == 0 ? 1 : -1)
                            let x3 = x1 + (this_.rect_edge * (0.5 + pageNums[index] - pagesDetail[index].indexOf(pageFrom) - 1)) / Math.sqrt(2)
                            let y3 = y1 + (this_.rect_edge * (0.5 + pageNums[index] - pagesDetail[index].indexOf(pageFrom) - 1)) / Math.sqrt(2) * (index % 2 == 0 ? 1 : -1)
                            line_g.append("line")
                              .attr("x1", x1)
                              .attr("x2", x2)
                              .attr("y1", y1)
                              .attr("y2", y2)
                              .attr("stroke", 'blue')
                              .attr("class", 'line')
                            line_g.append("line")
                              .attr("x1", x1)
                              .attr("x2", x3)
                              .attr("y1", y1)
                              .attr("y2", y3)
                              .attr("stroke", 'blue')
                              .attr("class", 'line')

                          }
                        })
                      })
                      pageSet = [...newSet]
                    }

                  }
                })
            }
            col_x = col_x + this.rect_edge / Math.sqrt(2)
            col_y = col_y - this.rect_edge / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
          })
          row_x = row_x + this.rect_edge / Math.sqrt(2)
          row_y = row_y + this.rect_edge / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
        })
        changeRect_x = changeRect_x + (pageNums[i] * this.rect_edge + this.height_max) / Math.sqrt(2)
        changeRect_y = changeRect_y + (pageNums[i] * this.rect_edge + this.height_max) / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
      }
      // 画linksData代表的黑色矩形（不定边长）
      changeRect_x = start_x + this.height_max / 2 / Math.sqrt(2)
      changeRect_y = start_y - this.height_max / 2 / Math.sqrt(2)
      for (let i = 0; i < this.steps - 1; i++) { // 每一步
        let row_x = changeRect_x, row_y = changeRect_y
        pagesDetail[i].map((j) => { // 每一行
          let col_x = row_x, col_y = row_y
          pagesDetail[i + 1].map((k) => { // 每一列
            if (j != 14 && this.linksData[i][j][k] != 0) {
              let data = this.linksData[i][j][k]
              let rel_edge = (data - this.linkMinVol) / (this.linkMaxVol - this.linkMinVol) * (this.rect_max - this.rect_min) + this.rect_min
              // 小矩阵轨迹
              let x = col_x + (this.rect_edge - rel_edge) / 2 * Math.sqrt(2), y = col_y
              let path = "" + String(x) + "," + String(y) + " "
              x = x + rel_edge / Math.sqrt(2), y = y + rel_edge / Math.sqrt(2)
              path = path + String(x) + "," + String(y) + " "
              x = x + rel_edge / Math.sqrt(2), y = y - rel_edge / Math.sqrt(2)
              path = path + String(x) + "," + String(y) + " "
              x = x - rel_edge / Math.sqrt(2), y = y - rel_edge / Math.sqrt(2)
              path = path + String(x) + "," + String(y)
              g.append("polygon")
                .attr("points", path)
                .attr("fill", "black")
                .attr("class", "black_rect")
                .attr("id", "B" + String(i) + "B" + String(j) + "B" + String(k))
            }
            col_x = col_x + this.rect_edge / Math.sqrt(2)
            col_y = col_y - this.rect_edge / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
          })
          row_x = row_x + this.rect_edge / Math.sqrt(2)
          row_y = row_y + this.rect_edge / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
        })
        changeRect_x = changeRect_x + (pageNums[i] * this.rect_edge + this.height_max) / Math.sqrt(2)
        changeRect_y = changeRect_y + (pageNums[i] * this.rect_edge + this.height_max) / Math.sqrt(2) * (i % 2 == 0 ? 1 : -1)
      }
    },
    // 重新处理页面
    refresh () {
      d3.select('#zoom').selectAll('*').remove()
      d3.select('#blue_line').selectAll('*').remove()
      this.stepData()
      this.linkData()
      this.render()
    }
  }
}
</script>