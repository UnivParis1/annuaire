<template>
<div v-if="query.affiliation === 'student' || query.affiliation === 'alum'" class="container">
   <h5>Les étudiants ne sont pas affichés dans l'organigramme.</h5>
</div>
<div v-else-if="!e1">
  <div class="container">
    Veuillez patienter
  </div>
</div>
<div v-else class="OrgChart" ref="root_elt">
  <router-link to="/">
    <span class="badge backToHome2"><my-icon name='remove'/></span>
  </router-link>

  <div class="tree mainTree">
  <ul>
    <li style="flex-grow: 1;" :class="{ withBorder: e2.key }"></li>
    <li>
      <div class="div_depth1">
        <ul class="depth1_roles vertical">
            <li v-for="(b,i) in e1_roles[0]">
                <span class="bloc members">
                    {{b[1]}}<br>
                    <maybe-router-link :to="withUser(b[0])">{{b[0].displayName}}</maybe-router-link>
                </span>
                <div class="verticalTopRight" v-if="i > 0"></div>
                <div class="verticalBottomRight" v-if="i < e1_roles[0].length - 1"></div>
            </li>
        </ul>
        <div class="depth1_col2">
         <div></div> <!-- padding -->
         <div>
            <div class="horizLeft"></div>
            <div class="horizRight"></div>
            <span class="bloc" :class="classes(e1)">
            {{e1.top_role.supannRoleGenerique[0]}}
            <br>
            <maybe-router-link :to="withUser(e1.top_role)">{{e1.top_role.displayName}}</maybe-router-link>
            </span>
         </div>
         <div class="vertBelow"></div>
        </div>
        <ul class="depth1_roles vertical">
            <li v-for="(b,i) in e1_roles[1]">
                <span class="bloc members">
                    {{b[1]}}<br>
                    <maybe-router-link :to="withUser(b[0])">{{b[0].displayName}}</maybe-router-link>
                </span>
                <div class="verticalTop" v-if="i > 0"></div>
                <div class="verticalBottom" v-if="i < e1_roles[1].length - 1"></div>
            </li>
        </ul>
      </div>
      <ul class="ul_depth2">
          <li v-for="(e, index) in l2" :key="e.key" :class="[ e === e2 ? 'selectedElt' : nonSelectedEltClass ]">
              <div class="horizLeft"></div>
              <div class="horizRight"></div>
              <span :class="{ sameBlocSize: e3.key || !e2.key || e2.businessCategory === 'organization' }">
               <span class="bloc" :class="classes(e)">
                <router-link :to="withParam('affectation', e.key)">{{e.name}}</router-link>
                <members :structure="e2" :query="query" v-if="e === e2 && !e3.key"></members>
               </span>
              </span>
              <div class="horizLeftBelow" v-if="index <= e2_index"></div>
              <div class="horizRightBelow" v-if="index < e2_index"></div>
          </li>
      </ul>
    </li>
    <li style="flex-grow: 1"></li>
  </ul>
  </div>

  <div class="secondPane" v-if="l3" :class="{ display_secondary_bloc }">
   <div class="vertical">
     <transition-group name="flip-list" tag="ul">
        <li class="withBorder" key="__withBorder__"></li>
        <li v-for="(e, index) in l3" :class="[ e === e3 ? 'selectedElt' : nonSelectedEltClass ]" :key="e.key">
            <div class="verticalTop"></div>
            <div class="verticalBottom"></div>

            <div class="secondary-bloc" v-if="e === e3 && display_secondary_bloc">
              <div class="bloc" :class="classes(e)">
                <members :structure="e" :onlyRoles="e4.key" :query="query"></members>
            </div>
              <div class="verticalTopRight" v-if="l4"></div>
            </div>
            <div class="connect-blocs" :class="classes(e)" v-if="e === e3 && display_secondary_bloc"></div>

            <span class="bloc first-bloc" :class="classes(e)">
              <router-link :to="withParam('affectation', e.key)">
                <span class="name">{{e.name}}</span>
              </router-link>
              <members :structure="e" :onlyRoles="e4.key" :query="query" v-if="e === e3 && !display_secondary_bloc"></members>
            </span>
            <div class="verticalTopRight" v-if="l4 && (index < e3_index || index === e3_index && !display_secondary_bloc)"></div>
            <div class="verticalBottomRight" v-if="l4 && index < e3_index"></div>
        </li>
     </transition-group>
   </div>

   <div class="tree thirdPane" v-if="l4">
       <div class="empty4"></div>
       <ul>
           <li v-for="e in l4" :class="[ e === e4 ? 'selectedElt' : nonSelectedEltClass ]">
               <div class="horizLeft"></div>
               <div class="horizRight"></div>
               <span class="bloc" :class="classes(e)">
                 <router-link :to="withParam('affectation', e.key)" :title="e.fullname">{{e.name}}</router-link>
                 <members :structure="e" :onlyRoles="e5.key" :query="query" v-if="e === e4 || displayAll"></members>
               <div v-if="e.subGroups && (displayAll || e === e4 && e5.key)">
                 <ul>
                   <li v-for="e in e.subGroups" :class="[ e === e5 ? 'selectedElt' : nonSelectedEltClass ]">
                       <div class="verticalTop"></div>
                       <div class="verticalBottom"></div>
                       <span class="bloc" :class="classes(e)">
                           <span :title="e.fullname">{{e.name}}</span>
                           <members :structure="e" :query="query" v-if="e === e5 || displayAll"></members>
                       </span>
                   </li>
                 </ul>
               </div>
               </span>
           </li>
       </ul>
       <div style="flex-grow: 1" ></div>
   </div>
  </div>
  </div>
