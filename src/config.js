export default {
    domain: 'univ-paris1.fr',
    wsgroupsURL: "https://wsgroups.univ-paris1.fr",
    photoURL: (person) => "https://userphoto.univ-paris1.fr/?uid=" + person.uid + "&penpalAffiliation=loggedUser",

    usefulAffiliations: ['teacher_researcher', 'staff', 'emeritus', 'student', 'alum' ],
    searchNoauthMaxResult: 5, // Résultat maximal à afficher si pasa uthentifié
    searchAuthMaxResult: 100, // Résultat maximal à afficher si authentifié
};