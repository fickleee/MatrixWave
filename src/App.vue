<template>
  <div id="app">
    <Row>
        <Col span="3">
            <Control></Control>
        </Col>
        <Col span="15">
            <Board></Board>
        </Col>
        <Col span="5">
            <Label></Label>
        </Col>
    </Row>
  </div>
</template>

<script>
import Control from './components/Control'
import Board from './components/Board'
import Label from './components/Label'

export default {
  name: 'App',
  components: {
    Control,
    Board,
    Label
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
