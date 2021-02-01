<template>
<div class="App" :class="{ hideChart: !allowChart }">
  <div class="container row">
    <div class="search">
            <form @submit.prevent="showUsers(search_token)">
            <div class="form-group has-feedback" :class="{ 'with-clear-all-filters': placeholder }">
                <router-link class="clear-all-filters" v-if="placeholder"
                   @click.native="search_token=''"
                   :to="withParams({ affiliation: '', affectation: '', role: '', token: '' })">
                  <my-icon name="remove"></my-icon>
                </router-link>
                <autocompleteUserAndGroup
                     class="form-control" v-auto-focus
                     :placeholder="placeholder || default_placeholder"
                     :aria-label="placeholder || default_placeholder"
                     :wsparams="wsparams" v-model="search_token"
                     @searchSuccess="searchResults = $event" @select="showUserOrStructure">
                </autocompleteUserAndGroup>
                <my-icon name="search" class="form-control-feedback" />
            </div>
            </form>

        <div class="text-center" >
            <ul class="nav affiliations" role="tablist">
              <span v-for="aff in usefulAffiliationsGrouped">
                <li :class="aff == query.affiliation ? 'selected' : 'deselected'">
                  <router-link :to="withParam('affiliation', aff)">
                    {{t("STATUS_" + aff)}}
                    </router-link>
                    <router-link :to="withParam('affiliation', undefined)" v-if="aff == query.affiliation">
                     <span class="badge"><my-icon name='remove'/></span>
                  </router-link>
                </li>
              </span>
            </ul>
        </div>
    </div>
    <router-link class="chartFormatLink" :to="{ path: '/', query: { format: 'chart' } }">
        <span>Organigramme</span>
    </router-link>
  </div>
  <router-view></router-view>
  <div class="legalFooter">
    Avis de la CNIL numéro 370298. Il est rappelé que les droits des personnes figurant sur ce serveur sont garantis et protégés par la législation française et qu'il est interdit de capturer les informations nominatives pour les utiliser à des fins commerciales, publicitaires ou autres (cf. loi du 6/01/1978)
  </div>
</div>
</template>

<script>
import AutocompleteUserAndGroup from './components/AutocompleteUserAndGroup.vue';
import MyIcon from './components/MyIcon.vue';
import * as WsService from './WsService';
import { AutoFocus, asyncComputed } from './directives';
import helpers from './helpers';
import config from "./config";
import { computed } from "@vue/composition-api";

export default {
  name: 'app',
  directives: { AutoFocus },
  components: { MyIcon, AutocompleteUserAndGroup },

  mounted() {
    this.$translate.setLang('french');
  },
  /*
  Le App gère la partie saisie critère de recherche
  Deux recherches possibles:
    - En saisissant le crirère de recherche+Touche Enter (showUsers)
    - En saisissant le crirère de recherche+sélection dans la liste (showUserOrStructure):
      La rechercher peut être faite, soit pour une personne soit pour une structure
      1- sélectionner une personne
      2- sélectionner une structure
  */
  setup(props, context) {
    const query = computed(() => context.root && context.root.$route.query || {})
    return {
      query,
      queryO: asyncComputed(() => WsService.getQueryO(query.value)),
      allowChart: asyncComputed(async () => "annuaire_organigramme" in (await window.validApps)),
    }
  },
  data() {
      return {
        search_token: '',
        searchResults: {},
      };
  },
  computed: {
    usefulAffiliationsGrouped() { return config.usefulAffiliationsGrouped },
    wsparams() {
      //console.log('set_autocomplete_wsparams', this.query);
      if (!this.queryO) return undefined;
      const wsparams_filters = WsService.compute_wsparams_user_filters(this.queryO);
      let wsparams = { kinds: 'users,groups,supannRoleGenerique,supannActivite', filter_category: "structures|diploma", group_attrs: "businessCategory", CAS: config.connected }
      return { ...wsparams, ...wsparams_filters }
    },
    placeholder() {
      let what;
      if (this.queryO) {
        if (this.queryO.query.affiliation) {
          what = this.t("STATUS_one_" + this.query.affiliation);
        }
        if (this.queryO.role) {
          what = (what || "un(e)") + " " + helpers.lowerCaseFirstLetter(this.queryO.role.name);
        }
        if (this.queryO.affectation) {
          if (!what) what = "une personne";
          const gender = helpers.guess_affectation_gender(this.queryO.affectation.name);
          const ou = this.queryO.affectation.name.replace(/ [:-] .*/, '');
          what += " " + (ou.match(/^[AEIOUÉ]/i) ? "de l'" : gender === 'M' ? "du " : "de la ") + ou;
        } else if (this.queryO.diploma) {
          if (!what) what = "une personne";
          what += " de " + this.queryO.diploma.name;
        }
      }
      return what && `Vous recherchez ${what}`;
    },
    default_placeholder() {
      return 'Rechercher une personne, une structure, une fonction, ...'
    },
  },

  methods: {
    showUsers(token) {
        // Si aucune donnée renseignée(ex Critère vide+Enter) ou le resultat de la recherche (webwidget) ne contient que des structures, ne pas lancer la recherche(bloqué le Enter)
        if (!token || !this.searchResults || this.searchResults.users.length === 0) return;

        this.go(this.withParam('token', token));
    },

    // Le web widget de recherche retourne des personnes ou des structures
    showUserOrStructure(userOrGroup) {
        // recherche de personne
        if (userOrGroup.category === 'users') {
            this.go(userOrGroup.mail ? this.withUser(userOrGroup) : this.withParam('token', userOrGroup.displayName));
        } else if (userOrGroup.category === 'supannRoleGenerique') {
            this.go(this.withParam('role', userOrGroup.key));
        } else if (userOrGroup.category === 'supannActivite') {
            this.go(this.withParam('activite', userOrGroup.key));
        } else {
            // recherche d'un groupe "structures-xxx" or "diploma-xxx"
            let [, kind, val] = userOrGroup.key.match(/^(\w+)-(.*)/) || [];
            this.go(this.withParam(kind === 'structures' ? 'affectation' : kind, val));
        }
    },

    go({ path, query }) {
        //initialiser le champs de recherche a vide + loose focus
        this.search_token = null;

        this.$router.push({ path, query });
    },
  },
}

</script>
