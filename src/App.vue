<template>
<div class="App" :class="{ hideChart: !allowChart }">
  <div class="container">
    <div class="search">
            <form @submit.prevent="showUsers(search_token)">
            <div class="form-group has-feedback">
                <i class="glyphicon glyphicon-search form-control-feedback"></i>
                <autocompleteUserAndGroup
                     placeholder="Rechercher une personne, une structure, une fonction, ..." class="form-control" v-auto-focus
                     :wsparams="wsparams" v-model="search_token"
                     @searchSuccess="searchResults = $event" @select="showUserOrStructure">
                </autocompleteUserAndGroup>
            </div>
            </form>

        <div class="text-center" >
            <ul class="nav nav-pills menu-top affiliations" role="tablist">
            <div class="radio-inline" v-for="aff in usefulAffiliationsGrouped">
                <li :class="aff == query.affiliation ? 'selected' : 'deselected'">
                  <router-link :to="withParam('affiliation', aff)">
                    {{t("STATUS_" + aff)}}
                    </router-link>
                    <router-link :to="withParam('affiliation', undefined)" v-if="aff == query.affiliation">
                     <span class="badge"><span class='glyphicon glyphicon-remove'></span></span>
                  </router-link>
                </li>
            </div>
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
import AutocompleteUserAndGroup from './components/AutocompleteUserAndGroup';
import * as WsService from './WsService';
import config from "./config";

export default {
  name: 'app',
  components: { AutocompleteUserAndGroup },

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
  data() {
      return {
        search_token: '',
        searchResults: {},
      };
  },
  computed: {
    usefulAffiliationsGrouped() { return config.usefulAffiliationsGrouped },
    query() { return this.$route.query },
  },
  asyncComputed: {
      wsparams() {
        //console.log('set_autocomplete_wsparams', this.query);
        return WsService.compute_wsparams_user_filters(this.query).then(wsparams_filters => {
            let wsparams = { kinds: 'users,groups,supannRoleGenerique,supannActivite', filter_category: "structures|diploma", group_attrs: "businessCategory", CAS: config.connected }
            return { ...wsparams, ...wsparams_filters }
        });
      },
      allowChart() { return window.validApps.then(apps => "annuaire_organigramme" in apps) },
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
