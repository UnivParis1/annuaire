import helpers from './helpers';
import config from './config';

function array_to_map2index(array) {
  let r = {};
  array.forEach((e, i) => r[e] = i);
  return r;
}

const employeeType2index = array_to_map2index(config.employeeTypes);

function number2fixedString(n) {
    const s = "" + n;
    return ("0000" + s).substring(s.length);
}

export const isPedagogy = ({ businessCategory }) => (
  helpers.includes(["pedagogy", "research" ], businessCategory)
);

export const isPedagogyAffectation = (person) => (
    !!(person["supannEntiteAffectation-all"] || []).find(isPedagogy)
);

export const isActiviteUP1 = (activite) => (
  activite.key.match(/^\{UAI:0751717J:ACT\}/)
);

export const activitesByCategory = (person, no_emplois_if_role) => {
    let activites = person['supannActivite-all'] || []
    const referens = activites.filter(activite => activite.key.match(/^\{REFERENS\}/)) // useful for sorting users
    const rifseep = activites.filter(activite => activite.key.match(/^\{UAI:0751717J:RIFSEEP\}/))
    const cnu = activites.filter(activite => activite.key.match(/^\{CNU\}/))
    const up1 = activites.filter(isActiviteUP1)
    const various = [
        ...cnu,
        ...(person['supannRoleEntite-all'] && no_emplois_if_role ? [] : rifseep),
    ]
    return { up1, referens, rifseep, cnu, various }

}

export function descrAndWeight(person, isPedagogy, affectation, affectation_and_related) {
    let weight;

    let roles = person['supannRoleEntite-all'];
    if (roles) {
      if (affectation_and_related) roles = roles.filter(r => r.structure.key in affectation_and_related);
      weight = helpers.minString(roles.map(r => (
        r.role_weight ?
          (r.structure.key === affectation ? "0" : "1") + "_" + r.role_weight + "_" + r.structure.level :
          ''
      )))
    }

    if (person['supannActivite-all']) {
      const cats = activitesByCategory(person, false)
      const cats_for_name = [ ...(isPedagogy ? cats.cnu : []), ...cats.rifseep, ...cats.up1 ]
      const descr = cats_for_name.map(activite => activite.name).join(', ')
      const descr_gender = cats_for_name.map(activite => activite['name-gender'] || activite.name).join(', ')
      if (descr) return {
        simplifiedDescription: descr,
        simplifiedDescription_gender: descr_gender,
        weight: weight || ("3_" + helpers.minString([
            ...cats.up1.map(activite => '0_' + activite.key),
            ...cats.referens.map(activite => '1_' + activite.key),
            ...cats.various.map(activite => '2_' + activite.key),
        ])),
      };
    }
    if (person.employeeType) {
      const weight_ = Math.min(... person.employeeType.map(e => employeeType2index[e] || 9999));
      if (!weight) weight = "4_" + number2fixedString(weight_);

      // hiding employeeType of teachers/researchers in administration
      if (isPedagogy) return {
        simplifiedDescription: person.employeeType.join(', '),
        weight,
      };
    }
    return { weight: weight || "5_" };
}

export function sortRoles(person) {
  let roles = person['supannRoleEntite-all'];
  if (roles) {
    helpers.array_set(roles, helpers.sortBy(roles, ['role_weight']));
  }
  return person;
}

export function rolesGrouped(roles) {
    // NB: wsgroups gives roles sorted by role weight + uid
    // we want to group + sort by displayName
    return helpers.sortedGroupByDeep(roles || [], [ u => u.supannRoleGenerique.join(", ") ], ['displayName']);
}