</template>

<script>
import * as WsService from '../WsService';
import OrgChartMembers from './OrgChartMembers.vue';
import MyIcon from './MyIcon.vue';
import { MaybeRouterLink, toComputed, asyncComputed } from '../directives';
import helpers from '../helpers';
import { watch, ref, computed } from 'vue';

 function initTree(tree, depth, parent) {
     tree.members = undefined; // init for vuejs
     tree.depth = depth;
     tree.key = tree.key.replace(/^structures-/, '');
     tree.fullname = tree.name;
     tree.name = tree.name.replace(/^[\wÀ-ú. -]*?\s: /i, '')
     tree = WsService.group_roles_remove_supannListeRouge_and_handle_gender(tree);
     if (tree.key === 'PR' && parent && parent.roles.length === 0) {
       parent.top_role = tree.roles[0]
     }

     (tree.subGroups || []).forEach(e => {
         e.parentKey = tree.key;
         initTree(e, depth+1, tree);
     });
 }

let withSubGroups = async (e) => {
    const subGroups = await WsService.getSubStructures(e.key)
    if (!subGroups) throw "error";
    e.subGroups = subGroups;
    initTree(e, e.depth);
    e.roles = (await WsService.getGroupFromStruct('UP1')).roles
    e.roles = helpers.sortBy(e.roles, ['supannRoleGenerique'])
    return e;
}

const moveOneFirst = (list, e) => {
  const [ l1, l2 ] = helpers.partition(list, (e_ => e_ === e));
  return [ ...l1, ...l2 ];
}


 function get_selectedList(e1, selected) {
    let code2tree = {};
    function getCodes(tree) {
        code2tree[tree.key] = tree;
        (tree.subGroups || []).forEach(getCodes);
    }
    getCodes(e1);

    let e = code2tree[selected];
    let r = [];
    while (e.depth >= 2) {
        r.unshift(e);
        e = code2tree[e.parentKey];
    }
    return r;
}

export default {
   components: { MaybeRouterLink, MyIcon, members: OrgChartMembers },
   props: ['selected', 'query', 'displayAll'],
   setup(props) {
    const root_elt = ref(null);
    const e1 = asyncComputed(() => withSubGroups({ name: "", key: 'UP1', depth: 1, businessCategory: "gold", roles: [] }))
    const selectedList = computed(() => e1.value && props.selected ? get_selectedList(e1.value, props.selected) : [])
    const e2 = computed(() => selectedList.value[0] || {})
    const e3 = computed(() => selectedList.value[1] || {})
    const e4 = computed(() => selectedList.value[2] || {})
    const e5 = computed(() => selectedList.value[3] || {})
    const l2 = computed(() => e1.value.subGroups.filter(e => e.businessCategory !== "council"))
    const l3 = computed(() => e2.value.subGroups && moveOneFirst(helpers.sortBy(e2.value.subGroups, ['name']), e3.value))
    const l4 = computed(() => (props.displayAll || e4.value.key) && e3.value.members && e3.value.subGroups && helpers.sortBy(e3.value.subGroups, ['name']))
    //const l5 = computed(() => (props.displayAll || e5.value.key) && e3.value.members && e4.value.subGroups)
    watch(e3, (e) => {
        if (e) {
          WsService.OrgChart.getMembers(props.query, e.key).then(l => e.members = l);
          setTimeout(() => {
            root_elt.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }, 100);
        }
    })
    return {
     root_elt,
     e1, e2, e3, e4, e5, l2, l3, l4,
    ...toComputed({
     nonSelectedEltClass() { return props.displayAll ? '' : 'nonSelectedElt' },
     e2_index() { return l2.value.indexOf(e2.value) },
     e3_index() { return l3.value.indexOf(e3.value) },
     e4_index() { return l4.value.indexOf(e4.value) },
     e1_roles() { 
         let l = []
         for (const role of e1.value.roles) {
             for (const name of role.supannRoleGenerique) {
                 l.push([role, name])
             }
         }
         const half = Math.floor(l.length / 2)
         return [ l.slice(0, half), l.slice(half) ]
     },
     display_secondary_bloc() { return e3.value && e3.value.members && e3.value.members.length > 0 },
     no_secondary_bloc() { return e3.value && e3.value.members && e3.value.members.length === 0 },
    }),
     classes(e) {
       return ['bordered', 'depth' + e.depth, e.businessCategory, { leaf: !e.subGroups }];
     },
    }
   },
};

</script>

<style>
 .flip-list-move {
    transition: transform 1.5s;
 }
</style>
