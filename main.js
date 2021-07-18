import Vue from 'vue'
import App from './App.vue'
import 'leaflet/dist/leaflet.css';
import { LIcon} from 'vue2-leaflet';  //marker แสดง
import vuetify from './plugins/vuetify'

Vue.config.productionTip = false


Vue.component('l-icon', LIcon);  //marker แสดง

new Vue({
  vuetify,
  render: h => h(App)
}).$mount('#app')

