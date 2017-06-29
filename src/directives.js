import Vue from 'vue'

Vue.directive('auto-focus', {
    inserted(el) { 
        el.focus();
    }
});
