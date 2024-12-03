<!-- src/views/Register.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { registerUser } from '../firebase/auth';

const router = useRouter();
const name = ref('');
const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const handleRegister = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    console.log('Iniciando registro...'); // Debug
    
    if (password.value.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const user = await registerUser(
      email.value,
      password.value,
      name.value
    );
    
    console.log('Registro exitoso:', user); // Debug
    
    // Mostrar alerta de éxito
    alert(`¡Bienvenido ${name.value}! Tu cuenta ha sido creada exitosamente.`);
    
    // Redirigir al perfil
    await router.push('/profile');
    
  } catch (err) {
    console.error('Error en registro:', err); // Debug
    error.value = err.message || 'Error al registrar usuario';
    alert(error.value); // Mostrar error en alerta
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="container mx-auto px-4 py-8 max-w-md">
    <h1 class="text-3xl font-bold mb-8 text-center">Crear Cuenta</h1>
    
    <form @submit.prevent="handleRegister" class="space-y-6">
      <div>
        <label for="name" class="block mb-2">Nombre</label>
        <input 
          type="text" 
          id="name"
          v-model="name"
          required
          class="w-full p-2 border rounded-lg"
        >
      </div>

      <div>
        <label for="email" class="block mb-2">Email</label>
        <input 
          type="email" 
          id="email"
          v-model="email"
          required
          class="w-full p-2 border rounded-lg"
        >
      </div>
      
      <div>
        <label for="password" class="block mb-2">Contraseña</label>
        <input 
          type="password" 
          id="password"
          v-model="password"
          required
          minlength="6"
          class="w-full p-2 border rounded-lg"
        >
      </div>

      <!-- Mensaje de error más visible -->
      <div 
        v-if="error" 
        class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
      >
        {{ error }}
      </div>

      <button 
        type="submit"
        class="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
        :disabled="loading"
      >
        {{ loading ? 'Registrando...' : 'Registrarse' }}
      </button>
    </form>

    <p class="mt-4 text-center">
      ¿Ya tienes cuenta?
      <router-link to="/login" class="text-blue-500 hover:underline">
        Inicia sesión aquí
      </router-link>
    </p>
  </main>
</template>