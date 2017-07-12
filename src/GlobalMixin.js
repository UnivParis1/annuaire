import config from './config';

export default {
  methods: {
    withUser(id) {
        id = id.replace(new RegExp("\\.?" + config.domain + "$"), '');
        let query = this.$route.query.connected ? { connected: 1 } : {};
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
