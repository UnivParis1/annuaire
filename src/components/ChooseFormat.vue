<template>
    <div class="ChooseFormat">
              <router-link class="btn btn-primary" :class="{ youarehere: !format }" title="Afficher la liste" :to="withParam('format', undefined)">
                  <my-icon name='thList'/>
                  <span class="text">Liste</span>
              </router-link>
              <router-link class="btn btn-primary" :class="{ youarehere: format === 'trombi' }" title="Afficher le trombinoscope" :to="withParam('format', 'trombi')" >
                  <my-icon name='users'/>
                  <span class="text">Trombinoscope</span>
              </router-link>
              <router-link class="btn btn-primary chart" :class="{ youarehere: format === 'chart' }" title="Afficher l'organigramme" :to="withParam('format', 'chart')" >
                  <my-icon name='chart'/>
                  <span class="text">Organigramme</span>
              </router-link>
    </div>
</template>

<script>
import MyIcon from './MyIcon.vue';

export default {
  props: ['format'],
  components: { MyIcon },
}
</script>
