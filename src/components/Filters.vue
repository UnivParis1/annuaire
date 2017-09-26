<template>
<div class="row Filters" v-if="affectation || diploma || role || query.token">
      <div class="col-md-12" >
        <div class="bg-info" style="padding: 6px">
          <div class="row">
            <div class="col-md-6 text-muted" v-if="affectation">
               <div>
                   {{affectation.name}}
                   <router-link :to="withParam('affectation', undefined)">
                       <span class='glyphicon glyphicon-remove'></span>
                   </router-link>
               </div>
               <div v-if="affectation_manager" >
                   {{affectation_manager.role}} :
                   <router-link :to="withUser(affectation_manager.mail)">{{affectation_manager.displayName}}</router-link>
               </div>
               <div v-if="affectation && affectation.labeledURI">
                   Site web :
                   <a :href="affectation.labeledURI" target="_blank">{{affectation.labeledURI}}</a>
               </div>
            </div>
            <div class="col-md-6 text-muted" v-if="diploma">
              <div>
                  {{diploma.name}}
                  <router-link :to="withParam('diploma', undefined)">
                      <span class='glyphicon glyphicon-remove'></span>
                  </router-link>
              </div>
            </div>
            <div class="col-md-3 text-muted" v-if="role">
                <div>
                    {{role.name}}
                    <router-link :to="withParam('role', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
                </div>
            </div>
            <div class="col-md-3 text-muted" v-if="query.token">
                <div>
                    {{query.token}}
                    <router-link :to="withParam('token', undefined)">
                        <span class='glyphicon glyphicon-remove'></span>
                    </router-link>
                </div>
            </div>
          </div>
        </div>
        </br>
      </div>
    </div>
</template>


<script>
import * as WsService from '../WsService';

export default {
  props: ['query', 'affectation_manager'],
  asyncComputed: {
      affectation() {
          return this.query.affectation && WsService.getGroupFromStruct(this.query.affectation);
      },
      role() {
          return this.query.role && WsService.getRoleGenerique(this.query.role);
      },
      diploma() {
          return this.query.diploma && WsService.getDiploma(this.query.diploma);
      },
  },
}
</script>

