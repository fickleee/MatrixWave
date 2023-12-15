import Vue from 'vue'
import Vuex from 'vuex'
Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        steps: 7,
        node_filter: null,
        link_filter: null,
        node_max: null,
        node_min: null,
        link_max: null,
        link_min: null,
    },
    getters: {
        StepsData (state) {
            return state.steps
        },
        NodeData (state) {
            return state.node_filter
        },
        LinkData (state) {
            return state.link_filter
        },
        nodeMax (state) {
            return state.node_max
        },
        linkMax (state) {
            return state.link_max
        },
        nodeMin (state) {
            return state.node_min
        },
        linkMin (state) {
            return state.link_min
        },
    },
    mutations: {
        setStep (state, val) {
            state.steps = val
        },
        setNode (state, val) {
            state.node_filter = val
        },
        setLink (state, val) {
            state.link_filter = val
        },
        setNodeMax (state, val) {
            state.node_max = val
        },
        setLinkMax (state, val) {
            state.link_max = val
        },
        setNodeMin (state, val) {
            state.node_min = val
        },
        setLinkMin (state, val) {
            state.link_min = val
        },
    },
    actions: {

    }
})

export default store