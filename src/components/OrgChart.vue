<template>
<div v-if="query.affiliation === 'student' || query.affiliation === 'alum'" class="container">
   <h5>Les étudiants ne sont pas affichés dans l'organigramme.</h5>
</div>
<div v-else-if="!el.e1">
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
    <li style="flex-grow: 1;"></li>
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
            <span class="bloc" :class="classes(1, el.e1)">
            {{el.e1.top_role.supannRoleGenerique[0]}}
            <br>
            <maybe-router-link :to="withUser(el.e1.top_role)">{{el.e1.top_role.displayName}}</maybe-router-link>
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
      <ul class="ul_depth2" :class="{ ul_last_depth2: !el.e2b.key }">
          <li v-for="e in el.l2" :key="e.key" :class="[ e === el.e2 ? 'selectedElt' : nonSelectedEltClass ]">
              <div class="horizLeft"></div>
              <div class="horizRight"></div>
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
                      <template v-if="e === el.e2b">
                        <div class="horizLeftBelow" v-if="el.l3" ref="magic_line_2to3"></div>
                        <div class="horizLeftBelow" v-if="!el.e3.key && el.l4" ref="magic_line_2to4"></div>
                        <div class="horizRightBelow magic_line_right" v-if="!el.e3.key && el.l4" ref="magic_line_2to4_right"></div>
                      </template>
                  </li>
              </ul>
            </div>
              </span>
            <template v-if="e === el.e2 && !el.e2b.key">
              <div class="horizLeftBelow" v-if="el.l3" ref="magic_line_2to3"></div>
              <div class="horizLeftBelow" v-if="!el.e3.key && el.l4" ref="magic_line_2to4"></div>
              <div class="horizRightBelow magic_line_right" v-if="!el.e3.key && el.l4" ref="magic_line_2to4_right"></div>
            </template>
          </li>
      </ul>
    </li>
    <li style="flex-grow: 1"></li>
  </ul>
  </div>

  <div class="secondPane" ref="secondPane_elt" v-if="el.l3 || el.l4" :class="{ display_secondary_bloc }">
   <div class="vertical" v-if="el.l3">
     <transition-group name="flip-list" tag="ul">
        <li class="withBorder" key="__withBorder__"></li>
        <li v-for="(e, index) in el.l3" :class="[ e === el.e3 ? 'selectedElt' : nonSelectedEltClass ]" :key="e.key">
            <div class="verticalTop"></div>
            <div class="verticalBottom"></div>

            <div class="secondary-bloc" v-if="e === el.e3 && display_secondary_bloc">
              <div class="bloc" :class="classes(3, e)">
                <members :structure="e" :onlyRoles="el.e4.key" :query="query"></members>
            </div>
              <div class="verticalTopRight" v-if="el.l4"></div>
            </div>
            <div class="connect-blocs" :class="classes(3, e)" v-if="e === el.e3 && display_secondary_bloc"></div>

            <span class="bloc" :class="classes(3, e)">
              <router-link :to="withParam('affectation', e.key)">
                <span class="name">{{e.fullname}}</span>
              </router-link>
              <members :structure="e" :onlyRoles="el.e4.key" :query="query" v-if="e === el.e3 && !display_secondary_bloc"></members>
            </span>
            <div class="verticalTopRight" v-if="!el.l3b && el.l4 && (index < e3_index || index === e3_index && !display_secondary_bloc)"></div>
            <div class="verticalBottomRight" v-if="!el.l3b && el.l4 && index < e3_index"></div>
            <div class="connect_l3b" v-if="el.l3b && index === e3_index"></div>
        </li>
     </transition-group>
   </div>

   <div class="secondPane secondPaneB" v-if="el.l3b" :class="{ display_secondary_bloc }">
    <div class="vertical" v-if="el.l3">
      <transition-group name="flip-list" tag="ul">
          <li v-for="(e, index) in el.l3b" :class="[ e === el.e3b ? 'selectedElt' : nonSelectedEltClass ]" :key="e.key">
              <div class="verticalTop"></div>
              <div class="verticalBottom"></div>

              <div class="secondary-bloc" v-if="e === el.e3b && display_secondary_bloc">
                <div class="bloc" :class="classes(3, e)">
                  <members :structure="e" :onlyRoles="el.e4.key" :query="query"></members>
              </div>
                <div class="verticalTopRight" v-if="el.l4"></div>
              </div>
              <div class="connect-blocs" :class="classes(3, e)" v-if="e === el.e3b && display_secondary_bloc"></div>

              <span class="bloc" :class="classes(3, e)">
                <router-link :to="withParam('affectation', e.key)">
                  <span class="name">{{e.fullname}}</span>
                </router-link>
                <members :structure="e" :onlyRoles="el.e4.key" :query="query" v-if="e === el.e3b && !display_secondary_bloc"></members>
              </span>
              <div class="verticalTopRight" v-if="el.l4 && (index < e3_index || index === e3_index && !display_secondary_bloc)"></div>
              <div class="verticalBottomRight" v-if="el.l4 && index < e3_index"></div>
          </li>
      </transition-group>
     </div>
   </div>

   <div class="tree thirdPane" v-if="el.l4">
       <div class="empty4" :class="{ empty4WithBorder: el.e3.key }"></div>
       <div style="position: relative">
         <div class="empty4Top" ref="empty4Top_elt" v-if="!el.e3.key"></div>
         <ul>
           <li v-for="(e,index) in el.l4" :class="[ e === el.e4 ? 'selectedElt' : nonSelectedEltClass, !el.e3.key && el.l4.length === 1 ? 'l2_to_only_one_l4' : '' ]">
               <div class="horizLeft" v-if="index > 0 || el.e3.key"></div>
               <div class="horizRight"></div>
               <span class="bloc" :class="classes(4, e)">
                 <router-link :to="withParam('affectation', e.key)" :title="e.fullname">{{e.name}}</router-link>
                 <members :structure="e" :onlyRoles="el.e5.key" :query="query" v-if="e === el.e4 || displayAll"></members>
               <div v-if="e.subGroups && (displayAll || e === el.e4 && el.e5.key)">
                 <ul>
                   <li v-for="e in e.subGroups" :class="[ e === el.e5 ? 'selectedElt' : nonSelectedEltClass ]">
                       <div class="verticalTop"></div>
                       <div class="verticalBottom"></div>
                       <span class="bloc" :class="classes(5, e)">
                           <span :title="e.fullname">{{e.name}}</span>
                           <members :structure="e" :query="query" v-if="e === el.e5 || displayAll"></members>
                       </span>
                   </li>
                 </ul>
               </div>
               </span>
           </li>
         </ul>
        </div>
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
import { watch, watchEffect, ref, computed } from 'vue';

 function initTree(tree, depth, parent) {
     tree.members = undefined; // init for vuejs
     tree.depth = depth;
     tree.key = tree.key.replace(/^structures-/, '');
     tree.fullname = tree.name;
     tree.prio = tree.up1Flags?.[0]?.match(/^\{PRIO\}(.*)/)?.[1]
     tree.name = tree.name.replace(/^[\wÀ-ú. -]*?\s: /i, '')
     tree = WsService.group_roles_remove_supannListeRouge_and_handle_gender(tree);
     if (tree.key === 'PR' && parent && parent.roles.length === 0) {
       parent.top_role = tree.roles[0]
     }

     let max_depth = depth;
     (tree.subGroups || []).forEach(e => {
         e.parentKey = tree.key;
         initTree(e, depth+1, tree);
         max_depth = Math.max(max_depth, e.max_depth)
     });
     tree.max_depth = max_depth
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
    return r
}

