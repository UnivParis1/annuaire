<template>
<div class="Users">
<div class="container">
    <Filters :queryO="queryO"></Filters>

    <div class="row" v-if="!noFilters">
        <div class="col-md-12">
            <div class="nb-results-and-formats">
               <span><span v-if="persons">{{persons.length}} résultat(s)</span></span>
               <ChooseFormat :format="query.format"></ChooseFormat>
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
        </div>
        <div class="col-md-12 warning" v-if="query.format === 'chart' && !connected" >
          <span>
              Seul les responsables sont affichés, pour voir tous les personnels,
              <a :href="connectedHref($route)">veuillez vous identifier.</a>
          </span>
        </div>
    </div>
</div>

<div v-if="query.format === 'chart'" class="OrgChart-outer">
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
import ChooseFormat from './ChooseFormat.vue';
import UserInTable from './UserInTable.vue';
import Trombi from './Trombi.vue';
import OrgChart from './OrgChart.vue';
import Filters from './Filters.vue';
import Slider from './Slider.vue';
import config from '../config';
import { ref, watchEffect, computed } from 'vue';
import { toComputed } from '../directives';

async function _getSearchPersons({ maxRows }, queryO) {
    let wsparams = { maxRows, CAS: config.connected, token: queryO.query.token };
    let wsparams_many_filters = WsService.compute_wsparams_user_many_filters(queryO);
    let persons_l = await helpers.pmap(wsparams_many_filters, wsparams_filters => (
      WsService.searchPersons({ ...wsparams, ...wsparams_filters })
    ))
    let persons = helpers.uniqBy([].concat(...persons_l), e => e.uid);
    persons.forEach(p => {
      p.photoURL = config.photoURL(p);
    });
    return persons;
}

export default {
  props: ['query'],
  components: { ChooseFormat, Trombi, UserInTable, Filters, OrgChart, Slider },
  setup(props) {
    const state = {
        // users matching filters
        persons: ref([]),
        queryO: ref(null),
    }
    const noFilters = computed(() => (
           !['token', 'affectation', 'affiliation', 'diploma', 'role', 'activite'].find(filter => props.query[filter])
    ))
    const maxRows = computed(() => (
          config.connected ? config.searchAuthMaxResult : config.searchNoauthMaxResult
    ))
    watchEffect(async () => {
        const queryO = state.queryO.value = await WsService.getQueryO(props.query)
        state.persons.value = undefined;

        if (noFilters.value || props.query.format === 'chart' || !queryO) {
          //
        } else {
            let persons = await _getSearchPersons({ maxRows: maxRows.value }, queryO);
            const affectation_and_sub = props.query.affectation && await WsService.getSubStructuresFlat(props.query.affectation);
            persons = persons.map(p => ({...p, ...sortUsers.descrAndWeight(p, sortUsers.isPedagogyAffectation(p), props.query.affectation, affectation_and_sub) }));
            persons = helpers.sortBy(persons, [ 'weight', 'displayName' ]);
            state.persons.value = persons;
        }
    });
    return {
      noFilters, maxRows,
     ...state,
     ...toComputed({
      connected() {
          return config.connected;
      },
      slides() {
          return helpers.shuffle(...config.slides);
      },
     }),
    }
  },
}
</script>

