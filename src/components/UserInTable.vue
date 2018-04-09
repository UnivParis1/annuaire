<template>
 <tr class="UserInTable">
        <td class="col-md-1" >
          <div class="imgCircle">
            <img :title="person.supannListeRouge ? '': person.displayName" :src="person.photoURL" class="img-responsive">
          </div>
        </td>
        <td class="col-md-3" v-if="!person.supannListeRouge">
              <h2>{{person.supannCivilite}} {{person.displayName}}</h2>
              <div v-for="role in person['supannRoleEntite-all']">{{role.role}}
                 <router-link :to="withParam('affectation', role.structure.key)" tooltip-placement="top" :uib-tooltip="role.structure.description">{{role.structure.name}}</router-link>
              </div>
              <div v-for="desc in person.description">{{desc}}</div>
              <div v-if="person.eduPersonPrimaryAffiliation=='teacher'||person.eduPersonPrimaryAffiliation=='researcher'">
                <div v-for="emplType in person.employeeType">{{emplType}}</div>
              </div>
              <div v-for="activite in person['supannActivite-all']" v-if="person['supannActivite-all'] && !has_staff_description">{{activite.name}}</div>
              <div v-for="info in person.info">{{info}}</div>
              <router-link :to="withUser(person)" class="btn btn-primary" title="Afficher la fiche" v-if="person.mail">Fiche détaillée</router-link>
          <td class="col-md-7" colspan="2" v-else>
              <span v-if="!connected">
                <span class="text-warning">Seuls les personnels de l'université peuvent voir cette personne.</span>
                <br>
                <a class="btn btn-primary" :href="connectedHref($route)"> Connexion </a>
              </span>
              <span v-else>
                <span class="text-warning">Cette personne est sur la liste rouge.</span>
              </span>
        </td>

        <td class="col-md-4 infoUser">
          <div class="mail" v-if="person.mail">
            <a :href="'mailto:' + person.mail" target="_blank">{{person.mail}}</a>
          </div>
          <div class="phoneNumbers" v-if="person.telephoneNumber || person.supannAutreTelephone || person.facsimileTelephoneNumber || person.mobile">
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
        </td>

        <td class="col-md-4">
          <div class="affectations" v-if="person['supannEntiteAffectation-all']">
          <label>Membre de :</label>
          <div v-for="affectation in person['supannEntiteAffectation-all']">
             <router-link :to="withParam('affectation', affectation.key)">{{affectation.description}}</router-link>
          </div>
          </div>
        </td>
</tr>
</template>

<script>
import config from '../config';

export default {
  props: ['person', 'query'],
  computed: {
      connected() { return config.connected; },
      has_staff_description() { return this.person.eduPersonPrimaryAffiliation === 'staff' && this.person.description && this.person.description.length },
  },
}
</script>