function compute_eX_lX(e1, sel, { displayAll }) {
    const l2 = helpers.sortBy(e1.subGroups.filter(e => e.businessCategory !== "council"), ['prio', 'name'])
    const e2 = sel.shift() || {}
    const l2b = e2.subGroups?.find(e => e?.businessCategory === 'organization') && helpers.sortBy(e2.subGroups, ['prio', 'name'])
    const e2b = l2b && sel.shift() || {}
    let [ l3i, l3_ ] = helpers.partition((l2b ? e2b : e2).subGroups || [], e => e.up1Flags?.includes("included"))
    if (l3_.length === 0 && l3i.find(e => e.subGroups)) {
        // on a que des niveaux 3 à mettre au niveau 4, MAIS certains sont complexes, donc on met tout au niveau 3
        [ l3i, l3_ ] = [ [], l3i ]
    }
    const e3 = sel[0] && l3_.find(e => e.key === sel[0].key) && sel.shift() || {}
    const l3 = l3_.length && moveOneFirst(helpers.sortBy(l3_, ['fullname']), e3)
    const l3b_ = e3.max_depth >= 7 && e3.subGroups
    const e3b = l3b_ && sel.shift() || {}
    const l3b = l3b_ && moveOneFirst(helpers.sortBy(l3b_, ['fullname']), e3b)
    const [ e4, e5 ] = [...sel, {}, {}]
    const l4_ = (displayAll || e4.key) && (l3b ? e3b : e3).subGroups || !e3.key && l3i.length && l3i || []
    const l4 = l4_.length && helpers.sortBy(l4_, ['name'])
    return { e1, e2, l2, e2b, l2b, e3, l3, e3b, l3b, e4, l4, e5, l3i, l3_ }
}

