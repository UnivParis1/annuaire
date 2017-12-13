import Vue from 'vue'
import Router from 'vue-router'
import Users from '@/components/Users'
import User from '../components/User'
import config from '../config'

Vue.use(Router)

const opts = {
  routes: [
    { path: '/:userId',
      component: User,
      props: (route) => ({ userId: route.params.userId, format: route.query.format }),
    },
    { path: '/',
      component: Users,
      props: (route) => ({ query: route.query }),
    },
  ],
};

if (process.env.NODE_ENV === 'production') {
  opts.mode = 'history';
  opts.base = config.connected ? config.connected_pathname : config.public_pathname;
}

export default new Router(opts)
