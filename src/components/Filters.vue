<template>
<div class="row Filters" v-if="affectation || diploma || role || activite || query.token">
        <div class="col-md-12">
            <div class="affectationFilter" v-if="affectation">
              <div>
               <div class="name">
                   {{affectation.name}}
               </div>

               <div v-for="role in affectationRolesGrouped" class="manager">
                  {{role.v}}&nbsp;:
                  <span v-for="(u, i) in role.group">{{i ? ", " : ''}}<maybe-router-link :to="withUser(u)">{{u.displayName}}</maybe-router-link>
                  </span>
               </div>
               <div v-if="affectation && affectation.labeledURI" class="labeledURI">
                   Site web :
                   <a :href="affectation.labeledURI" target="_blank">{{affectation.labeledURI}}</a>
               </div>
              </div>
                  <router-link :to="withParam('affectation', undefined)">
                      <my-icon name='remove' />
                  </router-link>
               <!--div class="filterChartFormatLink"><router-link :to="withParam('format', 'chart')">Organigramme</router-link></div-->
            </div>
            <div class="diplomaFilter" v-if="diploma">
                  {{diploma.name}}
                  <router-link :to="withParam('diploma', undefined)">
                      <my-icon name='remove' />
                  </router-link>
            </div>
            <div class="roleFilter" v-if="role">
                    {{role.name}}
                    <router-link :to="withParam('role', undefined)">
                        <my-icon name='remove' />
                    </router-link>
            </div>
            <div class="roleFilter" v-if="activite">
                    {{activite.name}}
                    <router-link :to="withParam('activite', undefined)">
                        <my-icon name='remove' />
                    </router-link>
            </div>
            <div class="queryFilter" v-if="query.token">
                    {{query.token}}
                    <router-link :to="withParam('token', undefined)">
                        <my-icon name='remove' />
                    </router-link>
            </div>
        </div>
</div>
</template>


<script>
import * as sortUsers from '../sortUsers';
import MyIcon from './MyIcon.vue';
import { MaybeRouterLink, toComputed } from '../directives';
import { computed } from 'vue';

export default {
  props: ['queryO'],
  components: { MaybeRouterLink, MyIcon },
  setup(props) {
    const affectation = computed(() => (
          props.queryO && props.queryO.affectation
    ))
    return {
      affectation,
     ...toComputed({
      query() {
          return props.queryO && props.queryO.query || {};
      },
      role() {
          return props.queryO && props.queryO.role;
      },
      activite() {
          return props.queryO && props.queryO.activite;
      },
      diploma() {
          return props.queryO && props.queryO.diploma;
      },
      affectationRolesGrouped() {
          return sortUsers.rolesGrouped(affectation.value?.roles);
      },
     }),
    }
  }
}
</script>

