<template>
 <tr>
        <td class="col-md-1" >
          <div class="imgCircle">
            <img :title="person.supannListeRouge ? '': person.displayName" :src="person.photoURL" class="img-responsive">
          </div>
        </td>
        <td class="col-md-3">
            <div v-if="!person.supannListeRouge">
              <div>{{person.supannCivilite}} {{person.displayName}}</div>
              <div v-for="role in person['supannRoleEntite-all']">{{role.role}}
                 <router-link :to="withParam('affectation', role.structure.key)" tooltip-placement="top" :uib-tooltip="role.structure.description">{{role.structure.name}}</router-link>
              </div>
              <div v-if="person.eduPersonPrimaryAffiliation=='teacher'||person.eduPersonPrimaryAffiliation=='researcher'">
                <div v-for="emplType in person.employeeType">{{emplType}}</div>
              </div>
              <div v-for="desc in person.description">{{desc}}</div>
              <div v-for="info in person.info">{{info}}</div>
            </div>
            <div v-else>
              <span v-if="!query.connected">
                <span class="text-warning">Cette personne est sur la liste rouge. Veuillez vous identifier pour pouvoir la visualiser</span>
                <router-link :to="withParam('connected', 1)"> Connexion </router-link>
              </span>
              <span v-else>
                <span class="text-warning">Cette personne est sur la liste rouge.</span>
              </span>
            </div>
            <div><router-link :to="withUser(person.mail)" class="btn btn-primary" title="Afficher la fiche">Fiche complète</router-link></div>
        </td>

        <td class="col-md-4 infoUser">
          <div v-if="!person.supannListeRouge">
            <span class='glyphicon glyphicon-envelope'></span>
            <a :href="'mailto:' + person.mail" target="_blank">{{person.mail}}</a>
          </div>
          <div class="row" v-if="person.telephoneNumber || person.supannAutreTelephone || person.facsimileTelephoneNumber || person.mobile">
           <div class="col-md-1">
             <span class='glyphicon glyphicon-phone'></span>
           </div>
           <div class="col-md-11">
            <div v-for="telNum in person.telephoneNumber">
              <a :href="'tel:' + telNum" target="_blank">{{telNum}}</a>
            </div>
            <div v-for="telAut in person.supannAutreTelephone">
              <a :href="'tel:' + telAut" target="_blank">{{telAut}}</a>
            </div>
            <!-- when authenticated -->
            <div v-for="mobile in person.mobile">
               <a :href="'tel:' + mobile" target="_blank">{{mobile}}</a>
            </div>
            <div v-for="telFac in person.facsimileTelephoneNumber">{{telFac}} (Fax)</div>
           </div>
          </div>
        </td>

        <td class="col-md-4">
          <span class='glyphicon glyphicon-user'></span> Liste des membres de :
          <div v-for="affectation in person['supannEntiteAffectation-all']">
             <router-link :to="withParam('affectation', affectation.key)">{{affectation.description}}</router-link>
          </div>
        </td>
</tr>
</template>

<script>
export default {
  props: ['person', 'query'],
}
</script>
