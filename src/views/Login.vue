<!-- src/views/Login.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    error.value = '';

    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;
    
    alert(`¡Bienvenido de nuevo, ${user.displayName || 'Usuario'}!`);
    router.push('/posts');
    
  } catch (err) {
    let errorMessage;
    switch (err.code) {
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      default:
        errorMessage = 'Error al iniciar sesión';
    }
    error.value = errorMessage;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="container mx-auto px-4 py-8 max-w-md">
    <div class="bg-white rounded-lg shadow-md p-8">
      <h1 class="text-3xl font-bold mb-6 text-center">Iniciar Sesión</h1>
      
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div>
          <label for="email" class="block mb-2 text-sm font-medium text-gray-700">Email</label>
          <input 
            type="email" 
            id="email"
            v-model="email"
            required
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="ejemplo@correo.com"
          >
        </div>
        
        <div>
          <label for="password" class="block mb-2 text-sm font-medium text-gray-700">Contraseña</label>
          <input 
            type="password" 
            id="password"
            v-model="password"
            required
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Ingresa tu contraseña"
          >
        </div>

        <div 
          v-if="error" 
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <button 
          type="submit"
          class="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
          :disabled="loading"
        >
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>
      </form>

      <p class="mt-4 text-center text-gray-600">
        ¿No tienes cuenta?
        <router-link to="/register" class="text-blue-500 hover:underline">
          Regístrate aquí
        </router-link>
      </p>
    </div>
  </main>
</template>