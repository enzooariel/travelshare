<!-- src/views/Profile.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { auth, db } from '../firebase/config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

const user = ref(null);
const userPosts = ref([]);
const loading = ref(true);
const error = ref('');
const isEditing = ref(false);

const editForm = ref({
  displayName: '',
  photoURL: ''
});

// Función para cargar los posts del usuario
const fetchUserPosts = async (userId) => {
  try {
    const q = query(
      collection(db, 'posts'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    userPosts.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (err) {
    console.error('Error al cargar los posts:', err);
    error.value = 'Error al cargar las publicaciones';
  }
};

onMounted(async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push('/login');
      return;
    }

    user.value = currentUser;
    editForm.value.displayName = currentUser.displayName || '';
    editForm.value.photoURL = currentUser.photoURL || '';

    // Cargar los posts del usuario
    await fetchUserPosts(currentUser.uid);
  } catch (err) {
    error.value = 'Error al cargar el perfil';
  } finally {
    loading.value = false;
  }
});

const saveProfile = async () => {
  try {
    loading.value = true;

    await updateProfile(auth.currentUser, {
      displayName: editForm.value.displayName,
      photoURL: editForm.value.photoURL
    });

    user.value = auth.currentUser;
    isEditing.value = false;
    alert('Perfil actualizado correctamente');
  } catch (err) {
    error.value = 'Error al actualizar el perfil';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="container mx-auto px-4 py-8 max-w-4xl">
    <!-- Perfil del Usuario -->
    <div class="bg-white shadow rounded-lg p-6 mb-8">
      <div class="flex items-center space-x-4">
        <!-- Avatar -->
        <div class="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
          <span class="text-2xl text-white font-bold">
            {{ user?.displayName?.charAt(0).toUpperCase() || 'U' }}
          </span>
        </div>
        <!-- Información del Usuario -->
        <div class="flex-1">
          <h1 class="text-2xl font-bold">{{ user?.displayName }}</h1>
          <p class="text-gray-600">{{ user?.email }}</p>
        </div>
        <!-- Botón de Editar -->
        <button 
          v-if="!isEditing"
          @click="isEditing = true"
          class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Editar Perfil
        </button>
      </div>

      <!-- Formulario de Edición -->
      <div v-if="isEditing" class="mt-6 space-y-4">
        <div>
          <label class="block mb-1">Nombre</label>
          <input 
            type="text"
            v-model="editForm.displayName"
            class="w-full p-2 border rounded-lg"
          >
        </div>
        <div>
          <label class="block mb-1">URL de foto</label>
          <input 
            type="url"
            v-model="editForm.photoURL"
            class="w-full p-2 border rounded-lg"
          >
        </div>
        <div class="flex space-x-3">
          <button 
            @click="saveProfile"
            class="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Guardar
          </button>
          <button 
            @click="isEditing = false"
            class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Posts del Usuario -->
    <div>
      <h2 class="text-2xl font-bold mb-6">Mis Publicaciones</h2>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <p class="text-gray-600">Cargando publicaciones...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>

      <!-- Posts List -->
      <div v-else class="space-y-6">
        <div v-if="userPosts.length === 0" class="text-center py-8">
          <p class="text-gray-600">Aún no tienes publicaciones</p>
          <router-link 
            to="/create-post"
            class="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Crear mi primera publicación
          </router-link>
        </div>

        <div v-else class="grid gap-6">
          <article 
            v-for="post in userPosts" 
            :key="post.id"
            class="bg-white shadow rounded-lg overflow-hidden"
          >
            <div class="p-6">
              <div class="mb-4">
                <div class="flex items-center space-x-2 text-sm text-gray-500">
                  <span>{{ new Date(post.createdAt).toLocaleDateString() }}</span>
                  <span v-if="post.location">• 📍 {{ post.location }}</span>
                </div>
              </div>
              
              <p class="text-gray-800 mb-4">{{ post.content }}</p>
              
              <img 
                v-if="post.imageUrl"
                :src="post.imageUrl"
                :alt="'Imagen de ' + post.userName"
                class="w-full h-64 object-cover rounded-lg"
              >
              
              <div class="mt-4 flex items-center space-x-4 text-gray-500">
                <span class="flex items-center">
                  <span class="mr-2">❤️</span>
                  {{ post.likes?.length || 0 }} likes
                </span>
                <span class="flex items-center">
                  <span class="mr-2">💬</span>
                  {{ post.comments?.length || 0 }} comentarios
                </span>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </main>
</template>