export default {
   components: { MaybeRouterLink, MyIcon, members: OrgChartMembers },
   props: ['selected', 'query', 'displayAll'],
   setup(props) {
    const e1 = asyncComputed(() => withSubGroups({ name: "", key: 'UP1', depth: 1, businessCategory: "gold", roles: [] }))
    const el = computed(() => {
        if (!e1.value) return {}
        const sel = props.selected ? get_selectedList(e1.value, props.selected) : []
        return compute_eX_lX(e1.value, sel, props)
    })

    const magic_line_2to3 = ref(null)
    const secondPane_elt = ref(null)
    const set_magic_line_2to3_width = () => { 
        const elt = magic_line_2to3.value
        const other_elt = secondPane_elt.value
        if (elt && other_elt) {
            const deltaX = elt.getBoundingClientRect().right - other_elt.getBoundingClientRect().x
            console.log("set_magic_line_2to3_width", elt.getBoundingClientRect(), other_elt.getBoundingClientRect);
            elt.style.width = `${deltaX - 4}px`
        }
    }
    watchEffect(set_magic_line_2to3_width)
    window.addEventListener('resize', set_magic_line_2to3_width)

    const magic_line_2to4 = ref(null)
    const magic_line_2to4_right = ref(null)
    const empty4Top_elt = ref(null)
    const set_magic_line_2to4_width = () => { 
        const elt = magic_line_2to4.value
        const elt_right = magic_line_2to4_right.value
        const other_elt = empty4Top_elt.value
        if (elt && elt_right && other_elt) {
            const deltaX = elt.getBoundingClientRect().right - other_elt.getBoundingClientRect().right
            console.log("set_magic_line_2to4_width", elt.getBoundingClientRect(), other_elt.getBoundingClientRect, deltaX);
            if (deltaX > 0) {
                elt.style.width = `${deltaX}px`
                elt_right.style.opacity = 0
            } else {
                elt_right.style.width = `${-deltaX}px`
                elt.style.opacity = 0
            }
        }
    }
    watchEffect(set_magic_line_2to4_width)
    window.addEventListener('resize', set_magic_line_2to4_width)

    const root_elt = ref(null);
    watch(el, (e) => {
        if (e) {
          WsService.OrgChart.getMembers(props.query, e.key).then(l => e.members = l);
          setTimeout(() => {
            root_elt.value.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            set_magic_line_2to3_width()
            set_magic_line_2to4_width()
          }, 100);
        }
    })
    return {
     root_elt, magic_line_2to3, magic_line_2to4, magic_line_2to4_right, empty4Top_elt, secondPane_elt,
     el,
    ...toComputed({
     nonSelectedEltClass() { return props.displayAll ? '' : 'nonSelectedElt' },
     e3_index()  { return el.value.l3?.indexOf(el.value.e3) },
     e1_roles() { 
         let l = []
         for (const role of el.value?.e1.roles) {
             for (const name of role.supannRoleGenerique) {
                 l.push([role, name])
             }
         }
         const half = Math.floor(l.length / 2)
         return [ l.slice(0, half), l.slice(half) ]
     },
     display_secondary_bloc() { return el.value?.e3?.members?.length > 0 },
     no_secondary_bloc() { return el.value?.e3?.members?.length === 0 },
    }),
     classes(depth, e) {
       return ['bordered', 'depth' + depth, e.businessCategory, { leaf: !e.subGroups }];
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
