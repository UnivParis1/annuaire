<template>
<div class="row Filters" v-if="affectation || diploma || role || activite || query.token">
        <div class="bg-info">
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
                      <span class='glyphicon glyphicon-remove'></span>
                  </router-link>
               <!--div class="filterChartFormatLink"><router-link :to="withParam('format', 'chart')">Organigramme</router-link></div-->
            </div>
            <div class="diplomaFilter" v-if="diploma">
                  {{diploma.name}}
                  <router-link :to="withParam('diploma', undefined)">
                      <span class='glyphicon glyphicon-remove'></span>
                  </router-link>
            </div>
            <div class="roleFilter" v-if="role">
                    {{role.name}}
                    <router-link :to="withParam('role', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
            </div>
            <div class="roleFilter" v-if="activite">
                    {{activite.name}}
                    <router-link :to="withParam('activite', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
            </div>
            <div class="queryFilter" v-if="query.token">
                    {{query.token}}
                    <router-link :to="withParam('token', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
            </div>
        </div>
</div>
</template>


<script>
import helpers from '../helpers';

export default {
  props: ['queryO'],
  computed: {
      query() {
          return this.queryO && this.queryO.query || {};
      },
      affectation() {
          return this.queryO && this.queryO.affectation;
      },
      role() {
          return this.queryO && this.queryO.role;
      },
      activite() {
          return this.queryO && this.queryO.activite;
      },
      diploma() {
          return this.queryO && this.queryO.diploma;
      },
      affectationRolesGrouped() {
          return helpers.sortedGroupBy(this.affectation.roles, u => u.supannRoleGenerique.join(", "));
      },
  },
}
</script>

