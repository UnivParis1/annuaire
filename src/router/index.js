import Vue from 'vue'
import Router from 'vue-router'
import Users from '@/components/Users'
import User from '../components/User'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/Show/:userId', 
      component: User, 
      props: (route) => ({ userId: route.params.userId, connected: route.query.connected }),
    },
    { path: '/', 
      component: Users,
      props: (route) => ({ query: route.query }),
    },   
  ]
})
