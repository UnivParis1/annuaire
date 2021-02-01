// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import VueTranslate from 'vue-translate-plugin'
import App from './App.vue'
import router from './router'
import Translations from './translations'
import GlobalMixin from './GlobalMixin'
import VueCompositionAPI from '@vue/composition-api'
import 'core-js/modules/es.promise'; // needed by vue-async-computed (why does it not go through babel transform-runtime?)
import 'core-js/modules/es.array.find';
import './directives';

Vue.use(VueCompositionAPI)
Vue.use(VueTranslate)
Vue.locales(Translations)
Vue.mixin(GlobalMixin);

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
