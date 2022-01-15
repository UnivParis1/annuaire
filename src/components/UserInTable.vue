<template>
 <tr class="UserInTable">
        <td>
          <div class="imgCircle">
            <img :title="person.supannListeRouge ? '': person.displayName" :src="person.photoURL" class="img-responsive">
          </div>
        </td>
        <td class="col-md-3" v-if="!person.supannListeRouge">
              <h2>{{person.supannCivilite}} {{person.displayName}}</h2>
              <div v-for="role in person['supannRoleEntite-all']">{{role.role}}
                 <router-link :to="withParam('affectation', role.structure.key)" :title="role.structure.description">{{role.structure.name}}</router-link>
              </div>
              <div v-for="activite in person_activites_cats.up1">{{activite.name}}</div>
              <div v-if="person.eduPersonPrimaryAffiliation=='teacher'||person.eduPersonPrimaryAffiliation=='researcher'">
                <div v-for="emplType in person.employeeType">{{emplType}}</div>
              </div>
              <div v-for="activite in person_activites_cats.various" v-if="!has_staff_and_activitesUP1">{{activite.name}}</div>
              <div v-for="info in person.info">{{info}}</div>
              <router-link :to="withUser(person)" class="btn btn-primary" title="Afficher la fiche" v-if="person.mail">Fiche détaillée</router-link>
        </td>
          <td colspan="2" v-else>
              <span v-if="!connected">
                <span class="text-warning">Seuls les personnels de l'université peuvent voir cette personne.</span>
                <br>
                <a class="btn btn-primary" :href="connectedHref($route)"> Connexion </a>
              </span>
              <span v-else>
                <span class="text-warning">Cette personne est sur la liste rouge.</span>
              </span>
        </td>

        <td class="infoUser">
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

        <td>
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
import { activitesByCategory } from '../sortUsers';
import { computed } from 'vue';

export default {
  props: ['person', 'query'],
  setup: (props) => {
    const person_activites_cats = computed(() => activitesByCategory(props.person, true))
    return {
      connected: config.connected,
      person_activites_cats,
      has_staff_and_activitesUP1: computed(() => props.person.eduPersonPrimaryAffiliation === 'staff' && person_activites_cats.value.up1.length),
    }
  }
}
</script>
