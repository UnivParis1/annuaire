<template>
    <div class="ChooseFormat">
            <span class="btn-group pull-right nav">
              <router-link class="btn btn-primary" :class="{ youarehere: !format }" title="Afficher la liste" :to="withParam('format', undefined)">
                  <span class='glyphicon glyphicon-th-list'></span>
                  <span class="text">Liste</span>
              </router-link>
              <router-link class="btn btn-primary" :class="{ youarehere: format === 'trombi' }" title="Afficher le trombinoscope" :to="withParam('format', 'trombi')" >
                  <span class='glyphicon glyphicon-user'></span>
                  <span class="text">Trombinoscope</span>
              </router-link>
              <router-link class="btn btn-primary chart" :class="{ youarehere: format === 'chart' }" title="Afficher l'organigramme" :to="withParam('format', 'chart')" >
                  <span class="text">Organigramme</span>
              </router-link>
            </span>
    </div>
</template>

<script>
export default {
  props: ['format'],
}
</script>
