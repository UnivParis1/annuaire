<template>
    <div class="row ChooseFormat">
        <div class="col-md-12 formats">
            <span class="btn-group pull-right nav">
              <router-link class="btn btn-primary" :class="{ youarehere: !format }" title="Afficher la liste" :to="withParam('format', undefined)">
                  <span class='glyphicon glyphicon-th-list'></span> Liste
              </router-link>
              <router-link class="btn btn-primary" :class="{ youarehere: format === 'trombi' }" title="Afficher le trombinoscope" :to="withParam('format', 'trombi')" >
                  <span class='glyphicon glyphicon-user'></span> Trombinoscope
              </router-link>
              <router-link class="btn btn-primary" :class="{ youarehere: format === 'chart' }" title="Afficher l'organigramme" :to="withParam('format', 'chart')" >
                  <span class='glyphicon glyphicon-indent-left'></span> Organigramme
              </router-link>
            </span>
        </div>
    </div>
</template>

<script>
export default {
  props: ['format'],
}
</script>
