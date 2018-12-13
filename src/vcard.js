const isASCII = string => /^[\x00-\x7F]*$/.test(string);

const _e = (value) => (
    (value ? '' + value : '').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')
);

const e = (value) => (
    Array.isArray(value) ? value.map(_e) : _e(value)
);

function _format(vals) {
    var formattedVCardString = '';
    for (const key of Object.keys(vals)) {
        var v = vals[key]
        if (!v) continue;
        if (!Array.isArray(v)) v = [v];

        const key_ = key.replace(/_/, ';TYPE=');
        v.forEach(function (v) {
            const encodingPrefix = isASCII(v) ? '' : ';CHARSET=UTF-8';
            formattedVCardString += key_ + encodingPrefix + ':' + v + '\r\n';
        });
    }
    return formattedVCardString;

}

function formatPostalAddress(s) {
    if (!s) return '';
    const [l1, l2, ...rest] = s.split("\n");
    const m = l2.match(/^(\d{5}) (.*)/);
    const middle = m ? [ m[2], '', m[1]] : [ l2 ]
    return ['', '', l1, ...middle, ...rest].map(e).join(';');
}

export function format(person, that) {
    let vals = {
        BEGIN: 'VCARD',
        VERSION: '3.0',
        //REV: (new Date()).toISOString(),
        FN: e(person.displayName),
        N: e(person.sn) + ';' + e(person.givenName) + ';;;',
        'TEL_WORK,VOICE': e(person.telephoneNumber),
        'TEL_WORK,FAX': e(person.facsimileTelephoneNumber),
        'EMAIL_WORK,INTERNET': e(person.mail),
        'ADR_WORK': formatPostalAddress(person.postalAddress), // no LABEL otherwise Android displays address twice
        'ORG': 'Université Paris Panthéon-Sorbonne',
        'TITLE': e((person['supannActivite-all'] || []).map(e => e.name)),
        'ROLE': e(person.info),
        'URL': person.labeledURI || that.publicHref(that.withUser(person, {})),
    };
    vals.END = 'VCARD';

    return _format(vals);
}
