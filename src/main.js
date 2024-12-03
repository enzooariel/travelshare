// src/main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router/router' // Asegúrate que la ruta sea correcta
import './index.css' // Para Tailwind

// Importar la configuración de Firebase
import { auth } from './firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

// Crear la aplicación Vue
const app = createApp(App)

// Esperar a que Firebase verifique el estado de autenticación antes de montar la app
let appMounted = false

onAuthStateChanged(auth, (user) => {
  if (!appMounted) {
    // Guardar el estado del usuario en una variable global
    app.config.globalProperties.$user = user
    
    // Usar el router
    app.use(router)
    
    // Montar la aplicación
    app.mount('#app')
    
    appMounted = true
  } else {
    // Actualizar el estado del usuario cuando cambie
    app.config.globalProperties.$user = user
  }
})