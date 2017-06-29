import config from './config';

export default {
  methods: {
    withUser(id) {
        id = id.replace(new RegExp("\\.?" + config.domain + "$"), '');
        let query = this.$route.query.connected ? { connected: 1 } : {};
        return { path: "/" + id, query };
    },
    withParam(name, value) {
        let query = {...this.$route.query}

        // we can't have both
        if (name === "diploma") delete query.affectation;
        if (name === "affectation") delete query.diploma;

        if (value) {
            query[name] = value;
        } else {
            delete query[name];
        }
        return { path: "/", query };
    },
  },
}
