<!-- src/views/Login.vue -->
<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const touched = ref({ email: false, password: false });

// Validaciones
const validations = computed(() => ({
  email: {
    valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value),
    message: email.value ? 'El formato del email no es válido' : 'El email es requerido'
  },
  password: {
    valid: password.value.length >= 6,
    message: password.value ? 'La contraseña debe tener al menos 6 caracteres' : 'La contraseña es requerida'
  }
}));

const isFormValid = computed(() => {
  return validations.value.email.valid && validations.value.password.valid;
});

const handleBlur = (field) => {
  touched.value[field] = true;
};

const handleLogin = async () => {
  if (!isFormValid.value) {
    // Marcar todos los campos como tocados para mostrar errores
    touched.value.email = true;
    touched.value.password = true;
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;
    
    alert(`¡Bienvenido de nuevo, ${user.displayName || 'Usuario'}!`);
    router.push('/profile');
    
  } catch (err) {
    let errorMessage;
    switch (err.code) {
      case 'auth/invalid-email':
        errorMessage = 'El email no es válido';
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
    <h1 class="text-3xl font-bold mb-8 text-center">Iniciar Sesión</h1>
    
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label for="email" class="block mb-2">Email</label>
        <input 
          type="email" 
          id="email"
          v-model="email"
          @blur="handleBlur('email')"
          required
          placeholder="ejemplo@correo.com"
          class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{
            'border-red-500': touched.email && !validations.email.valid,
            'border-gray-300': !touched.email || validations.email.valid
          }"
          :disabled="loading"
        >
        <p 
          v-if="touched.email && !validations.email.valid" 
          class="mt-1 text-sm text-red-500"
        >
          {{ validations.email.message }}
        </p>
      </div>
      
      <div>
        <label for="password" class="block mb-2">Contraseña</label>
        <input 
          type="password" 
          id="password"
          v-model="password"
          @blur="handleBlur('password')"
          required
          placeholder="Mínimo 6 caracteres"
          class="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          :class="{
            'border-red-500': touched.password && !validations.password.valid,
            'border-gray-300': !touched.password || validations.password.valid
          }"
          :disabled="loading"
        >
        <p 
          v-if="touched.password && !validations.password.valid" 
          class="mt-1 text-sm text-red-500"
        >
          {{ validations.password.message }}
        </p>
      </div>

      <!-- Error general -->
      <div 
        v-if="error" 
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
      >
        {{ error }}
      </div>

      <button 
        type="submit"
        class="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        :class="{ 'opacity-50 cursor-not-allowed': loading }"
        :disabled="loading"
      >
        {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
      </button>
    </form>

    <p class="mt-4 text-center">
      ¿No tienes cuenta?
      <router-link to="/register" class="text-blue-500 hover:underline">
        Regístrate aquí
      </router-link>
    </p>
  </main>
</template>