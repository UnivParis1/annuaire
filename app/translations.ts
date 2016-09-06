function initTranslations($translateProvider) {
    $translateProvider.translations('fr', {
        APPROVALS_SEARCH: "Lancer la recherche",
        LABEL_CRIT_NAME: "Nom",
        LABEL_CRIT_STATUS: "Statut",
        STATUS_TEACHER: "Enseignant",
        STATUS_RESEARCHER: "Chercheur",
        STATUS_STAFF: "Personnel administratif / technique / de bibliothèque",
        STATUS_EMERITUS: "Professeur émérite",
        STATUS_STUDENT:"Étudiant",
        STATUS_ALUM:"Ancien étudiant",
        STATUS_ALL:"Tous"
    });
    $translateProvider.preferredLanguage('fr');
}
