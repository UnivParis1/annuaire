<template>
<ul class="ul_depth2" :class="{ ul_last_depth2: !el.e2b.key }">
  <li v-for="(e,i) in el.l2" :key="e.key" :class="[ e === el.e2 ? 'selectedElt' : nonSelectedEltClass, !e.external && (el.l2[i+1] || {}).external ? 'last-internal' : '' ]">
    <div class="horizLeft" v-if="!e.external"></div>
    <div class="horizRight" v-if="!e.external"></div>
    <span :class="{ sameBlocSize: (el.e3.key || !el.e2.key || el.e2.businessCategory === 'organization') && !el.l2b }">
        <span class="bloc" :class="classes(2, e)">
            <router-link :to="withParam('affectation', e.key)">{{e.name}}</router-link>
            <members :structure="el.e2" :query="query" v-if="e === el.e2 && !el.e2b.key && !el.e3.key"></members>
        </span>

      <div v-if="e === el.e2 && el.l2b">
        <div class="smallVertical"></div>
        <ul class="ul_last_depth2">
            <li v-for="e in el.l2b" :key="e.key" :class="[ e === el.e2b ? 'selectedElt' : nonSelectedEltClass ]">
                <div class="horizLeft"></div>
                <div class="horizRight"></div>
                <span :class="{ sameBlocSize: el.e3.key || !el.e2b.key || el.e2b.businessCategory === 'organization' }">
                    <span class="bloc" :class="classes(2, e)">
                        <router-link :to="withParam('affectation', e.key)">{{e.name}}</router-link>
                        <members :structure="el.e2b" :query="query" v-if="e === el.e2b && !el.e3.key"></members>
                    </span>
                </span>
                <slot v-if="e === el.e2b"></slot>
            </li>
        </ul>
      </div>
    </span>
    <slot v-if="e === el.e2 && !el.e2b.key"></slot>
  </li>
</ul>
</template>

<script>
import { computed } from '@vue/runtime-core';
import OrgChartMembers from './OrgChartMembers.vue';

export const bloc_helpers = (props) => ({
    classes: (depth, e) => (
        ['bordered', 'depth' + depth, e.businessCategory, { leaf: !e.subGroups }, { external: e.external }, { dgs: e.dgs } ]
    ),
    nonSelectedEltClass: computed(() => 
        props.displayAll ? '' : 'nonSelectedElt'
    ),
})

export default {
    props: ['el', 'displayAll', 'query'],
    components: { members: OrgChartMembers },
    setup(props) {
        return bloc_helpers(props)
    }
}
</script>