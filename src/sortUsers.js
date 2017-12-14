import helpers from './helpers';
import config from './config';

function array_to_map2index(array) {
  let r = {};
  array.forEach((e, i) => r[e] = i);
  return r;
}

const employeeType2index = array_to_map2index(config.employeeTypes);
const activitesUP1_to_index = array_to_map2index(config.activitesUP1);

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

export function descrAndWeight(person, isPedagogy) {
    let weight;

    const roles = person['supannRoleEntite-all'];
    if (roles) {
      const weight_ = helpers.minString(roles.map(r => r.role_weight).filter(w => w));
      if (weight_) weight = "0_" + weight_;
    }

    if (person.description) {
      const weight_ = Math.min(... person.description.map(e => activitesUP1_to_index[e] || 9999));
      // keep it only if it is listed in config.activitesUP1
      if (weight_ !== 9999) return {
        simplifiedDescription: person.description.join(', '),
        weight: weight || ("2_" + number2fixedString(weight_)),
      };
    }
    if (person['supannActivite-all']) {
      const descr = person['supannActivite-all'].filter(activite => isPedagogy || !activite.key.match(/^\{CNU\}/)).map(activite => activite.name).join(', ')
      if (descr) return {
        simplifiedDescription: descr,
        weight: weight || ("3_" + helpers.minString(person['supannActivite-all'].map(activite => activite.key))),
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
