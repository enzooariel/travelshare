<!-- src/views/Posts.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { toggleLike, addComment } from '../firebase/posts';

const posts = ref([]);
const loading = ref(true);
const error = ref('');
const newComment = ref('');
const selectedPost = ref(null);

// Obtener posts
const fetchPosts = async () => {
  try {
    loading.value = true;
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    posts.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      likes: doc.data().likes || [],
      comments: doc.data().comments || []
    }));
  } catch (err) {
    error.value = 'Error al cargar las publicaciones';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

// Manejar likes
const handleLike = async (postId) => {
  if (!auth.currentUser) {
    alert('Debes iniciar sesión para dar like');
    return;
  }

  try {
    const userId = auth.currentUser.uid;
    const post = posts.value.find(p => p.id === postId);
    
    await toggleLike(postId, userId);
    
    // Actualizar UI inmediatamente
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
  } catch (err) {
    console.error('Error al dar like:', err);
  }
};

// Manejar comentarios
const handleComment = async (postId) => {
  if (!auth.currentUser) {
    alert('Debes iniciar sesión para comentar');
    return;
  }

  if (!newComment.value.trim()) {
    return;
  }

  try {
    const comment = await addComment(
      postId,
      auth.currentUser.uid,
      auth.currentUser.displayName,
      newComment.value.trim()
    );

    // Actualizar UI inmediatamente
    const post = posts.value.find(p => p.id === postId);
    post.comments.push(comment);
    
    // Limpiar input
    newComment.value = '';
  } catch (err) {
    console.error('Error al comentar:', err);
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <main class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <!-- Header y loading states -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
      <div v-else-if="error" class="text-center text-red-500 font-bold text-lg">
        {{ error }}
      </div>

      <!-- Lista de posts -->
      <div class="max-w-4xl mx-auto space-y-6">
        <article 
          v-for="post in posts" 
          :key="post.id"
          class="bg-white shadow-lg rounded-lg overflow-hidden"
        >
          <!-- Post Header -->
          <div class="p-6 border-b">
            <div class="flex items-center space-x-4">
              <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span class="text-xl text-white font-bold">{{ post.userName?.charAt(0).toUpperCase() }}</span>
              </div>
              <div>
                <h3 class="font-bold text-lg">{{ post.userName }}</h3>
                <div class="flex items-center space-x-2 text-gray-500">
                  <span>{{ new Date(post.createdAt).toLocaleDateString() }}</span>
                  <span v-if="post.location" class="flex items-center">
                    <i class="fas fa-map-marker-alt mr-1"></i>
                    <span>{{ post.location }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Post Content -->
          <div class="p-6">
            <p class="text-gray-800 text-lg whitespace-pre-wrap">{{ post.content }}</p>
            <div v-if="post.imageUrl" class="mt-4 h-64 relative">
              <img 
                :src="post.imageUrl" 
                :alt="`Imagen de ${post.userName}`"
                class="w-full h-full object-cover rounded-lg"
                @error="event.target.classList.add('hidden')"
              />
            </div>
          </div>
                          

          <!-- Post Footer con Likes y Comentarios -->
          <div class="p-6 border-t bg-gray-50">
            <div class="flex items-center space-x-6 mb-4">
              <button 
                @click="handleLike(post.id)"
                class="flex items-center space-x-2 transition-colors duration-200"
                :class="post.likes.includes(auth.currentUser?.uid) ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'"
              >
                <span class="text-xl">
                  {{ post.likes.includes(auth.currentUser?.uid) ? '❤️' : '🤍' }}
                </span>
                <span>{{ post.likes.length }}</span>
              </button>
              <button 
                @click="selectedPost = selectedPost === post.id ? null : post.id"
                class="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
              >
                <span class="text-xl">💬</span>
                <span>{{ post.comments.length }}</span>
              </button>
            </div>

            <!-- Comentarios -->
            <div v-if="selectedPost === post.id" class="mt-4 space-y-4">
              <!-- Lista de comentarios -->
              <div v-if="post.comments.length > 0" class="space-y-3 mb-4">
                <div 
                  v-for="(comment, index) in post.comments" 
                  :key="index"
                  class="bg-white p-3 rounded-lg shadow-sm"
                >
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="font-semibold">{{ comment.userName }}</span>
                    <span class="text-sm text-gray-500">
                      {{ new Date(comment.createdAt).toLocaleDateString() }}
                    </span>
                  </div>
                  <p class="text-gray-700">{{ comment.content }}</p>
                </div>
              </div>

              <!-- Formulario de comentario -->
              <div v-if="auth.currentUser" class="flex space-x-2">
                <input
                  v-model="newComment"
                  type="text"
                  placeholder="Escribe un comentario..."
                  class="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  @keyup.enter="handleComment(post.id)"
                >
                <button
                  @click="handleComment(post.id)"
                  class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                  :disabled="!newComment.trim()"
                >
                  Comentar
                </button>
              </div>
              <p v-else class="text-center text-gray-500">
                <router-link to="/login" class="text-blue-500 hover:underline">
                  Inicia sesión
                </router-link>
                para comentar
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  </main>
</template>