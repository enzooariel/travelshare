<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { auth } from './firebase/config'
import { signOut } from 'firebase/auth'

const router = useRouter()
const route = useRoute()
const user = ref(null)

// Computar la ruta activa
const currentRoute = computed(() => route.path)

onMounted(() => {
  auth.onAuthStateChanged((currentUser) => {
    user.value = currentUser
  })
})

const handleLogout = async () => {
  try {
    await signOut(auth)
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navbar con sombra más suave y mejor contraste -->
    <nav class="bg-white shadow-md border-b border-gray-100 sticky top-0 z-50">
      <div class="container mx-auto px-4 py-4">
        <div class="flex justify-between items-center">
          <!-- Logo con mejor estilo -->
          <router-link 
            to="/" 
            class="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200"
          >
            TravelShare
          </router-link>
          
          <div class="flex items-center space-x-8">
            <!-- Enlaces públicos -->
            <router-link 
              to="/posts"
              class="relative group"
              :class="[
                currentRoute === '/posts' 
                  ? 'text-blue-600 font-semibold' 
                  : 'text-gray-600 hover:text-blue-600'
              ]"
            >
              Explorar
              <!-- Indicador de página activa -->
              <div 
                class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                :class="{ 'scale-x-100': currentRoute === '/posts' }"
              ></div>
            </router-link>

            <!-- Enlaces para usuarios autenticados -->
            <template v-if="user">
              <router-link 
                to="/create-post"
                class="relative group"
                :class="[
                  currentRoute === '/create-post' 
                    ? 'text-blue-600 font-semibold' 
                    : 'text-gray-600 hover:text-blue-600'
                ]"
              >
                Crear Post
                <div 
                  class="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-200"
                  :class="{ 'scale-x-100': currentRoute === '/create-post' }"
                ></div>
              </router-link>
              
              <div class="flex items-center space-x-6">
                <router-link 
                  to="/profile"
                  class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                  :class="{ 'ring-2 ring-blue-400 ring-offset-2': currentRoute === '/profile' }"
                >
                  Mi Perfil
                </router-link>
                
                <button 
                  @click="handleLogout"
                  class="text-red-500 hover:text-red-600 hover:underline transition-colors duration-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            </template>

            <!-- Enlaces para usuarios no autenticados -->
            <template v-else>
              <router-link 
                to="/login"
                class="text-gray-600 hover:text-blue-600 transition-colors duration-200"
                :class="{ 'text-blue-600 font-semibold': currentRoute === '/login' }"
              >
                Iniciar Sesión
              </router-link>
              <router-link 
                to="/register"
                class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 shadow-md hover:shadow-lg"
                :class="{ 'ring-2 ring-blue-400 ring-offset-2': currentRoute === '/register' }"
              >
                Registrarse
              </router-link>
            </template>
          </div>
        </div>
      </div>
    </nav>

    <router-view></router-view>
  </div>
</template>

<style>
/* Estilos adicionales para animaciones suaves */
.router-link-active {
  position: relative;
}

/* Transiciones para hover y estados activos */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
}
</style>