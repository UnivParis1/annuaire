<template>
<div class="row Filters" v-if="affectation || diploma || role || activite || query.token">
      <div class="col-md-12" >
        <div class="bg-info">
          <div class="row">
            <div class="col-md-6 text-muted affectationFilter" v-if="affectation">
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
            <div class="col-md-6 text-muted diplomaFilter" v-if="diploma">
              <div>
                  {{diploma.name}}
                  <router-link :to="withParam('diploma', undefined)">
                      <span class='glyphicon glyphicon-remove'></span>
                  </router-link>
              </div>
            </div>
            <div class="col-md-3 text-muted roleFilter" v-if="role">
                <div>
                    {{role.name}}
                    <router-link :to="withParam('role', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
                </div>
            </div>
            <div class="col-md-3 text-muted roleFilter" v-if="activite">
                <div>
                    {{activite.name}}
                    <router-link :to="withParam('activite', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
                </div>
            </div>
            <div class="col-md-3 text-muted queryFilter" v-if="query.token">
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
import * as WsService from '../WsService';
import helpers from '../helpers';

export default {
  props: ['query'],
  asyncComputed: {
      affectation() {
          return this.query.affectation && WsService.getGroupFromStruct(this.query.affectation);
      },
      role() {
          return this.query.role && WsService.getRoleGenerique(this.query.role);
      },
      activite() {
          return this.query.activite && WsService.getActivite(this.query.activite);
      },
      diploma() {
          return this.query.diploma && WsService.getDiploma(this.query.diploma);
      },
  },
  computed: {
      affectationRolesGrouped() {
          return helpers.sortedGroupBy(this.affectation.roles, u => u.supannRoleGenerique.join(", "));
      },
  },
}
</script>

