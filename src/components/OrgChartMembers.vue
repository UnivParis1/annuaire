<template>
  <div class="members" v-if="members && members.length || roles.length">
    <span v-for="role in rolesGrouped">
      <div class="role">{{role.v}}&nbsp;: </div>
      <div class="user-with-role" v-for="u in role.group">
        <Photo :user="u"></Photo>
        <router-link :to="withUser(u.uid)">{{u.displayName}}</router-link>
        <br>
      </div>
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
  </div>
</template>

<script>
import * as WsService from '../WsService';
import config from '../config';
import Photo from './Photo';


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

export default {
    props: ['affectation', 'roles', 'query'],
    components: { Photo },
    computed: {
        rolesGrouped() {
            return groupBy(this.roles, u => u.supannRoleGenerique.join(", "));
        },
        affiliations() {
            return ['other', ...config.usefulAffiliations ].reverse();
        },
        membersByAffiliation() {
            if (!this.members) return;

            this.members.sort((a,b) => a.displayName < b.displayName ? -1 : 1);
            let toIgnore = this.roles.map(e => e.uid);

            let r = {};
            this.affiliations.forEach(aff => r[aff] = []);

            for (let person of this.members) {
                if (!toIgnore.includes(person.uid)) {
                    let aff = person.eduPersonPrimaryAffiliation;
                    aff = aff === "teacher" || aff === "researcher" ? "teacher_researcher" : aff;
                    r[aff in r ? aff : "other"].push(person);
                }
            }
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
