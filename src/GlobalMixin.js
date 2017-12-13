import config from './config';

export default {
  computed: {
    connected_uid() {
      return window.prolongation_ENT && window.prolongation_ENT.DATA && window.prolongation_ENT.DATA.user;
    },
  },
  methods: {
    routerResolveFullHref(location, wantPublic) {
        const a = document.createElement('a');
        a.href = this.$router.resolve(location).href;
        const pathname = a.pathname.replace(
          config.connected ? config.connected_pathname : config.public_pathname,
          wantPublic ? config.public_pathname : config.connected_pathname);
        return a.protocol + "//" + a.host + pathname + a.search + a.hash;
    },
    connectedHref(location) {
        return this.routerResolveFullHref(location, false);
    },
    publicHref(location) {
        return this.routerResolveFullHref(location, true);
    },
    withUser(user, query) {
        let id = user.mail;
        if (!id) {
            return;
        }
        id = id.replace(new RegExp("\\.?" + config.domain + "$"), '');
        if (!query) query = {};
        return { path: "/" + id, query };
    },
    withParam(name, value) {
        return this.withParams({ [name]: value });
    },
    withParams(params) {
        let query = {...this.$route.query}
        let path = this.$route.path;

        for (let name in params) {
            let value = params[name];
            
            // we can't have both
            if (name === "affectation" || name === "diploma") {
                delete query.affectation;
                delete query.diploma;
            }
            if (name !== 'format') {
                path = "/";
            }

            if (value) {
                query[name] = value;
            } else {
                delete query[name];
            }
        }
        return { path, query };
    },
  },
}
