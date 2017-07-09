<template>
<div v-if="e1">
  <div class="tree mainTree" style="margin-left: 4px">
  <ul>
    <li style="flex-grow: 1; border-bottom: 1px solid #143e6e;"></li>
    <li>
      <span class="bloc">{{e1.name}}</span>
      <ul>
          <li v-for="(e, index) in l2" :key="e.key">
              <div class="horizLeft"></div>
              <div class="horizRight"></div>
              <div class="verticalCenter"></div>
              <router-link :to="withParam('affectation', e.key)" class="bloc" :class="classes(e)" :title="e.key">{{getName(e)}}</router-link>
              <div class="horizLeftBelow" :class="{ withBorder: index === e2_index }" v-if="index <= e2_index"></div>
              <div class="horizRightBelow" v-if="index < e2_index"></div>              
          </li>        
      </ul>
    </li>
    <li style="flex-grow: 1"></li>
  </ul>
  </div>

  <div class="secondPane" v-if="l3">
      
   <div class="vertical">
     <ul>
       <li class="withBorder">
        </li>
        <li v-for="(e, index) in l3">
            <div class="verticalTop"></div>
            <div class="verticalBottom"></div>
            <div class="horizMiddle"></div>            
            <router-link :to="withParam('affectation', e.key)" class="bloc" :class="classes(e)" :title="e.key">
              <img class="photo" :src="'https://userphoto.univ-paris1.fr/?uid=' + e.roles[0].uid + '&penpalAffiliation=loggedUser'" v-if="e.roles.length">
              <span class="name">{{getName(e)}}</span>
              <members :roles="e.roles" :members="e.members" v-if="index === e3_index"></members>
            </router-link>
            <div class="verticalTopRight" :class="{ withBorder: index === e3_index }" v-if="l4 && index <= e3_index"></div>
            <div class="verticalBottomRight" v-if="l4 && index < e3_index"></div>
        </li>        
    </ul>
   </div>

   <div class="tree thirdPane" v-if="l4">
       <div style="flex-grow: 1; min-width: 20px; border-top: 1px solid #143e6e" ></div>
       <ul>
           <li v-for="e in l4">
               <div class="horizLeft"></div>
               <div class="horizRight"></div>
               <div class="verticalCenter"></div>
               <span class="bloc" :class="classes(e)">
                 <span :title="'(' + e.key + ') ' + e.name">{{getName(e)}}</span>
                 <members :affectation="e.key" :roles="e.roles" :query="query"></members>
               </span>
               <div class="vertical" v-if="e.subGroups">
                 <ul>
                   <li v-for="e in e.subGroups">
                       <div class="verticalTop"></div>
                       <div class="verticalBottom"></div>
                       <div class="horizMiddle"></div>            
                       <span class="bloc" :class="classes(e)" :title="e.key">
                           <span :title="'(' + e.key + ') ' + e.name">{{getName(e)}}</span>
                           <members :affectation="e.key" :roles="e.roles" :query="query"></members>
                       </span>
                   </li>
                 </ul>
               </div>
           </li>
       </ul>
       <div style="flex-grow: 1" ></div>
   </div>
   <div v-else style="margin: 3em">
         <span v-if="e2.roles && e2.roles.length || e2.members && e2.members.length">
           Personnes attachées directement à {{getName(e2)}} :
         </span>
         <members :affectation="e2.key" :roles="e2.roles" :query="query"></members>
   </div>
  </div>
  </div>
</template>

<script>
import Vue from 'vue'
import * as WsService from '../WsService';
import config from '../config';

function groupBy(l, by) {
    let r = [];
    let current;
    for (let e of l) {
        let v = by(e);
        if (!current || v !== current.v) {
            current = { v, group: [] };
            r.push(current);
        }
        current.group.push(e);
    }
    return r;
}

