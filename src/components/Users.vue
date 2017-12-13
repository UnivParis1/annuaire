<template>
<div class="Users">
<div class="container">
    <Filters :query="query"></Filters>

    <div class="row" v-if="!noFilters">
        <div class="col-md-12">
            <div class="bg-info">
               <ChooseFormat :format="query.format"></ChooseFormat>
                <span v-if="persons">{{persons.length}} résultat(s)</span>
           </div>
        </div>
      </div>
      <div class="row">
        <div class="col-md-12 warning" v-if="persons && persons.length >= maxRows" >
            <span v-if="connected">
              Le nombre de résultats est limité. Veuillez affiner la recherche.
            </span>
            <span v-else>
              La recherche publique est limitée à {{maxRows}} résultats, pour plus de résultats,
              <a :href="connectedHref($route)">veuillez vous identifier.</a>
            </span>
          </span>
        </div>
        <div class="col-md-12 warning" v-if="query.format === 'chart' && !connected" >
          <span>
              Seul les responsables sont affichés, pour voir tous les personnels,
              <a :href="connectedHref($route)">veuillez vous identifier.</a>
          </span>
        </div>
    </div>
</div>

<div v-if="query.format === 'chart'">
    <OrgChart :selected="query.affectation" :query="query" :displayAll="true"></OrgChart>
</div>
<div v-else-if="noFilters">
    <Slider :slides="slides" slide_duration="4"></Slider>
</div>
<div v-else-if="!persons" class="container">
  <div class="row"><div class="col-md-12">
    Veuillez patienter...
  </div></div>
</div>
<div v-if="query.format === 'trombi'" class="container">
  <div class="row"><div class="col-md-12 text-center">
    <span v-for="person in persons">
      <Trombi :person="person"></Trombi>
    </span>
  </div></div>
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
import * as sortUsers from '../sortUsers';
import helpers from '../helpers';
import ChooseFormat from './ChooseFormat';
import UserInTable from './UserInTable';
import Trombi from './Trombi';
import OrgChart from './OrgChart';
import Filters from './Filters';
import Slider from './Slider';
import config from '../config';

function _getSearchPersons({ maxRows }, query) {
    let wsparams = { maxRows, CAS: config.connected, token: query.token };
    return WsService.compute_wsparams_user_filters(query).then(wsparams_filters =>
        WsService.searchPersons({ ...wsparams, ...wsparams_filters })
    ).then(persons => {
        persons.forEach(p => {
            p.photoURL = config.photoURL(p);
        });
        return persons;
    })
}

export default {
  props: ['query'],
  components: { ChooseFormat, Trombi, UserInTable, Filters, OrgChart, Slider },
  data() {
      return {
        // users matching filters
        persons: [],
      };
  },
  computed: {
      noFilters() {
           return !['token', 'affectation', 'affiliation', 'diploma', 'role', 'activite'].find(filter => this.query[filter]);
      },
      connected() {
          return config.connected;
      },
      maxRows() {
          return config.connected ? config.searchAuthMaxResult : config.searchNoauthMaxResult;
      },
      slides() {
          return config.slides;
      },
  },
  watch: {
    'query': {
        handler: 'updateAsyncData',
        immediate: true,
    },
  },
  methods: {
    updateAsyncData() {
        this.persons = undefined;

        if (this.noFilters || this.query.format === 'chart') {
        } else {
          _getSearchPersons({ maxRows: this.maxRows }, this.query).then((persons) => {
            persons = persons.map(p => ({...p, ...sortUsers.descrAndWeight(p, sortUsers.isPedagogyAffectation(p)) }));
            persons = helpers.sortBy(persons, [ 'weight', 'displayName' ]);
            this.persons = persons;
          });
        }
    },
  },
}
</script>
