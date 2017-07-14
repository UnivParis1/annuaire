<template>
<div v-if="!e1">
  <div class="container">
    Veuillez patienter
  </div>
</div>
<div v-else>
  <div class="tree mainTree" style="margin-left: 4px">
  <ul>
    <li style="flex-grow: 1; border-bottom: 1px solid #143e6e;"></li>
    <li>
      <span class="bloc">{{e1.name}}</span>
      <ul>
          <li v-for="(e, index) in l2" :key="e.key" :class="[ e === e2 ? 'selectedElt' : nonSelectedEltClass ]">
              <div class="horizLeft"></div>
              <div class="horizRight"></div>
              <span :class="{ sameBlocSize: e3.key || !e2.key || e2.businessCategory === 'organization' }">
                <router-link :to="withParam('affectation', e.key)" class="bloc" :class="classes(e)" :title="e.key">{{getName(e)}}
                  <members :affectation="!e3.key && e2.key" :roles="e2.roles" :query="query" v-if="e === e2 && !e3.key"></members>
                </router-link>
              </span>
              <div class="horizLeftBelow" v-if="index <= e2_index"></div>
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
        <li v-for="(e, index) in l3" :class="[ e === e3 ? 'selectedElt' : nonSelectedEltClass ]">
            <div class="verticalTop"></div>
            <div class="verticalBottom"></div>
            <span class="bloc" :class="classes(e)">
                <div class="imgCircle">
                   <img :src="'https://userphoto.univ-paris1.fr/?uid=' + e.roles[0].uid + '&penpalAffiliation=loggedUser'" v-if="e.roles.length">
                </div>
              <router-link :to="withParam('affectation', e.key)" :title="e.key" :tag="e.subGroups ? 'a' : 'span'">
                <span class="name">{{getName(e)}}</span>
              </router-link>
              <members :affectation="!e4.key && e.key" :roles="e.roles" :query="query" v-if="e === e3"></members>
            </span>
            <div class="verticalTopRight" v-if="l4 && index <= e3_index"></div>
            <div class="verticalBottomRight" v-if="l4 && index < e3_index"></div>
        </li>        
    </ul>
   </div>

   <div class="tree thirdPane" v-if="l4">
       <div style="flex-grow: 1; min-width: 20px; border-top: 1px solid #143e6e" ></div>
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
         if (!this.query.connected && !this.query.token || !this.affectation) {
             return [];
         }
         return WsService.searchPersons({
             CAS: this.query.connected,
             token: this.query.token,
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
    let r = [];
    while (e.depth >= 2) {
        r.unshift(e);
        e = code2tree[e.parentKey];
    }
    return r;
}

export default {
   components: { members },
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
     l4() { return (this.displayAll || this.e4.key) && this.e3.subGroups },
     l5() { return (this.displayAll || this.e5.key) && this.e4.subGroups },
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

 .sameBlocSize {
     display: flex;
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

 li.nonSelectedElt {
     font-size: 30%;
     text-align: initial;
 }
li.nonSelectedElt .imgCircle {
     display: none;
 }

 li.nonSelectedElt .bloc {
     opacity: 0.5;
     overflow: hidden;
 }
 .tree li.nonSelectedElt .bloc {
     min-height: 0;
     width: 15px;
     padding: 5px 2px;
 }
 
 .tree li > .horizLeft,
 .tree li > .horizRight {
   position: absolute; top: 0; 
   width: 50%; height: 20px;
   border-top: 1px solid #143e6e;

   background-image: url(arrow-NE.svg);
   background-size: 5px;
   background-position: left bottom;
   background-repeat: no-repeat;   
 }
 .tree li > .horizLeft {
   background-image: url(arrow-NW.svg);
   background-position: right bottom;
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
 .tree li.selectedElt > .horizLeftBelow {
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
     padding: 0px 20px 8px 20px;
 }
 .vertical li .bloc {
   margin-top: 8px;
   width: 15em;
   padding: 0;
 }
 .vertical li.nonSelectedElt {
     padding-top: 8px;
 }
 .vertical li.nonSelectedElt .bloc {
   margin-top: 0;
   min-height: initial;
   height: 8px;
 }

 .vertical .name {
   padding: 5px 10px;
 }
 
 .vertical li > .verticalTop,
 .vertical li > .verticalBottom {
     position: absolute; left: 0; 
     border-left: 1px solid #143e6e;
     width: 20px; height: 50%;

   background-image: url(arrow-WN.svg);
   background-size: 5px;
   background-position: right bottom;
   background-repeat: no-repeat;   
 }
 .vertical li > .verticalBottom {
    background-image: url(arrow-WS.svg);
    background-position: right top;
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
 .vertical li.selectedElt > .verticalTopRight {
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
 .thirdPane li.nonSelectedElt {
   min-width: initial;
 }

 .imgCircle {
    width: 26px;
    height: 26px;
    margin: -13px 0 0 -13px;
    display: block;
    float: left;
 }
 .imgCircle img {
     margin-top: -4px;
 }

</style>

<style>
 .mainTree .members_other,
 .secondPane > .vertical .members_other {
   max-height: 10em;
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