<template>
  <div class="container">
    <div class="row">
        <div class="col-md-6 col-md-offset-3">&nbsp;</div>
        <div class="col-md-6 col-md-offset-3">
            <form @submit="showUsers(search_token)">
            <div class="form-group has-feedback">
                <i class="glyphicon glyphicon-search form-control-feedback"></i>
                <autocompleteUserAndGroup
                     placeholder="Recherche d'une personne, d'une structure..." class="form-control" v-auto-focus
                     :wsparams="wsparams" v-model="search_token"
                     @searchSuccess="searchResults = $event" @select="showUserOrStructure">
                </autocompleteUserAndGroup>
            </div>
            </form>

        </div>
    </div>

    <div class="row" style="margin-bottom: 25px">
        <div class="col-md-12" >
            <ul class="nav nav-pills menu-top" role="tablist">
            <div class="radio-inline" v-for="aff in usefulAffiliations">
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
    <div class="row" >
        <router-view></router-view>
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
    usefulAffiliations() { return config.usefulAffiliations },
    query() { return this.$route.query },
  },
  asyncComputed: {
      wsparams() {
        //console.log('set_autocomplete_wsparams', this.query);
        return WsService.compute_wsparams_user_filters(this.query).then(wsparams_filters => {
            let wsparams = { filter_category: "structures", group_attrs: "businessCategory", CAS: !!this.query.connected }
            return { ...wsparams, ...wsparams_filters }
        });
      },
  },

  watch: {
    query() {
        if (this.query.connected && !window.prolongation_ENT_args) {
            window.location.reload();
        }
    }
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
            this.go(this.withUser(userOrGroup.mail));
        } else {
            // recherche d'une structure
            let affectation = userOrGroup.key.replace('structures-','');
            this.go(this.withParam('affectation', affectation));
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

<style>
.imgCircle {
  position: relative;
  width: 130px;
  height: 130px;
  overflow: hidden;
  border-radius: 50%;
  padding-left: 0;
}

.imgCircle img {
  width: 100%;
  height: auto;
  border: 0 none;
  float: left;
  margin: -20px 0 0 0px;
  max-height: none;
  max-width: none;
  padding: 0;
}

label {
  margin-right: 0.5em;
  margin-bottom: 0;
}

.selected {
    background-color:#dad3d3;
    color:white;
    text-decoration: none;
}

/**
Surcharger btn-primary,breadcrumb
**/
.btn-primary {
  border-color: white !important;
}

</style>
