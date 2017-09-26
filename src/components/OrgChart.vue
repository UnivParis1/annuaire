<template>
<div v-if="!e1">
  <div class="container">
    Veuillez patienter
  </div>
</div>
<div v-else class="OrgChart">
  <div class="tree mainTree" style="margin-left: 4px">
  <ul>
    <li style="flex-grow: 1; border-bottom: 1px solid #143e6e;"></li>
    <li>
      <span class="bloc" :class="classes(e1)">
        <Photo :user="e1.roles[0]" v-if="e1.roles[0]"></Photo>
        {{getName(e1)}}
        <br>
        <router-link :to="withUser(e1.roles[0].uid)" v-if="e1.roles[0]">{{e1.roles[0].displayName}}</router-link>
      </span>
      <ul>
          <li v-for="(e, index) in l2" :key="e.key" :class="[ e === e2 ? 'selectedElt' : nonSelectedEltClass ]">
              <div class="horizLeft"></div>
              <div class="horizRight"></div>
              <span :class="{ sameBlocSize: e3.key || !e2.key || e2.businessCategory === 'organization' }">
               <span class="bloc" :class="classes(e)">
                <Photo :user="e.roles && e.roles[0]" v-if="e !== e2"></Photo>
                <router-link :to="withParam('affectation', e.key)" :title="e.key">{{getName(e)}}
                  <members :affectation="!e3.key && e2.key" :roles="e2.roles" :query="query" v-if="e === e2 && !e3.key"></members>
                </router-link>
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
       <li class="withBorder"></li>
            <div class="verticalTop" v-if="l4"></div>
            <div class="verticalBottom" v-if="l4"></div>
        </li>
        <li v-for="(e, index) in l3" :class="[ e === e3 ? 'selectedElt' : nonSelectedEltClass ]">
            <div class="verticalTop"></div>
            <div class="verticalBottom"></div>

            <div class="secondary-bloc" v-if="e === e3 && display_secondary_bloc">
              <div class="bloc" :class="classes(e)">
                <members :affectation="!e4.key && e.key" :roles="e.roles" :query="query"></members>
            </div>
              <div class="verticalTopRight" v-if="l4"></div>
            </div>
            <div class="connect-blocs" :class="classes(e)" v-if="e === e3 && display_secondary_bloc"></div>

            <span class="bloc first-bloc" :class="classes(e)">
              <Photo :user="e.roles && e.roles[0]" v-if="e !== e3"></Photo>
              <router-link :to="withParam('affectation', e.key)" :title="e.key" :tag="e.subGroups ? 'a' : 'span'">
                <span class="name">{{getName(e)}}</span>
              </router-link>
              <members :affectation="!e4.key && e.key" :roles="e.roles" :query="query" v-if="e === e3 && !display_secondary_bloc"></members>
            </span>
            <div class="verticalTopRight" v-if="l4 && (index < e3_index || index === e3_index && !display_secondary_bloc)"></div>
            <div class="verticalBottomRight" v-if="l4 && index < e3_index"></div>
        </li>        
    </ul>
   </div>

   <div class="tree thirdPane" v-if="l4">
       <div class="empty4"></div>
       <ul>
           <li v-for="e in l4" :class="[ e === e4 ? 'selectedElt' : nonSelectedEltClass ]">
               <div class="horizLeft"></div>
               <div class="horizRight"></div>
               <span class="bloc" :class="classes(e)">
                 <span :title="'(' + e.key + ') ' + e.name">{{getName(e)}}</span>
                 <members :affectation="!e5.key && e.key" :roles="e.roles" :query="query" v-if="e === e4 || displayAll"></members>
               </span>
               <div class="vertical" v-if="e.subGroups && (displayAll || e === e4 && e5.key)">
                 <ul>
                   <li v-for="e in e.subGroups" :class="[ e === e5 ? 'selectedElt' : nonSelectedEltClass ]">
                       <div class="verticalTop"></div>
                       <div class="verticalBottom"></div>
                       <span class="bloc" :class="classes(e)" :title="e.key">
                           <span :title="'(' + e.key + ') ' + e.name">{{getName(e)}}</span>
                           <members :affectation="e.key" :roles="e.roles" :query="query" v-if="e === e5 || displayAll"></members>
                       </span>
                   </li>
                 </ul>
               </div>
           </li>
       </ul>
       <div style="flex-grow: 1" ></div>
   </div>
  </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as WsService from '../WsService';
import Photo from './Photo';
import OrgChartMembers from './OrgChartMembers';
import config from '../config';

 function sortRoles(roles) {
     roles.forEach(role => {
         role.importance = Math.min(...(role.supannRoleGenerique || [ "inconnu" ]).map(role => (
             role.match(/adjoint/i) ? 3 :
             role.match(/^Directeur/) ? 1 :
             role.match(/^Chef/) ? 2 : 99
         )));
     });
     roles.sort((a,b) => a.importance - b.importance);
 }

 function initTree(tree, depth, parent) {
     tree.members = undefined; // init for vuejs
     tree.depth = depth;
     tree.key = tree.key.replace(/^structures-/, '');
     sortRoles(tree.roles);
     if (tree.key.match(/^PR/)) tree.businessCategory = "gold";
     if (tree.key === 'PR' && parent && parent.roles.length === 0) {
       parent.roles = tree.roles;
       tree.roles = [];
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

 function addSubGroups(e) {
     if (!e.subGroups) withSubGroups(e);
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
     l3() { return this.e2.subGroups },
     l4() { return (this.displayAll || this.e4.key) && this.e3.members && this.e3.subGroups },
     l5() { return (this.displayAll || this.e5.key) && this.e3.members && this.e4.subGroups },

     display_secondary_bloc() { return this.e3 && this.e3.members && this.e3.members.length > 0 },
     no_secondary_bloc() { return this.e3 && this.e3.members && this.e3.members.length === 0 },
   },
   asyncComputed: {
    e1() {     
        return withSubGroups({ name: "Président de l'université", key: 'UP1', depth: 1, businessCategory: "gold", roles: [] });
    },      
   },
   watch: {
    e3(e) {
        if (e) WsService.OrgChart.getMembers(this.query, e.key).then(l => e.members = l);
    },
   },
   methods: {
     getName(e) {
       return e.name.replace(/^[\w- ]*?\s[:–-] /i, '');
     },
     classes(e) {
       return ['bordered', 'depth' + e.key.length, e.businessCategory, { leaf: !e.subGroups }];
     },
   },
};
  
</script>
