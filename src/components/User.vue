<template>
<div>
<div v-if="error">
    {{error}}
</div>
<div class="col-md-12" v-if="person">
  <div class="alt">
    <div class="row">
      <div class="col-md-2">
        <div class="text-center imgCircle imgMarg">
            <img :title="person.displayName" :src="photoURL" class="img-responsive">
        </div>
      </div>
      <div class="col-md-10">
        <div class="row">
          <div class="col-md-12">
              <h2 class="cap">{{person.supannCivilite}} {{person.displayName}}</h2>
          </div>
        </div>
        <div class="row">
          <div class="col-md-5">
              <div v-if="person.eduPersonPrimaryAffiliation=='teacher'||person.eduPersonPrimaryAffiliation=='researcher'">
                <div v-for="emplType in person.employeeType">{{emplType}}</div>
              </div>
              <div v-for="role in person['supannRoleEntite-all']">{{role.role}}
                 <router-link :to="withParam('affectation', role.structure.key)"
                  tooltip-placement="top" :uib-tooltip="role.structure.description">{{role.structure.name}}</router-link>
              </div>
              <div v-for="desc in person.description">{{desc}}</div>
              <div v-for="info in person.info">{{info}}</div>
              <div>
                  <a :href="'mailto:' + person.mail" target="_blank">{{person.mail}}</a>
              </div>
              <div v-for="uri in person.labeledURI" >
                  <a :href="uri" target="_blank">{{uri}}</a>
              </div>
          </div>
          <div class="col-md-7">
            <div>
              <span v-for="(aff, index) in statusPers">
                <span>{{index ? ' - ' : ''}}{{t(aff)}}</span>
              </span>
            </div>
            <div>
              <span v-if="person['supannActivite-all']">
                <span v-for="activite in person['supannActivite-all']">{{activite.name}}</span>
              </span>
            </div>
            <div>
              <span v-for="i in breadcrumbTotal">
                <span v-for="item in i">
                  <div v-if="item.category">
                    <router-link :to="withParam('affectation', item.rawKey)">{{item.name}}</router-link>
                  </div>
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row marginTop">
      <!--Affichage étudiant -->
      <div v-if="person.eduPersonPrimaryAffiliation=='student'|| person.eduPersonPrimaryAffiliation=='alum'">
        <div class="col-md-10 col-md-offset-2">
          <div class="row">
            <div class="col-md-12">
              <div v-if="person['supannEntiteAffectation-all']">
                <label>Structure(s)/Composante(s)</label>
                <span class="uneditable-input" v-for="aff in person['supannEntiteAffectation-all']">
                  {{aff.name}}
                </span>
              </div>
              <div  v-if="lastDiplomas">
                <label>Diplôme(s)</label>
                <span style="display: inline-block; vertical-align: top">
                  <span class="uneditable-input" v-for="diploma in lastDiplomas">
                    <router-link :to="withParam('diploma', diploma.etapeCode)" >{{diploma.etape}}</router-link><br>
                  </span>
                </span>
              </div>
            </div>
          </div>
          <br>
        </div>
      </div>
      <!-- Affichage personnel-->
      <div v-else>
        <div class="col-md-10 col-md-offset-2">
          <div class="row">
            <div class="col-md-5  marginTop" v-if="person.telephoneNumber || person.supannAutreTelephone || person.mobile || person.facsimileTelephoneNumber">
              <div v-if="person.telephoneNumber">
                <label>Téléphone fixe </label>
                <span class="uneditable-input" v-for="telephoneNumber in person.telephoneNumber">
                    <a :href="'tel:' + telephoneNumber" target="_blank"> {{telephoneNumber}}</a>
                </span>
              </div>
              <div v-if="person.supannAutreTelephone">
                <label>Téléphone(s) secondaire(s) </label>
                <span style="display: inline-block; vertical-align: top">
                  <span class="uneditable-input" v-for="supannAutreTelephone in person.supannAutreTelephone">
                    <a :href="'tel:' + supannAutreTelephone" target="_blank"> {{supannAutreTelephone}}</a>
                    <br>
                  </span>
                </span>
              </div>
              <div v-if="person.mobile">
                  <label>Téléphone mobile </label>
                  <span class="uneditable-input" v-for="mobile in person.mobile"> <a :href="'tel:' + mobile" target="_blank">{{mobile}}</a></span>
              </div>
              <div v-if="person.facsimileTelephoneNumber">
                  <label>Fax </label>
                  <span class="uneditable-input" v-for="facsimileTelephoneNumber in person.facsimileTelephoneNumber"> {{facsimileTelephoneNumber}}</span>
              </div>
          </div>
          <div class="col-md-7 marginTop">
            <span v-if="person.buildingName">
                <label >Site</label>
                <span class="uneditable-input " v-for="buildingName in person.buildingName"> {{buildingName}}</span><br>
            </span>
            <span v-if="person.roomNumber">
              <label>Bureau</label>
              <span class="uneditable-input" v-for="roomNumber in person.roomNumber"> {{roomNumber}}</span><br>
            </span>
            <span v-if="person.up1FloorNumber">
              <label>Étage</label>
              <span class="uneditable-input" v-for="up1FloorNumber in person.up1FloorNumber"> {{up1FloorNumber}}</span><br>
            </span>
            <span v-if="person.postalAddress">
              <label>Adresse postale</label>
              <span style="display: inline-block; vertical-align: top">
                <span style="white-space:pre-wrap;">{{person.postalAddress}}</span>
                <span><a :href="'http://maps.google.fr/maps?t=m&amp;z=16&amp;q=' + person.postalAddress" title="Afficher la carte" target="_blank">
                  <span class="glyphicon glyphicon-map-marker"></span></a><br><br>
                </span>
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
    </div>
  </div>
