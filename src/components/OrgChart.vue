<template>
<div v-if="query.affiliation === 'student' || query.affiliation === 'alum'" class="container">
   <h5>Les étudiants ne sont pas affichés dans l'organigramme.</h5>
</div>
<div v-else-if="!e1">
  <div class="container">
    Veuillez patienter
  </div>
</div>
<div v-else class="OrgChart">
  <router-link to="/">
    <span class="badge backToHome2"><span class='glyphicon glyphicon-remove'></span></span>
  </router-link>

  <div class="tree mainTree">
  <ul>
    <li style="flex-grow: 1;" :class="{ withBorder: e2.key }"></li>
    <li>
      <span class="bloc" :class="classes(e1)">
        {{e1.roles[0].supannRoleGenerique[0]}}
        <br>
        <maybe-router-link :to="withUser(e1.roles[0])">{{e1.roles[0].displayName}}</maybe-router-link>
      </span>
      <ul>
          <li v-for="(e, index) in l2" :key="e.key" :class="[ e === e2 ? 'selectedElt' : nonSelectedEltClass ]">
              <div class="horizLeft"></div>
              <div class="horizRight"></div>
              <span :class="{ sameBlocSize: e3.key || !e2.key || e2.businessCategory === 'organization' }">
               <span class="bloc" :class="classes(e)">
                <router-link :to="withParam('affectation', e.key)" :title="e.key">{{e.name}}</router-link>
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
     <ul>
       <li class="withBorder">
            <div class="verticalTop" v-if="l4"></div>
            <div class="verticalBottom" v-if="l4"></div>
        </li>
        <li v-for="(e, index) in l3" :class="[ e === e3 ? 'selectedElt' : nonSelectedEltClass ]">
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
              <router-link :to="withParam('affectation', e.key)" :title="e.key">
                <span class="name">{{e.name}}</span>
              </router-link>
              <members :structure="e" :onlyRoles="e4.key" :query="query" v-if="e === e3 && !display_secondary_bloc"></members>
            </span>
            <div class="verticalTopRight" v-if="l4 && (index < e3_index || index === e3_index && !display_secondary_bloc)"></div>
            <div class="verticalBottomRight" v-if="l4 && index < e3_index"></div>
        </li>
    </ul>
   </div>

   <div class="tree thirdPane" v-if="l4">
       <div class="empty4"></div>
       <ul>
           <li v-for="e in l4" :class="[ e === e4 ? 'selectedElt' : nonSelectedEltClass ]">
               <div class="horizLeft"></div>
               <div class="horizRight"></div>
               <span class="bloc" :class="classes(e)">
                 <span :title="'(' + e.key + ') ' + e.fullname">{{e.name}}</span>
                 <members :structure="e" :onlyRoles="e5.key" :query="query" v-if="e === e4 || displayAll"></members>
               <div class="Xvertical" v-if="e.subGroups && (displayAll || e === e4 && e5.key)">
                 <ul>
                   <li v-for="e in e.subGroups" :class="[ e === e5 ? 'selectedElt' : nonSelectedEltClass ]">
                       <div class="verticalTop"></div>
                       <div class="verticalBottom"></div>
                       <span class="bloc" :class="classes(e)" :title="e.key">
                           <span :title="'(' + e.key + ') ' + e.fullname">{{e.name}}</span>
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
import Photo from './Photo';
import OrgChartMembers from './OrgChartMembers';
import helpers from '../helpers';

 function initTree(tree, depth, parent) {
     tree.members = undefined; // init for vuejs
     tree.depth = depth;
     tree.key = tree.key.replace(/^structures-/, '');
     tree.fullname = tree.name;
     tree.name = tree.name.replace(/^[\w- ]*?\s[:–-] /i, '');
     tree = WsService.group_roles_remove_supannListeRouge(tree);
     if (tree.key === 'PR' && parent && parent.roles.length === 0) {
       parent.roles = tree.roles;
     }
     
     (tree.subGroups || []).forEach(e => {
         e.parentKey = tree.key;
         initTree(e, depth+1, tree);
     });
 }
 
let getSubGroups = (key) => (
     WsService.getSubGroups({
         key: 'structures-' + key,
         depth: 3,
         filter_category: 'structures',
         with_organization: true,
     })
);
 
let withSubGroups = (e) => (
     getSubGroups(e.key).then(subGroups => {
         if (!subGroups) throw "error";
         e.subGroups = subGroups;
         initTree(e, e.depth);       
         return e;
     })
);

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
   components: { Photo, members: OrgChartMembers },
   props: ['selected', 'query', 'displayAll'],
   computed: {
     nonSelectedEltClass() { return this.displayAll ? '' : 'nonSelectedElt' },
     selectedList() { return this.e1 && this.selected ? get_selectedList(this.e1, this.selected) : [] },
     e2() { return this.selectedList[0] || {} },
     e3() { return this.selectedList[1] || {} },
     e4() { return this.selectedList[2] || {} },
     e5() { return this.selectedList[3] || {} },
     e2_index() { return this.l2.indexOf(this.e2) },
     e3_index() { return this.l3.indexOf(this.e3) },
     e4_index() { return this.l4.indexOf(this.e4) },
     l2() { return this.e1.subGroups.filter(e => e.businessCategory !== "council") },
     l3() { return this.e2.subGroups && helpers.sortBy(this.e2.subGroups, ['name']) },
     l4() { return (this.displayAll || this.e4.key) && this.e3.members && this.e3.subGroups && helpers.sortBy(this.e3.subGroups, ['name']) },
     l5() { return (this.displayAll || this.e5.key) && this.e3.members && this.e4.subGroups },

     display_secondary_bloc() { return this.e3 && this.e3.members && this.e3.members.length > 0 },
     no_secondary_bloc() { return this.e3 && this.e3.members && this.e3.members.length === 0 },
   },
   asyncComputed: {
    e1() {
        return withSubGroups({ name: "", key: 'UP1', depth: 1, businessCategory: "gold", roles: [] });
    },
   },
   watch: {
    e3(e) {
        if (e) WsService.OrgChart.getMembers(this.query, e.key).then(l => e.members = l);
    },
   },
   methods: {
     classes(e) {
       return ['bordered', 'depth' + e.depth, e.businessCategory, { leaf: !e.subGroups }];
     },
   },
};

</script>
