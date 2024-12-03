// src/stores/useUser.js
import { ref } from 'vue'
import { auth } from '../firebase/config'
import { onAuthStateChanged } from 'firebase/auth'

// Estado global del usuario
const currentUser = ref(null)
const isAuthenticated = ref(false)
const isLoading = ref(true)

// Inicializar el listener de autenticación
onAuthStateChanged(auth, (user) => {
  currentUser.value = user
  isAuthenticated.value = !!user
  isLoading.value = false
})

export function useUser() {
  return {
    user: currentUser,
    isAuthenticated,
    isLoading
  }
}