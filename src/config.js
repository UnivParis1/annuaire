const connected = !!location.pathname.match(/^\/ent\//);

export default {
    domain: 'univ-paris1.fr',
    public_pathname : '/',
    connected_pathname : '/ent/',
    wsgroupsURL: "https://wsgroups.univ-paris1.fr",
    modify_my_account_url: "https://ent.univ-paris1.fr/compte/",
    comptex_annuaire_url: (person) => `https://comptex.univ-paris1.fr/annuaire/reuse/?uid=${person.uid}`,
    connected,
    photoURL: (person) => "https://userphoto.univ-paris1.fr/" + (person.uid ? "?uid=" + person.uid + "&penpalAffiliation=loggedUser" : "img/forbidden-male.jpg"),

    usefulAffiliationsGrouped: ['teacher|researcher', 'staff', 'emeritus', 'student', 'alum' ],
    usefulAffiliations: ['teacher', 'researcher', 'staff', 'emeritus', 'student', 'alum' ],
    searchNoauthMaxResult: 5, // Résultat maximal à afficher si pasa uthentifié
    searchAuthMaxResult: 100, // Résultat maximal à afficher si authentifié

    slides: [
        /*{
            img: "static/images/slider/organigramme.png",
            html: `
            <h1>Organigramme</h1>
            Un organigramme interactif est disponible.
            Vous pouvez visualiser l'organigramme d'une composante, d'une structure administrative, d'un laboratoire de recherche, d'un service, ...
            Vous pouvez situer un personnel dans l'organigramme.`,
        },*/
        {
            img: "static/images/slider/acces-direct.png",
            html: `
            <h1>Accès direct à une fiche</h1>
            Chaque fiche de contact dispose d'une URL dédiée.
            Le lien d'accès direct est affiché en bas de la fiche de contact.`,
        },
        {
            img: "static/images/slider/recherche-multi-critere.png",
            html: `
            <h1>Recherche multi-critère</h1>
            Affinez votre recherche par un système combiné de filtres
            <br><i>(statut, structure, fonction, nom, diplôme, ...)</i>.`,
        },
        {
            img: "static/images/slider/structure.png",
            html: `
            <h1>Recherche d'une structure</h1>
            Saisissez les premières lettre d'un nom d'une structure.
            Une liste de structures s'affichent. Sélectionnez la structure recherchée.`,
        },
        {
            img: "static/images/slider/diplome.png",
            html: `
            <h1>Recherche d'étudiants d'un diplôme</h1>
            Saisissez les premières lettres d'un nom ou d'un code de diplôme.
            Une liste de diplômes s'affichent. Sélectionner le diplôme recherché pour afficher la liste des étudiants inscrits.`,
        },
    ],

    employeeTypes: [
        "Professeur émérite",

        "Professeur des universités",
        "Directeur de recherche",

        "Maitre de conférences",
        "Maître de conférences",
        "Chargé de recherche",

        "Professeur agrégé",

        "Professeur d'eps",
        "Professeur certifié",
        "Professeur des lycées professionnels",

        "Professeur invité",
        "Associé professeur mi-tps",
        "Chercheur associé",
        "Associé mcf mi-tps",
        "Associé mcf",

        "Contractuel chercheur lru",

        "Ater",
        "Ater mi-temps",

        "Doctorant epes/ep recherche sans enseignement",
        "Doctorant epes ou ep recherche",
        "Doctorant sous convention",
        "Hébergé doctorant sans recherche",

        "Chargé d'enseignement",
        "Hébergé iae - chargé d'enseignement vacataire ",

        "Hébergé administratif catégorie a",
        "Agent contractuel",
    ],

    activitesUP1: [
      "Assistant(e) de direction",
      "Accueil / Secrétariat",
      "Chargé(e) de mission",
      "Chef de projet",
      "Coordinateur(ice)",
      "Chargé(e) d'étude",
      "Gestionnaire administratif(ive)",
      "Gestionnaire de scolarité",
      "Gestionnaire de courrier",
      "Responsable d'UE",
      "Responsable de diplôme",
      "Responsable de formation",
      "Responsable de licence",
      "Responsable de master 1",
      "Responsable de master 2",
      "Responsable de thèse",
      "Conservateur(rice) de bibliothèque",
      "Bibliothécaire",
      "Assistant(e) de bibliothèque",
      "Magasinier de bibliothèque",
      "Responsable de la sécurité du système d'information",
      "Correspondant informatique et liberté",
      "Délégué à la protection des données",
    ],
};
