<template>
  <div class="members" :class="{ withSeparator: !noSeparator }" v-if="members && members.length || roles.length">
    <span v-for="role in rolesGrouped">
      <div class="role">{{role.v}}&nbsp;: </div>
      <div class="user-with-role" v-for="u in role.group">
        <maybe-router-link :to="withUser(u)">{{u.displayName}}</maybe-router-link>
        <br>
      </div>
    </span>
    <span v-if="members && members.length">
      <br v-if="roles.length">
      <div class="members_other" :class="{many_members: !show_many_members && many_members}">
        <span v-for="byAff in membersByAffiliation">
          <span class="affiliationName" v-if="membersByAffiliation.length > 1">{{t(translateAff(byAff.v, byAff.group.length))}}<br></span>
            <div v-for="byDescr in byAff.group" class="description">
              <div class="user-description">{{byDescr.v}}</div>
              <span v-for="u in byDescr.group" :title="u.info" class="user-no-role">
                <maybe-router-link :to="withUser(u)">{{u.displayName}}</maybe-router-link><br>
              </span>
            </div>
           <br>
        </span>
      </div>
      <div class="show_hide_more_members" v-if="many_members" @click="show_many_members = !show_many_members">{{show_many_members ? 'Voir moins' : 'Voir plus'}}</div>
    </span>
  </div>
</template>

<script>
import * as WsService from '../WsService';
import * as sortUsers from '../sortUsers';
import { MaybeRouterLink, asyncComputed, toComputed } from '../directives';
import helpers from '../helpers';
import config from '../config';
import { ref, computed } from 'vue';


export default {
    props: ['structure', 'onlyRoles', 'query', 'noSeparator'],
    components: { MaybeRouterLink },
    setup(props) {
      const affectation = computed(() => (
          !props.onlyRoles && props.structure.key
      ))
      const affectation_and_related = computed(() => (
          affectation.value ? WsService.getAllSubStructures(props.structure) : {}
      ))
      const roles = computed(() => (
        props.structure.roles
      ))
      const members = asyncComputed(() => (
          WsService.OrgChart.getMembers(props.query, affectation.value)
      ))
      const affiliations = ['other', ...config.usefulAffiliationsGrouped ].reverse();
      const show_many_members = ref(false)

      return {
        members, roles, show_many_members,
       ...toComputed({
        rolesGrouped() {
            return sortUsers.rolesGrouped(roles.value);
        },
        many_members() {
            return members.value?.length > 30
        },
        membersByAffiliation() {
            if (!members.value) return;

            let r = members.value;

            // remove dups
            const toIgnore = roles.value.map(e => e.uid);
            r = r.filter(person => !toIgnore.includes(person.uid));

            const isPedagogy = sortUsers.isPedagogy(props.structure);

            r = r.map(person => {
                // compute simplifiedAffiliation
                let aff = person.eduPersonPrimaryAffiliation;
                aff = aff === "teacher" || aff === "researcher" ? "teacher|researcher" : aff;
                person.simplifiedAffiliation = isPedagogy && helpers.includes(affiliations, aff) ? aff : "other";

                return { ...person, ... sortUsers.descrAndWeight(person, isPedagogy, affectation.value, affectation_and_related.value) };
            });

            // full ordering
            r = helpers.sortBy(r, [ 'simplifiedAffiliation', 'weight', 'simplifiedDescription', 'simplifiedDescription_gender' ]);
            r = helpers.sortedGroupByFields(r, [ 'simplifiedAffiliation', 'simplifiedDescription', 'simplifiedDescription_gender' ], ['displayName']);

            // re-group simplifiedDescription/simplifiedDescription_gender: use "simplifiedDescription_gender" if it is the only one in "simplifiedDescription"
            for (const byAff of r) {
                for (const byGender of byAff.group) {
                    if  (byGender.group.length === 1 && byGender.group[0].v) {
                        byGender.v = byGender.group[0].v
                    }
                    byGender.group = helpers.sortBy([].concat(...byGender.group.map(byDescr => byDescr.group)), ['displayName'])
                }
            }

            return r;
        }
       }),
        translateAff(aff, plural) {
           return "STATUS_" + aff + (plural > 1 ? "s" : "");
        },
      }
    },
};
</script>
