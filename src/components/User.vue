<template>
<div class="User">
<div class="container" v-if="error">
    <div class="error">
        {{error}}
    </div>
</div>
<div v-else-if="!person" class="container">
   <div class="row"><div class="col-md-12">
       Veuillez patienter
    </div></div>
</div>
<div v-else-if="format === 'chart'" class="OrgChart-outer">
     <div v-for="aff in person['supannEntiteAffectation-all']">

        <OrgChart :selected="aff.key" :query="{ affectation: aff.key, token: person.mail }" :displayAll="false" class="text-center"></OrgChart>
     </div>
</div>
<div v-else-if="format === 'trombi'" class="container">
  <div class="row"><div class="col-md-12">
    <Trombi :person="person"></Trombi>
  </div></div>
</div>
<div class="container" v-else>
  <div class="boite">
    <router-link to="/">
        <span class="badge backToHome"><my-icon name='remove' /></span>
    </router-link>

    <div class="row">
        <div class="text-center imgCircle imgMarg">
            <img :title="person.displayName" :src="photoURL" class="img-responsive">
        </div>
      <div class="col-md-10">
        <div class="row">
          <div class="col-md-12">
              <h2 class="cap">{{person.supannCivilite}} {{person.displayName}}</h2>
          </div>
        </div>
        <div class="row">
          <div class="col-md-7 fonctions-utilisateurs">
              <div>
                <div class="employeeType" v-for="emplType in person.employeeType">{{emplType}}</div>
              </div>
              <div class="supannRoleEntite" v-for="role in person['supannRoleEntite-all']">{{role.role}}
                 <router-link :to="withParam('affectation', role.structure.key)"
                  :title="role.structure.description">{{role.structure.name}}</router-link>
              </div>
              <div class="description" v-for="activite in person_activites_cats.up1">{{activite.name}}</div>
              <div class="info" v-for="info in person.info" v-if="has_staff_and_activitesUP1">{{info}}</div>
            <div class="affiliations">
              <span v-for="(aff, index) in statusPers">
                <span>{{index ? ', ' : ''}}{{t(aff)}}</span>
              </span>
            </div>
            <div class="supannActivite">
                <span v-for="(activite, index) in person_activites_cats.various">{{index ? ', ' : ''}}{{activite['name-gender'] || activite.name}}</span>
            </div>
              <div class="info" v-for="info in person.info" v-if="!has_staff_and_activitesUP1">{{info}}</div>
              <div class="supannEtuInscription" v-if="lastDiplomas && lastDiplomas.length">
                  <div v-for="diploma in lastDiplomas">
                    <router-link :to="withParam('diploma', diploma.etapeCode)" >{{diploma.etape}}</router-link><br>
                  </div>
              </div>

              <div v-for="uri in person.labeledURI" class="labeledURI">
                  Page perso :
                  <a :href="uri" target="_blank">{{uri.replace(/^https?:\/\//, '')}}</a>
              </div>
            <div class="affectations" v-if="affectationsWithParents.length">
              <label>Membre de :</label>
              <span v-for="i in affectationsWithParents">
                <span v-for="item in i">
                  <div v-if="item.category">
                    <router-link :to="withParam('affectation', item.rawKey)">{{item.name}}</router-link>
                  </div>
                </span>
              </span>
            </div>
          </div>
          <div class="col-md-5 contactInformation">
            <div class="userChartFormatLink" v-if="allow_chart">
              <router-link :to="{ query: { format: 'chart' } }">Organigramme individuel</router-link>
            </div>
            <div class="mail">
                <a :href="'mailto:' + person.mail" target="_blank">{{person.mail}}</a>
            </div>
            <div class="phoneNumbers" v-if="person.telephoneNumber || person.supannAutreTelephone || person.mobile">
              <div v-if="person.telephoneNumber">
                <span class="uneditable-input" v-for="telephoneNumber in person.telephoneNumber">
                    <a :href="'tel:' + telephoneNumber" target="_blank"> {{telephoneNumber}}</a>
                </span>
              </div>
              <div v-if="person.supannAutreTelephone">
                <span style="display: inline-block; vertical-align: top">
                  <span class="uneditable-input" v-for="supannAutreTelephone in person.supannAutreTelephone">
                    <a :href="'tel:' + supannAutreTelephone" target="_blank"> {{supannAutreTelephone}}</a>
                    <br>
                  </span>
                </span>
              </div>
              <div v-if="person.mobile">
                  <span class="uneditable-input" v-for="mobile in person.mobile"> <a :href="'tel:' + mobile" target="_blank">{{mobile}}</a></span>
              </div>
          </div>
          <div class="address" v-if="person.buildingName || person.postalAddress">
            <span v-if="person.buildingName">
                <label>Site :</label>
                <span style="margin-left: 0.5em" class="uneditable-input " v-for="buildingName in person.buildingName">{{buildingName}}</span>
            </span>
            <span v-if="person.roomNumber">
              <label>Bureau :</label>
              <span style="margin-left: 0.5em" class="uneditable-input" v-for="roomNumber in person.roomNumber">
                {{roomNumber}}
                <span v-if="person.up1RoomAccess" v-for="where in person.up1RoomAccess">- {{where}}</span>
              </span>
            </span>
            <span v-if="person.up1FloorNumber">
              <label>Étage :</label>
              <span style="margin-left: 0.5em" class="uneditable-input" v-for="up1FloorNumber in person.up1FloorNumber">{{up1FloorNumber}}</span>
            </span>
            <span v-if="person.postalAddress">
              <span>
                <span class="postalAddress">{{person.postalAddress}}</span>
                <span><a :href="'http://maps.google.fr/maps?t=m&amp;z=16&amp;q=' + person.postalAddress" title="Afficher la carte" target="_blank">
                  <my-icon name="mapMarker"/></a>
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
  </div>
 </div></div>
 <div class="userAnnuaireURL">
    <a :href="user_public_url">{{user_public_url}}</a>

    <span class="more_account_link">
      | <a :href="user_vcard_url"> Ajouter à mes contacts</a>
        <my-icon name="userPlus"/>
    </span>
    <span v-if="connected_uid === person.uid" class="more_account_link modify_account">
      | <a :href="config.modify_my_account_url"> Modifier mes informations</a>
    </span>
    <span v-else-if="allow_comptex_annuaire" class="more_account_link modify_account">
      | <a :href="config.comptex_annuaire_url(person)"> Modifier les coordonnées</a>
    </span>
    <span v-if="!config.connected">
      &nbsp; <span class="warning"><a :href="connectedHref($route)">Vous connecter pour voir tout</a></span>
    </span>
 </div>
</div>
</div>
</template>

<script>
import * as WsService from "../WsService";
import config from '../config';
import helpers from '../helpers';
import Trombi from './Trombi.vue';
import OrgChart from './OrgChart.vue';
import MyIcon from './MyIcon.vue';
import { activitesByCategory } from '../sortUsers';
import { toComputed, asyncComputed } from '../directives';
import { computed } from 'vue';

const getLastDiplomas_ = (person) => {
    let inscriptions =person['supannEtuInscription-all'];
    if (!inscriptions) return [];

    let anneeInscMax = Math.max.apply(null, inscriptions.map(item => item.anneeinsc));
    inscriptions = inscriptions.filter(p => p.anneeinsc == anneeInscMax);

    return inscriptions.map(p => (
          // Récupérer le code etape, utilisé dans fiche detail, et l'affecter dans attribut etapeCode de l'objet p
          { etapeCode: p.etape.replace(/\s*-.*/, ''), ...p }
    ));
};

const computeStatusPers = (person) => {
    let affs = person.eduPersonAffiliation
    if (person.eduPersonPrimaryAffiliation) {
        // have eduPersonPrimaryAffiliation first
        affs.unshift(person.eduPersonPrimaryAffiliation)
    }
    affs = helpers.intersection(affs, config.usefulAffiliations)
    // unify teacher/researcher
    if (affs.includes("teacher") && affs.includes("researcher")) {
        affs = affs.map(aff => aff === "teacher" || aff === "researcher" ? "teacher_researcher" : aff)
    }
    // remove duplicates (from eduPersonPrimaryAffiliation or teacher/researcher)
    affs = helpers.uniqBy(affs, aff=>aff)
    return affs.map(a => "STATUS_" + a);
};

async function compute_affectationsWithParents(person) {
   let affectations = person['supannEntiteAffectation-all'] || [];
   // Si la personne possède plusieurs affectations, afficher autant de fil d'ariane que d'affectation
   const l = await Promise.all(affectations.map(aff => parentGroups("structures-" + aff.key)))
   // filtrer les réponses vides (ie les structures d'affectation de type "organization", qui sont ignorées par wsgroups) (GLPI UP1#116750)
   return l.filter(i => i.length)
 }

const objectValues = (o) => (
     Object.keys(o).map(key => o[key])
);

const parentGroups = (groupKey) => (
    WsService.parentGroups({ key: groupKey, depth: 10 }).then(groups => (
       objectValues(groups)
    ))
);

export default {
  name: "User",
  props: ["userId", "format"],
  components: { MyIcon, Trombi, OrgChart },
  setup(props) {
    const userMail = computed(() => props.userId.replace(/@(\w*)$/, (_, w) => '@' + w + (w && '.') + config.domain))
    const searchPerson = asyncComputed(async () => {
        const person = await WsService.searchPerson({ token: userMail.value, CAS: config.connected });
        if (!person) return { error: "Utilisateur inconnu" };
        return { person };
    })
    const person = computed(() => searchPerson.value && searchPerson.value.person)
    const person_activites_cats = computed(() => activitesByCategory(person.value, true))

   return {
     person, person_activites_cats,
   ...toComputed({
    error() { return searchPerson.value && searchPerson.value.error },

    statusPers() { return computeStatusPers(person.value) },
    has_staff_and_activitesUP1() { return person.value.eduPersonPrimaryAffiliation === 'staff' && person_activites_cats.value.up1.length },
    lastDiplomas() { return getLastDiplomas_(person.value) },
    photoURL() { return config.photoURL(person.value) },
    user_vcard_url() { return config.wsgroupsURL + "/searchUser?format=vcard&CAS=" + config.connected + "&token=" + userMail.value },
    config() { return config; },
    allow_chart() {
          return helpers.intersection(person.value.eduPersonAffiliation, [ "staff", "faculty", "emeritus" ]).length &&
            person.value?.['supannEntiteAffectation-all']?.some(affectation => !config.orgChart_hidden_structures.includes(affectation.key))
    },
   }),
    affectationsWithParents: asyncComputed(async () => { // wsGroup[][];
        return person.value ? compute_affectationsWithParents(person.value) : [];
    }),
    allow_comptex_annuaire: asyncComputed(async () => {
        const personAffectation = person.value.supannEntiteAffectationPrincipale
        if (!personAffectation ||
            !helpers.intersection(person.value.eduPersonAffiliation, [ "staff", "faculty", "teacher"]).length) {
            return false
        } else {
            const roles = (await WsService.getGroupFromStruct(personAffectation)).roles
            const loggedUser = await window.loggedUser
            return roles.find((role) => role.uid === loggedUser.uid) ||
                "dsidoc" in (await loggedUser.validApps) // MOCHE mais fonctionne car "dsidoc" est réservé à la DSIUN. Or la DSIUN est autorisé à modifier les données de tout le monde sur comptex/annuaire
        }
    }),
   }
    },
  computed: { // kept here because it uses GlobalMixin.js
    user_public_url() { return this.publicHref(this.withUser({ mail: this.userId }, {})) },
  },
}
</script>