const members = Vue.extend({
    props: ['affectation', 'roles', 'query'],
    template: `
  <div class="members" v-if="members && members.length || roles.length">
    <span v-for="role in rolesGrouped">
      <span class="role">{{role.v}}&nbsp;: </span>
      <br>
      <span v-for="u in role.group">
        <router-link :to="withUser(u.uid)">{{u.displayName}}</router-link>
        <br>
      </span>
    </span>
    <span v-if="members && members.length">
      <br v-if="roles.length">
      <div class="members_other">
        <span v-for="aff in affiliations" v-if="membersByAffiliation[aff].length">
        <span class="affiliationName">{{t(translateAff(aff, membersByAffiliation[aff].length))}}</span><br>
        <span v-for="u in membersByAffiliation[aff]" :title="u.info">
          <router-link :to="withUser(u.mail)">{{u.displayName}}</router-link><br>
        </span>    
        <br>
        </span>
      </div>
    </span>
  </div>`,
    computed: {
        rolesGrouped() {
            return groupBy(this.roles, u => u.supannRoleGenerique.join(", "));
        },
        affiliations() {
            return ['other', ...config.usefulAffiliations ].reverse();
        },
        membersByAffiliation() {
            if (!this.members) return;
            
            let toIgnore = this.roles.map(e => e.uid);

            let r = {};
            this.affiliations.forEach(aff => r[aff] = []);

            for (let person of this.members) {
                if (!toIgnore.includes(person.uid)) {
                    let aff = person.eduPersonPrimaryAffiliation;
                    r[aff in r ? aff : "other"].push(person);
                }
            }
            return r;
        }
    },
    asyncComputed: {
      members() {
         if (!this.query.connected) {
             return [];
         }
         return WsService.searchPersons({
             CAS: true,
             filter_eduPersonPrimaryAffiliation: this.query.affiliation || 'teacher|researcher|staff',
             filter_supannEntiteAffectation: this.affectation, attrs: 'uid,displayName,mail,info,eduPersonPrimaryAffiliation',
         });
      },
    },
    methods: {
        translateAff(aff, plural) {
           return "STATUS_" + aff + (plural > 1 || aff === "staff" ? "s" : "");
        },
    },
});

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

 function initTree(tree, depth) {
     tree.members = undefined; // init for vuejs
     tree.depth = depth;
     tree.key = tree.key.replace(/^structures-/, '');
     if (tree.key.match(/^PR/)) tree.business = "gold";
     sortRoles(tree.roles);
     
     (tree.subGroups || []).forEach(e => {
         e.parentKey = tree.key;
         initTree(e, depth+1);
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
    while (e.depth >= 4) {
        e = code2tree[e.parentKey];
    }
    return e.depth === 3 ? [ code2tree[e.parentKey], e ] : [ e ];
}

export default {
   components: { members },
   props: ['selected', 'query'],
   computed: {
     selectedList() { return this.e1 && this.selected ? get_selectedList(this.e1, this.selected) : [] },
     e2() { return this.selectedList[0] || {} },
     e3() { return this.selectedList[1] || {} },
     e2_index() { return this.l2.indexOf(this.e2) },
     e3_index() { return this.l3.indexOf(this.e3) },
     l2() { return this.e1.subGroups.filter(e => e.businessCategory !== "council") },
     l3() { return this.e2.subGroups },
     l4() { return this.e3.subGroups },
   },
   asyncComputed: {
    e1() {     
        return withSubGroups({ name: "Président de l'université", key: 'UP1', depth: 1, businessCategory: "gold", roles: [] });
    },      
   },
   methods: {
     getName(e) {
       return e.name.replace(/^[\w- ]*?\s[:–-] /i, '');
     },
     classes(e) {
       return ['depth' + e.key.length, e.businessCategory, { leaf: !e.subGroups }];
     },
   },
};
  
</script>

<style scoped>
img.photo {
   width: 32px;
   float: left;
   border-radius: 5px 0 0 5px;
 }

 ul {
   margin: 0; padding: 0;
   position: relative;
 }
 
 li {
   text-align: center;
   list-style-type: none;
   position: relative;
   padding: 5px;
 }

 li .bloc {
     border: 1px solid #e94a1c;
     padding: 5px 10px;
     display: inline-block;   
     border-radius: 5px;
     min-height: 32px;
 }

 li .bloc.library,
 li .bloc.leaf {
     border-color: #00adef;
 }
 li .bloc.pedagogy {
     border-color: #a08777;
 }
 li .bloc.gold {
     border-color: #bf8719;
 }

 .mainTree ul {   
     padding-top: 20px;
 }

 .tree li {
     padding-top: 20px;
 }
 .mainTree li li {
     padding-bottom: 20px;
     display: flex;
 }
 
/* We will use  .horizLeft and  .horizRight to draw the connectors. Both  .horizLeft and  .horizRight are displayed ABOVE li>a :
   li .horizLeft, ul::before on the left
   li .horizRight on the right
 */

 .tree ul {
     display: flex;
 }

 .tree li > .verticalCenter {
     position: absolute; top: 0; left: 1px; right: 0;
     height: 21px;
     background-image: url(arrow.svg);
     background-size: 11px;
     background-position: center bottom;
     background-repeat: no-repeat;
 }
 
 .tree li > .horizLeft,
 .tree li > .horizRight {
   position: absolute; top: 0; 
   width: 50%; height: 19px;
   border-top: 1px solid #143e6e;
 }

 .tree li > .horizLeftBelow,
 .tree li > .horizRightBelow {
     position: absolute; bottom: 0; 
     width: 50%; height: 19px;
     border-bottom: 1px solid #143e6e;
 }
 
 .tree li > .horizLeft,
 .tree li > .horizLeftBelow {
   right: 50%;
 } 
 .tree li > .horizRight,
 .tree li > .horizRightBelow {
   left: 50%;
 }
 .tree li > .horizRight {
   border-left: 1px solid #143e6e;
 }
 .tree li > .horizLeftBelow.withBorder {
     border-right: 1px solid #143e6e;
     border-radius: 0 0 5px 0;
 }

 /* Remove left connector from first child and right connector from last child*/
 .mainTree li:first-child > .horizLeft,
 .tree li:last-child > .horizRight {
   border-top: none;
 }

 /* rounded left border */
 .mainTree li:first-child > .horizRight {
     border-radius: 5px 0 0 0;
 }

 /* replace last border-left with border-right to allow rounded border in the left direction */
 .tree li:last-child > .horizRight {
   border-left: none;
 }
 .tree li:last-child > .horizLeft {
   border-right: 1px solid #143e6e;
   border-radius: 0 5px 0 0;
 }

 /* but remove it for root node */
 .mainTree > ul > li > .horizLeft {
     display: none;
 }

 .mainTree > ul, .mainTree > ul > li {
     padding: 0;
 }

/* add downward connectors from parents*/
 .mainTree ul ul::before {
   content: '';
   position: absolute; top: 0; right: 50%;
   border-right: 1px solid #143e6e;
   width: 0; height: 20px;
 }

 
 .vertical {
     float: left;
 }

 .vertical > ul > li.withBorder {
     border-left: 1px solid #143e6e;
     border-top: 1px solid #143e6e;
     border-radius: 5px 0 0 0;
     width: 4px;
     height: 40px;
     padding: 0;
     margin-top: -1px;
 }

 .vertical li {
     padding-left: 20px;
     padding-right: 20px;
 }
 .vertical li .bloc {
   width: 15em;
   padding: 0;
 }

 .vertical .name {
   padding: 5px 10px;
 }

 
 .vertical li > .horizMiddle {
     position: absolute; top: 0; bottom: 1px; left: 0;
     width: 22px;
     background-image: url(arrow-right.svg);
     background-size: 11px;
     background-position: right center;
     background-repeat: no-repeat;
 }
 
 .vertical li > .verticalTop,
 .vertical li > .verticalBottom {
     position: absolute; left: 0; 
     border-left: 1px solid #143e6e;
     width: 19px; height: 50%;
 }
 
 .vertical li > .verticalTopRight,
 .vertical li > .verticalBottomRight {
     position: absolute; right: 0; 
     border-right: 1px solid #143e6e;
     width: 19px; height: 50%;
 }

 .vertical li > .verticalTop,
 .vertical li > .verticalTopRight {
     bottom: 50%;
 } 
 .vertical li > .verticalBottom,
 .vertical li > .verticalBottomRight {
     top: 50%;
 }

 .vertical li > .verticalTop,
 .vertical li > .verticalTopRight.withBorder {
     border-bottom: 1px solid #143e6e;
 }

 .vertical li:last-child > .verticalBottom {
     border-left: none;
 }

 /* rounded bottom border */
 .vertical li:last-child > .verticalTop {
     border-radius:  0 0 0 5px;
 }

 .secondPane {
     display: flex;
 }

 .secondPane .tree {
     flex-grow: 1;
 }

 .members_other {
   font-size: 80%;
 }

 .thirdPane {
     margin-top: 40px;
     display: flex;
 }

 .thirdPane > ul {
     padding-top: 0;
 }
 .thirdPane li {
   min-width: 10em;
 }
</style>

<style>
 .secondPane > .vertical .members_other {
   max-height: 5em;
   overflow-y: auto;
 }
  .members {
   text-align: left;
   margin-top: 1em;
 }

 .vertical .members {
   margin-left: 0.5em;
 }

 .role {
   color: #00326E;
   font-size: 80%;
 }

  .affiliationName {
    font-variant: small-caps;
    font-weight: bold;
    font-size: 80%;     
 }

 
 </style>