<template>
  <input type="search" :value="modelValue" @input="oninput">
</template>

<script>
import config from '../config';

export default {
  model: { prop: 'modelValue', event: 'update:modelValue' },
  props: ['modelValue', 'wsparams'],
  methods: {
      oninput(event) {
          this.$emit('update:modelValue', event.target.value);
      },
      installWidget() {
        if (!this.wsparams) return;

        let select = (event, ui) => {
            // NB: this event is called before the selected value is set in the "input"
            ui.item.id = ui.item.value;
            ui.item.name = ui.item.label;
            // afficher prénom et nom de la personne sélectionnée sur le input
            jQuery(this.$el).val(ui.item.label);

            this.$emit("select", ui.item);
        };
        let onSearchSuccess = (data) => {
            // onSearchSuccess renvoie une liste des groups et/ou users
            this.$emit("searchSuccess", data);
            return data; // we could filter the results, but we just want to know the results
        };

        const warning_listeRouge = `Les personnels de l'université peuvent voir d'autres résultats. <br><a onclick='document.location = this.href' href='${this.connectedHref({})}'>Connexion</a>`;
        const warningMsgs = {
            listeRouge_plural: warning_listeRouge,
            listeRouge_one:    warning_listeRouge,
        };

        let params = { select, onSearchSuccess, warningMsgs, wsParams: this.wsparams };
        // autocompleteUser de jQuery gère l'autocomplétion
        let searchURL = config.wsgroupsURL + '/search';
        jQuery(this.$el)['autocompleteUserAndGroup'](searchURL, params);
      },
  },
  watch: {
    wsparams: {
        handler: 'installWidget',
        immediate: true,
        deep: true,
    },
    value(val) {
        if (val === null) {
            this.$el.blur();
        }

    },
  },
  
}
</script>

