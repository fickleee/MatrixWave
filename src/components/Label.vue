<template>
  <div>
    <Card>
      <h3 style="text-align: left">Node encodings</h3>
      <Row style="height: 80px" :gutter="16">
        <Col span="3" style="margin-top: 40px">{{ node_min }}</Col>
        <Col v-for="item in arr" :key="item" span="1">
          <svg>
            <rect
              x="2"
              :y="50 - 2.5 * (item + 1)"
              width="12"
              :height="5 + 5 * (item + 1)"
              style="stroke: black; fill: none"
            ></rect>
          </svg>
        </Col>
        <Col
          span="2"
          style="margin-top: 40px; margin-left: 5px; text-align: left"
          >{{ node_max }}</Col
        >
      </Row>

      <Row style="height: 40px" :gutter="16">
        <Col span="3" style="margin-top: 40px">-100%</Col>
        <Col v-for="item in arr" :key="item" span="1">
          <svg>
            <rect
              x="2"
              :y="45"
              width="12"
              height="12"
              :style="{ stroke: 'black', fill: colorArr[item] }"
            ></rect>
          </svg>
        </Col>
        <Col
          span="1"
          style="margin-top: 40px; margin-left: 5px; text-align: left"
          >100%</Col
        >
      </Row>

      <h3 style="text-align: left; margin-top: 40px">Link encodings</h3>
      <Row style="height: 40px" :gutter="16">
        <Col span="3" style="margin-top: 10px">-100%</Col>
        <Col v-for="item in arr" :key="item" span="1">
          <svg>
            <rect
              x="2"
              :y="15"
              width="12"
              height="12"
              :style="{ stroke: 'black', fill: colorArr[item] }"
            ></rect>
          </svg>
        </Col>
        <Col
          span="1"
          style="margin-top: 10px; margin-left: 5px; text-align: left"
          >100%</Col
        >
      </Row>

      <Row style="height: 40px" :gutter="16">
        <Col span="3" style="margin-top: 10px">{{ link_min }}</Col>
        <Col v-for="item in arr" :key="item" span="1">
          <svg>
            <rect
              :x="2 + (5 - 0.5 * item)"
              :y="15 + (5 - 0.5 * item)"
              :width="2 + item"
              :height="2 + item"
              :style="{ stroke: 'black' }"
            ></rect>
          </svg>
        </Col>
        <Col
          span="1"
          style="margin-top: 10px; margin-left: 5px; text-align: left"
          >{{ link_max }}</Col
        >
      </Row>
      <h3 style="text-align: left; margin-top: 10px">Page Groups</h3>
      <Row v-for="(item, index) in pageColor" :key="item" style="height: 15px">
        <svg>
          <rect
            x="5"
            y="5"
            width="12"
            height="12"
            :style="{ stroke: 'black', fill: pageColor[index] }"
          ></rect>
          <text x="20" y="15">{{ pages[index] }}</text>
        </svg>
      </Row>
    </Card>
  </div>
</template>
<script>
export default {
  data () {
    return {
      arr: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      colorArr: [
        '#670a67', '#810c81', '#9a3d9a', '#a755a7', '#c086c0', '#FFFFFF',
        '#FFE0A3', '#FFC168', '#FF9D2D', '#FFA500', '#FF7800'
      ],
      pageColor: [
        '#008080', '#1F78B4', '#E66100', '#33A02C', '#FFA500',
        '#6A3D9A', '#FF7F00', '#B15928', '#B2DF8A', '#FB9A99',
        '#988ED5', '#FFD92F', '#8C564B', '#A6CEE3', '#000000'
      ],
      pages: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Off']
    }
  },
  computed: {
    node_max () {
      return this.$store.state.node_max
    },
    node_min () {
      return this.$store.state.node_min
    },
    link_max () {
      return this.$store.state.link_max
    },
    link_min () {
      return this.$store.state.link_min
    },
  }
}
</script>
