import Vue from 'vue'
import App from './App.vue'
import ViewUI from 'view-design';
import store from './store'
import 'view-design/dist/styles/iview.css';
Vue.config.productionTip = false

Vue.use(ViewUI)

new Vue({
    store,
    render: h => h(App),
}).$mount('#app')