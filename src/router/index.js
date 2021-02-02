import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import Users from '../components/Users.vue'
import User from '../components/User.vue'
import config from '../config'

export default createRouter({
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
  history: process.env.NODE_ENV === 'production' ? createWebHistory(config.connected ? config.connected_pathname : config.public_pathname) : createWebHashHistory()
})
