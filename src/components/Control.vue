<template>
  <div id="panel">
    <Card>
      <h3 style="text-align: left">Datasets</h3>
      <Select v-model="dataset1" style="width: 150px; margin-top: 10px">
        <Option value="dataA">dataA</Option>
        <Option value="dataB" disabled>dataB</Option>
      </Select>
      <Select v-model="dataset2" style="width: 150px; margin-top: 10px">
        <Option value="dataA" disabled>dataA</Option>
        <Option value="dataB">dataB</Option>
      </Select>
      <h3 style="text-align: left; margin-top: 15px">Filters</h3>
      <p style="text-align: left">Node</p>
      <Slider
        id="link"
        v-model="node_filter"
        show-input
        :min="node_filter_min"
        :max="node_filter_max"
      ></Slider>
      <p style="text-align: left">Link</p>
      <Slider
        id="link"
        v-model="link_filter"
        show-input
        :min="link_filter_min"
        :max="link_filter_max"
      ></Slider>
      <p style="text-align: left">Step</p>
      <Slider v-model="step_filter" show-input :min="2" :max="7"></Slider>
      <!-- <h3 style="text-align: left; margin-top: 15px">Search</h3> -->
      <!-- <Input
        v-model="search"
        suffix="ios-search"
        placeholder="Enter text"
        style="width: auto"
      /> -->
    </Card>
  </div>
</template>
<script>
export default {
  created () {
    this.step_filter = this.$store.state.steps
    this.node_filter = this.$store.state.node_max
    this.link_filter = this.$store.state.link_filter
  },
  data () {
    return {
      dataset1: 'dataA',
      dataset2: 'dataB',
      node_filter: null,
      link_filter: null,
      step_filter: null,
      search: ''
    }
  },
  computed: {
    node_filter_max () {
      return this.$store.state.node_max
    },
    node_filter_min () {
      return this.$store.state.node_min
    },
    link_filter_max () {
      return this.$store.state.link_max
    },
    link_filter_min () {
      return this.$store.state.link_min
    },
  },
  watch: {
    step_filter: {
      handler (newValue) {
        this.$store.commit('setStep', newValue)
      }
    },
    node_filter: {
      handler (newValue) {
        this.$store.commit('setNode', newValue)
      }
    },
    link_filter: {
      handler (newValue) {
        this.$store.commit('setLink', newValue)
      }
    },
    node_filter_max: {
      handler (newValue) {
        this.node_filter = newValue
      }
    },
    link_filter_max: {
      handler (newValue) {
        this.link_filter = newValue
      }
    },

  }
}
</script>