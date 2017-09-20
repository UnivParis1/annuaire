<template>
<div>
<div class="container">
    <Filters :query="query" :affectation_manager="affectation_manager"></Filters>

    <div v-if="persons || query.format === 'chart'" class="row" style="text-align:left;margin-bottom: 5px">
        <div class="col-md-12">
            <div class="bg-info">
                <span v-if="persons">{{persons.length}} résultat(s)</span>
           </div>
        </div>
      </div>
      <div class="row" style="height:40px" >
        <div class="col-md-12 warning" v-if="persons && persons.length >= maxRows" >
            <span v-if="query.connected">
              Le nombre de résultats est limité. Veuillez affiner la recherche.
            </span>
            <span v-else>
              La recherche publique est limitée à {{maxRows}} résultats, pour plus de résultats,
              <router-link :to="withParam('connected', true)">veuillez vous identifier.</router-link>
            </span>
          </span>
        </div>
        <div class="col-md-12 warning" v-if="query.format === 'chart' && !query.connected" >
          <span>
              Seul les responsables sont affichés, pour voir le personnel,
              <router-link :to="withParam('connected', true)">veuillez vous identifier.</router-link>
          </span>
        </div>
    </div>
</div>

<div v-if="noFilters || query.format === 'chart'">
</div>
<div v-else-if="!persons" class="container">
  <div class="row"><div class="col-md-12">
    Veuillez patienter...
  </div></div>
</div>
<div v-if="query.format === 'trombi'" class="container">
  <div class="row"><div class="col-md-12">
    <span v-for="person in persons">
      <router-link :to="withUser(person.mail)" :tag="person.supannListeRouge ? 'span' : 'a'" class="photoGallery">
            <div class="photo">
                <img :title="person.supannListeRouge ? '' : person.displayName"
                    :src="person.photoURL" class="img-responsive">
            </div>
            <div class="text">
                {{person.supannListeRouge ? "Personne sur liste rouge" : person.displayName}}
            </div>
      </router-link>
    </span>
  </div></div>
</div>
<div v-else-if="query.format === 'chart'" class="container-fluid">
  <div class="row">
    <OrgChart :selected="query.affectation" :query="query" :displayAll="true" class="col-md-12"></OrgChart>
  </div>
</div>
<div v-else class="container">
 <div class="row"><div class="col-md-12">
  <table class="table table-striped" >
      <tbody>
        <UserInTable :person="person" :query="query" v-for="person in persons" :key="person.mail"></UserInTable>
      </tbody>
  </table>
 </div></div>
</div>

</div>
</template>

<script>
import * as WsService from "../WsService";
import UserInTable from './UserInTable';
import OrgChart from './OrgChart';
import Filters from './Filters';
import config from '../config';

function _getSearchPersons({ maxRows }, query) {
    let wsparams = { maxRows, CAS: !!query.connected, token: query.token };
    return WsService.compute_wsparams_user_filters(query).then(wsparams_filters =>
        WsService.searchPersons({ ...wsparams, ...wsparams_filters })
    ).then(persons => {
        persons.forEach(p => {
            p.supannListeRouge = p.supannCivilite === 'supannListeRouge';
            p.photoURL = config.photoURL(p);
        });
        return persons;
    })
}

function getAffectationManager_(query, persons) {
    let affectation = query.affectation;

    // Récupérer le chef de la structure recherché
    const addRole = (person) => {
        let role = person && getManagerRole(person, affectation);
        return role && { role, ...person };
    };
    let chef = addRole(persons[0]);
    if (chef) {
        console.log(`the first search result is the manager of ${affectation}`);
        // optimisation: pas besoin d'appeler le web-service
        return Promise.resolve(chef);
    } else {
        return _getSearchPersons({ token: '', maxRows: 1 }, { affectation }).then(persons => addRole(persons[0]))
    }
}

function getManagerRole(person, affectation) {
    let supannRoleEntiteAll = person['supannRoleEntite-all'] || [];
    for (let it of supannRoleEntiteAll) {
      if (it.structure.key === affectation){
        return it.role;
      }
    }
    return undefined;
}

export default {
  props: ['query'],
  components: { UserInTable, Filters, OrgChart },
  data() {
      return {
        affectation_manager: undefined, // person

        // users matching filters
        persons: [],
      };
  },
  computed: {
      noFilters() {
           return !['token', 'affectation', 'affiliation', 'diploma', 'role'].find(filter => this.query[filter]);
      },
      maxRows() {
          return this.query.connected ? config.searchAuthMaxResult : config.searchNoauthMaxResult;
      },
  },
  watch: {
    'query': 'updateAsyncData',
  },
  mounted() {
      this.updateAsyncData();
  },
  methods: {
    updateAsyncData() {
        this.persons = undefined;
        this.affectation_manager = undefined;

        if (this.noFilters || this.query.format === 'chart') return;

        _getSearchPersons({ maxRows: this.maxRows }, this.query).then((persons) => {
            this.persons = persons;

            if (this.query.affectation) {
                getAffectationManager_(this.query, persons).then(manager => {
                    console.log("affectation_manager", manager);
                    this.affectation_manager = manager;
                });
            }
        });
    },
  },
}
</script>

<style scoped>
.bg-info {
  min-height: 27px;
  padding-left: 15px;
  background-color: #727780;
  font-size: 18px;
  color: #eee;
}

.warning {
  text-align: center;
  color: #666;
  font-style: italic; font-family: georgia, times; font-size: 15px;
}

.table > tbody > tr > td{
  vertical-align: middle !important;
}

/**
Si mode mobile forcer la liste des personnes à s'adapter à la taille du mobile
En effet le tag "table" ne s'adapte pas automatiquement à la taille du mobile
**/
@media only screen and (max-width: 768px) {
  /* For mobile phones: */
  .table tr td:first-child  {
      float: right;
  }
  .table tr td  {
    display: block;
    border-top: 0px solid #d42626 !important;
  }
  .table tr {
    border: 1px solid #ccc;
  }
}

.photoGallery {
  width: 144px;
  height: 240px;
  overflow: hidden;
  display: inline-block;
  margin: 0 12px;
}

.photoGallery .photo {
  height: 180px;
  overflow: hidden;
}

.photoGallery .text {
  text-align: center;
  padding: 9px;
}

</style>
