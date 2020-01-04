<template>
<div class="row Filters" v-if="affectation || diploma || role || activite || query.token">
      <div class="col-md-12" >
        <div class="bg-info">
          <div class="row">
            <div class="col-md-6 affectationFilter" v-if="affectation">
               <div class="name">
                   {{affectation.name}}
                   <router-link :to="withParam('affectation', undefined)">
                       <span class='glyphicon glyphicon-remove'></span>
                   </router-link>
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
               <!--div class="filterChartFormatLink"><router-link :to="withParam('format', 'chart')">Organigramme</router-link></div-->
            </div>
            <div class="col-md-6 diplomaFilter" v-if="diploma">
              <div>
                  {{diploma.name}}
                  <router-link :to="withParam('diploma', undefined)">
                      <span class='glyphicon glyphicon-remove'></span>
                  </router-link>
              </div>
            </div>
            <div class="col-md-3 roleFilter" v-if="role">
                <div>
                    {{role.name}}
                    <router-link :to="withParam('role', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
                </div>
            </div>
            <div class="col-md-3 roleFilter" v-if="activite">
                <div>
                    {{activite.name}}
                    <router-link :to="withParam('activite', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
                </div>
            </div>
            <div class="col-md-3 queryFilter" v-if="query.token">
                <div>
                    {{query.token}}
                    <router-link :to="withParam('token', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
                </div>
            </div>
          </div>
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