</div>
</div>
</template>

<script>
import * as WsService from "../WsService";
import config from '../config';

function translateAffiliation(affiliation) {
    let useful = config.usefulAffiliations.filter(a => a === affiliation)[0];
    return useful && "STATUS_" + useful;
}

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

const computeStatusPers = (person) => (
    person.eduPersonAffiliation.map(a => translateAffiliation(a)).filter(t => t)
);

// computes breadcrumbTotal, async !!
function compute_breadcrumbTotal(person) {
   let affectations = person.supannEntiteAffectation || [];
   // Si la personne possède plusieurs affectations, afficher autant de fil d'ariane que d'affectation
   return Promise.all(affectations.map(aff => parentGroups("structures-" + aff)));
 };

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
  props: ["userId", "connected"],
  computed: {
    statusPers() { return computeStatusPers(this.person) },
    lastDiplomas() { return getLastDiplomas_(this.person) },
    photoURL() { return config.photoURL(this.person) },
  },  
  data() {
      return {
        person: undefined,
        error: undefined,
        breadcrumbTotal: [], //wsGroup[][];
      };
  },
  mounted() {
      this.updateAsyncData();
  },
  watch: {
      userId: 'updateAsyncData',
      connected: 'updateAsyncData',
  },
  methods: {
      updateAsyncData() {
        WsService.searchPersons({ token: this.userId, maxRows: 1, CAS: this.connected }).then(persons => persons[0]).then(person => {
            this.error = !person && "Utilisateur inconnu";
            if (this.error) return;
            if (person.postalAddress) person.postalAddress = person.postalAddress.trim();
            this.person = person;
            //Récupérer les diplomes de l'étudiant
            compute_breadcrumbTotal(person).then(l => this.breadcrumbTotal = l);
        });
      },
  },
}
</script>

<style scoped>
.alt {
  background-color:#eee;
}

.imgMarg{
  margin-top: 15px;
}

.breadcrumb > li + li::before {
  padding: 0 0 0 10px !important;
}

.marginTop{
  margin-top:10px;
}
</style>
