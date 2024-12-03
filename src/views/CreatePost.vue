<!-- src/views/CreatePost.vue -->
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

const router = useRouter();
const content = ref('');
const imageUrl = ref('');
const location = ref('');
const loading = ref(false);
const error = ref('');

const createPost = async () => {
  try {
    if (!content.value.trim()) {
      throw new Error('El contenido es requerido');
    }

    loading.value = true;
    const user = auth.currentUser;

    if (!user) {
      router.push('/login');
      return;
    }
    
    // Crear el post en Firestore
    const postData = {
      userId: user.uid,
      userName: user.displayName,
      content: content.value.trim(),
      imageUrl: imageUrl.value.trim(), // Aquí debe guardarse la URL de la imagen
      location: location.value.trim(),
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };

    await addDoc(collection(db, 'posts'), postData);

    alert('¡Publicación creada exitosamente!');
    router.push('/profile');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

</script>

<template>
  <main class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold mb-6">Crear Nueva Publicación</h1>

      <form @submit.prevent="createPost" class="space-y-6">
        <!-- Contenido -->
        <div>
          <label for="content" class="block text-sm font-medium text-gray-700 mb-2">
            Contenido*
          </label>
          <textarea
            id="content"
            v-model="content"
            rows="4"
            required
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Comparte tu experiencia de viaje..."
          ></textarea>
        </div>

        <!-- URL de Imagen -->
        <div>
          <label for="imageUrl" class="block text-sm font-medium text-gray-700 mb-2">
            URL de Imagen
          </label>
          <input
            type="url"
            id="imageUrl"
            v-model="imageUrl"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="https://ejemplo.com/imagen.jpg"
          >
          <!-- Preview de imagen -->
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Preview"
            class="mt-2 max-h-48 rounded-lg"
            @error="imageUrl = ''"
          >
        </div>

        <!-- Ubicación -->
        <div>
          <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            id="location"
            v-model="location"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="ej. París, Francia"
          >
        </div>

        <!-- Error message -->
        <div
          v-if="error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <!-- Buttons -->
        <div class="flex space-x-4">
          <button
            type="submit"
            class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            :disabled="loading"
          >
            {{ loading ? 'Publicando...' : 'Publicar' }}
          </button>
          <button
            type="button"
            @click="router.back()"
            class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            :disabled="loading"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </main>
</template>