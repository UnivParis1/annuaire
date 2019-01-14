<template>
  <div class="members" v-if="members && members.length || roles.length">
    <span v-for="role in rolesGrouped">
      <div class="role">{{role.v}}&nbsp;: </div>
      <div class="user-with-role" v-for="u in role.group">
        <maybe-router-link :to="withUser(u)">{{u.displayName}}</maybe-router-link>
        <br>
      </div>
    </span>
    <span v-if="members && members.length">
      <br v-if="roles.length">
      <div class="members_other">
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
    </span>
  </div>
</template>

<script>
import * as WsService from '../WsService';
import * as sortUsers from '../sortUsers';
import helpers from '../helpers';
import config from '../config';
import Photo from './Photo';


export default {
    props: ['structure', 'onlyRoles', 'query'],
    components: { Photo },
    computed: {
        affectation() {
          return !this.onlyRoles && this.structure.key;
        },
        roles() {
          return this.structure.roles;
        },
        rolesGrouped() {
            return helpers.sortedGroupBy(this.roles, u => u.supannRoleGenerique.join(", "));
        },
        affiliations() {
            return ['other', ...config.usefulAffiliationsGrouped ].reverse();
        },
        membersByAffiliation() {
            if (!this.members) return;

            let r = this.members;

            // remove dups
            const toIgnore = this.roles.map(e => e.uid);
            r = r.filter(person => !toIgnore.includes(person.uid));

            const isPedagogy = sortUsers.isPedagogy(this.structure);

            r = r.map(person => {
                // compute simplifiedAffiliation
                let aff = person.eduPersonPrimaryAffiliation;
                aff = aff === "teacher" || aff === "researcher" ? "teacher|researcher" : aff;
                person.simplifiedAffiliation = isPedagogy && helpers.includes(this.affiliations, aff) ? aff : "other";

                return { ...person, ... sortUsers.descrAndWeight(person, isPedagogy, this.affectation) };
            });

            // full ordering
            r = helpers.sortBy(r, [ 'simplifiedAffiliation', 'weight' ]);
            r = helpers.sortedGroupByFields(r, [ 'simplifiedAffiliation', 'simplifiedDescription' ], ['displayName']);

            return r;
        }
    },
    asyncComputed: {
      members() {
          return WsService.OrgChart.getMembers(this.query, this.affectation);
      },
    },
    methods: {
        translateAff(aff, plural) {
           return "STATUS_" + aff + (plural > 1 ? "s" : "");
        },
    },
};
</script>
