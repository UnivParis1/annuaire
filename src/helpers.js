/* similar to https://lodash.com/docs/#sortBy , but limited : not a stable sort, nor function param, only strings comparison */
function sortBy(array, fields) {
    let r = [...array];
    const compareStrings = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
    r.sort((a, b) => {
      for (let field of fields) {
        const c = compareStrings(a[field] || '', b[field] || '');
        if (c !== 0) return c;
      }
      return 0;
    });
    return r;
}


/* keeps the ordering, but relies on pre-ordering on the criteria */
function sortedGroupBy(l, by) {
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

function sortedGroupByFields(l, fields, fieldsToSortLeaves = undefined) {
  if (fields.length === 0) {
    return fieldsToSortLeaves ? sortBy(l, fieldsToSortLeaves) : l;
  }
  const [field, ...otherFields] = fields;
  let r = sortedGroupBy(l, elt => elt[field]);
  r.forEach(subr => subr.group = sortedGroupByFields(subr.group, otherFields, fieldsToSortLeaves));
  return r;
}

export default {
  sortBy,
  sortedGroupBy,
  sortedGroupByFields,

  /* cf https://lodash.com/docs/#partition */
  partition(collection, predicate) {
    let matches = [];
    let no_matches = [];
    for (let elt of collection) {
      (predicate(elt) ? matches : no_matches).push(elt);
    }
    return [ matches, no_matches ];
  },

  /* cf https://lodash.com/docs/#intersection */
  intersection(coll1, coll2) {
    let obj2 = {};
    for (let elt of coll2) obj2[elt] = 1;
    return coll1.filter(elt => elt in obj2);
  },

  /* cf https://lodash.com/docs/#includes */
  includes(collection, value) {
    for (let elt of collection) {
      if (elt === value) return true;
    }
    return false;
  },

  /* cf https://lodash.com/docs/#map */
  map(collection, f) {
    if (Array.isArray(collection)) {
      let r = [];
      let i = 0;
      for (let elt of collection) r.push(f(elt, i++));
      return r;
    } else {
      let r = {};
      for (let i in collection) r[i] = f(collection[i], i);
      return r;
    }
  },

  pmap(collection, f) {
    return Promise.all(collection.map(f))
  },

  uniqBy(l, by) {
    let seen = {}
    let r = []
    for (const e of l) {
      const key = by(e)
      if (!(key in seen)) {
        seen[key] = true
        r.push(e)
      }
    }
    return r
  },

  shuffle(...array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  },

  minString(collection) {
    let r = null;
    for (let elt of collection) {
      if (r === null || elt < r) r = elt;
    }
    return r;
  },

  startsWith(s, sub) {
    return s.substr(0, sub.length) === sub;
  },

  lowerCaseFirstLetter(s) {
    return s.charAt(0).toLowerCase() + s.slice(1);
  },

  array_set(arr, arr2) {
    arr.splice(0, arr.length, ...arr2);
  },

  /* cf https://lodash.com/docs/#groupBy */
  /*groupBy(l, by) {
    let r = {};
    for (let e of l) {
        let v = by(e);
        if (!(v in r)) {
            r[v] = [];
        }
        r[v].push(e);
    }
    return r;
  },*/

  guess_affectation_gender(name) {
    let short = name;
    {
      let m = name.match(/^(\S+) : (.*)/);
      if (m) [, short, name] = m;
    }
    if (name.match(/^(Service|Département|Groupement|Institut) /)) {
      return 'M';
    } else if (name.match(/^(Direction|[EÉ]cole|Université|Unité|Présidence|Agence)/)) {
      return 'F';
    }
    if (short.match(/^UFR/)) {
      return 'F';
    }
    return 'M';
  },
}

