<!-- src/views/CreatePost.vue -->
<script setup>
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const router = useRouter();
const content = ref('');
const imageUrl = ref('');
const location = ref('');
const loading = ref(false);
const error = ref('');

// Nuevas refs para el autocompletado
const locationSuggestions = ref([]);
const showSuggestions = ref(false);
const searchTimeout = ref(null);

// Función para buscar ubicaciones
const searchLocations = async (query) => {
  if (!query.trim()) {
    locationSuggestions.value = [];
    return;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
    );
    const data = await response.json();
    locationSuggestions.value = data.map(item => ({
      name: item.display_name,
      // Dividimos el nombre completo para mostrar solo ciudad y país
      shortName: item.display_name.split(',').slice(0, 2).join(',')
    }));
  } catch (err) {
    console.error('Error buscando ubicaciones:', err);
  }
};

// Observar cambios en el input de ubicación
watch(location, (newValue) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  
  if (newValue.trim()) {
    searchTimeout.value = setTimeout(() => {
      searchLocations(newValue);
      showSuggestions.value = true;
    }, 300);
  } else {
    showSuggestions.value = false;
  }
});

// Seleccionar ubicación de las sugerencias
const selectLocation = (suggestion) => {
  location.value = suggestion.shortName;
  showSuggestions.value = false;
  locationSuggestions.value = [];
};

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

    const postData = {
      userId: user.uid,
      userName: user.displayName,
      userPhotoURL: user.photoURL,
      content: content.value.trim(),
      imageUrl: imageUrl.value.trim() || null,
      location: location.value.trim() || null,
      createdAt: new Date().toISOString(),
      likes: [],
      comments: []
    };

    await addDoc(collection(db, 'posts'), postData);
    alert('¡Publicación creada exitosamente!');
    router.push('/posts');
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="container mx-auto px-4 py-8">
    <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold mb-6">Crear Nueva Publicación</h1>

      <form @submit.prevent="createPost" class="space-y-6">
        <!-- Campo de contenido -->
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

        <!-- Campo de imagen -->
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
          <img
            v-if="imageUrl"
            :src="imageUrl"
            alt="Preview"
            class="mt-2 max-h-48 rounded-lg"
            @error="imageUrl = ''"
          >
        </div>

        <!-- Campo de ubicación con autocompletado -->
        <div class="relative">
          <label for="location" class="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <div class="relative">
            <input
              type="text"
              id="location"
              v-model="location"
              class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Busca una ubicación..."
              @focus="showSuggestions = true"
            >
            <!-- Lista de sugerencias -->
            <div 
              v-if="showSuggestions && locationSuggestions.length > 0"
              class="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg"
            >
              <ul class="py-1">
                <li 
                  v-for="suggestion in locationSuggestions"
                  :key="suggestion.name"
                  class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  @click="selectLocation(suggestion)"
                >
                  <div class="flex items-center">
                    <span class="mr-2">📍</span>
                    <span>{{ suggestion.shortName }}</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Mensaje de error -->
        <div
          v-if="error"
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <!-- Botones -->
        <div class="flex space-x-4">
          <button
            type="submit"
            class="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
            :disabled="loading"
          >
            {{ loading ? 'Publicando...' : 'Publicar' }}
          </button>
          <button
            type="button"
            @click="router.push('/posts')"
            class="flex-1 bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
            :disabled="loading"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  </main>
</template>