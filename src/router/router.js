// src/router/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import CreatePost from '../views/CreatePost.vue'
import Posts from '../views/Posts.vue' // Nueva vista

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { 
      path: '/', 
      component: Home 
    },
    {
      path: '/posts',  // Nueva ruta
      component: Posts
    },
    { 
      path: '/login', 
      component: Login 
    },
    { 
      path: '/register', 
      component: Register 
    },
    { 
      path: '/profile', 
      component: Profile,
      meta: { requiresAuth: true }
    },
    { 
      path: '/create-post', 
      component: CreatePost,
      meta: { requiresAuth: true }
    }
  ]
})

export default router