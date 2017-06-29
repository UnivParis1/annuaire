<template>
<div>

<div class="col-md-12">
    <Filters :query="query" :affectation_manager="affectation_manager"></Filters>

    <div v-if="persons" class="row" style="text-align:left;margin-bottom: 5px">
        <div class="col-md-12" id="menus">
            <div class="bg-info" style="padding: 6px">
            {{persons.length}} résultat(s)
            <span class="btn-group pull-right nav">
              <router-link class="btn btn-primary" :class="{ youarehere: !query.trombi }" title="Afficher la liste" :to="withParam('trombi', undefined)">
                  <span class='glyphicon glyphicon-th-list'></span> Liste
              </router-link>
              <router-link class="btn btn-primary" :class="{ youarehere: query.trombi }" title="Afficher le trombinoscope" :to="withParam('trombi', true)" >
                  <span class='glyphicon glyphicon-user'></span><span class='glyphicon glyphicon-user'></span> Trombinoscope
              </router-link>
            </span>
           </div>
        </div>
      </div>
      <div class="row" style="height:40px" >
        <div class="col-md-12" v-if="persons && persons.length >= maxRows" >
          <span class="text-success">
            <span v-if="query.connected">
              Le nombre de résultats est limité. Veuillez affiner la recherche.
            </span>
            <span v-else>
              La recherche publique est limitée à {{maxRows}} résultats, pour plus de résultats,
              <router-link :to="withParam('connected', true)">veuillez vous identifier.</router-link>
            </span>
          </span>
        </div>
    </div>
</div>

<div v-if="noFilters">
</div>
<div v-else-if="!persons">
    Veuillez patienter...
</div>
<div v-if="query.trombi">
    <div v-for="person in persons">
      <router-link class="col-md-2" :to="withUser(person.mail)" :tag="person.supannListeRouge ? 'div' : 'a'">
        <div class="photoGallery">
            <div class="photo">
                <img :title="person.supannListeRouge ? '' : person.displayName"
                    :src="person.photoURL" class="img-responsive">
            </div>
            <div class="text">
                {{person.supannListeRouge ? "Personne sur liste rouge" : person.displayName}}
            </div>
        </div>
      </router-link>
    </div>
</div>
<div class="col-md-12" v-else>
  <table class="table table-striped" >
      <tbody>
        <UserInTable :person="person" :query="query" v-for="person in persons" :key="person.mail"></UserInTable>
      </tbody>
  </table>
</div>

</div>
</template>

<script>
import * as WsService from "../WsService";
import UserInTable from './UserInTable';
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
  components: { UserInTable, Filters },
  data() {
      return {
        affectation_manager: undefined, // person

        // users matching filters
        persons: [],
      };
  },
  computed: {
      noFilters() {
           return !['token', 'affectation', 'affiliation', 'diploma'].find(filter => this.query[filter]);
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

        if (this.noFilters) return;

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
#menus .nav a {
  background: #ddd;
}

#menus .nav a.youarehere {
  background: #337ab7;
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
