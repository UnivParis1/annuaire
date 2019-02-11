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

export function descrAndWeight(person, isPedagogy, affectation_and_sub) {
    let weight;

    let roles = person['supannRoleEntite-all'];
    if (roles) {
      if (affectation_and_sub) roles = roles.filter(r => r.structure.key in affectation_and_sub);
      const weight_ = helpers.minString(roles.map(r => r.role_weight).filter(w => w));
      if (weight_) weight = "0_" + weight_;
    }

    if (person['supannActivite-all']) {
      const descr = person['supannActivite-all'].filter(activite => isPedagogy || !activite.key.match(/^\{CNU\}/)).map(activite => activite.name).join(', ')
      if (descr) return {
        simplifiedDescription: descr,
        weight: weight || ("3_" + helpers.minString(person['supannActivite-all'].map(activite => (isActiviteUP1(activite) ? '0_' : '1_') + activite.key))),
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
