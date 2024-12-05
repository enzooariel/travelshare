<!-- src/views/Posts.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { toggleLike, addComment, deletePost, updatePost } from '../firebase/posts';

const posts = ref([]);
const loading = ref(true);
const error = ref('');
const newComment = ref('');
const selectedPost = ref(null);
const commentLoading = ref(false);
const editingPost = ref(null);
const locationFilter = ref('');

const editForm = ref({
  content: '',
  location: '',
  imageUrl: ''
});

// Computed para filtrar posts
const filteredPosts = computed(() => {
  if (!locationFilter.value.trim()) return posts.value;
  
  return posts.value.filter(post => 
    post.location?.toLowerCase().includes(locationFilter.value.toLowerCase())
  );
});

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

const handleLike = async (postId) => {
  if (!auth.currentUser) {
    alert('Debes iniciar sesión para dar like');
    return;
  }

  try {
    const userId = auth.currentUser.uid;
    const post = posts.value.find(p => p.id === postId);
    await toggleLike(postId, userId);
    
    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
  } catch (err) {
    console.error('Error al dar like:', err);
  }
};

const handleComment = async (postId) => {
  if (!auth.currentUser) {
    alert('Debes iniciar sesión para comentar');
    return;
  }

  if (!newComment.value.trim()) return;

  try {
    commentLoading.value = true;
    const comment = await addComment(
      postId,
      auth.currentUser.uid,
      auth.currentUser.displayName,
      newComment.value.trim()
    );

    const post = posts.value.find(p => p.id === postId);
    post.comments.push(comment);
    newComment.value = '';
  } catch (err) {
    console.error('Error al comentar:', err);
  } finally {
    commentLoading.value = false;
  }
};

const isAuthor = (post) => {
  return auth.currentUser && post.userId === auth.currentUser.uid;
};

const startEditing = (post) => {
  editingPost.value = post.id;
  editForm.value = {
    content: post.content,
    location: post.location || '',
    imageUrl: post.imageUrl || ''
  };
};

const cancelEditing = () => {
  editingPost.value = null;
  editForm.value = {
    content: '',
    location: '',
    imageUrl: ''
  };
};

const handleUpdate = async (postId) => {
  try {
    await updatePost(postId, editForm.value);
    const post = posts.value.find(p => p.id === postId);
    Object.assign(post, editForm.value);
    cancelEditing();
    alert('Post actualizado correctamente');
  } catch (error) {
    alert('Error al actualizar el post');
  }
};

const handleDelete = async (postId) => {
  if (!confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
    return;
  }

  try {
    await deletePost(postId);
    posts.value = posts.value.filter(p => p.id !== postId);
    alert('Post eliminado correctamente');
  } catch (error) {
    alert('Error al eliminar el post');
  }
};

onMounted(() => {
  fetchPosts();
});
</script>

<template>
  <main class="min-h-screen bg-gray-50 py-8">
    <div class="container mx-auto px-4">
      <div class="max-w-4xl mx-auto">
        <!-- Header -->
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800">Explorar</h1>
            <p class="text-gray-600 mt-1">Descubre experiencias increíbles</p>
          </div>
          <router-link 
            v-if="auth.currentUser"
            to="/create-post"
            class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            Crear Post
          </router-link>
        </div>

        <!-- Filtro de ubicación -->
        <div class="bg-white shadow-sm rounded-lg p-4 mb-8">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span class="text-gray-500 text-xl">📍</span>
            </div>
            <input
              type="text"
              v-model="locationFilter"
              class="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Buscar por ubicación (ej: París, Nueva York, Roma...)"
            >
            <div 
              v-if="locationFilter"
              class="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              <button
                @click="locationFilter = ''"
                class="text-gray-400 hover:text-gray-600"
                title="Limpiar filtro"
              >
                ✕
              </button>
            </div>
          </div>
          <!-- Contador de resultados -->
          <div class="mt-2 text-sm text-gray-500">
            {{ filteredPosts.length }} {{ filteredPosts.length === 1 ? 'publicación encontrada' : 'publicaciones encontradas' }}
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="text-center py-8">
          <p class="text-gray-600">Cargando publicaciones...</p>
        </div>

        <!-- Error State -->
        <div 
          v-else-if="error" 
          class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
        >
          {{ error }}
        </div>

        <!-- Posts List -->
        <div v-else class="space-y-6">
          <div v-if="filteredPosts.length === 0" class="text-center py-8">
            <div class="text-4xl mb-4">🌍</div>
            <h3 class="text-xl font-medium text-gray-800 mb-2">
              {{ locationFilter ? 'No hay publicaciones en esta ubicación' : 'No hay publicaciones aún' }}
            </h3>
            <p class="text-gray-600">
              {{ locationFilter ? 'Prueba con otra ubicación o' : 'Sé el primero en' }}
              <router-link 
                to="/create-post"
                class="text-blue-500 hover:underline"
              >
                crear una publicación
              </router-link>
            </p>
          </div>

          <article 
            v-for="post in filteredPosts" 
            :key="post.id"
            class="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <div class="p-6 border-b">
              <div class="flex justify-between items-start">
                <div class="flex items-center space-x-4">
                  <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <span class="text-xl text-white font-bold">
                      {{ post.userName?.charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <h3 class="font-bold text-lg">{{ post.userName }}</h3>
                    <div class="text-sm text-gray-500">
                      {{ new Date(post.createdAt).toLocaleDateString() }}
                      <span v-if="post.location" class="ml-2">
                        📍 {{ post.location }}
                      </span>
                    </div>
                  </div>
                </div>

                <div v-if="isAuthor(post)" class="flex space-x-2">
                  <button
                    @click="startEditing(post)"
                    class="text-gray-500 hover:text-blue-600"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    @click="handleDelete(post.id)"
                    class="text-gray-500 hover:text-red-600"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            <div class="p-6">
              <template v-if="editingPost === post.id">
                <form @submit.prevent="handleUpdate(post.id)" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Contenido</label>
                    <textarea
                      v-model="editForm.content"
                      rows="4"
                      class="w-full p-2 border rounded-lg"
                      required
                    ></textarea>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">URL de imagen</label>
                    <input
                      type="url"
                      v-model="editForm.imageUrl"
                      class="w-full p-2 border rounded-lg"
                    >
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Ubicación</label>
                    <input
                      type="text"
                      v-model="editForm.location"
                      class="w-full p-2 border rounded-lg"
                    >
                  </div>

                  <div class="flex space-x-3">
                    <button
                      type="submit"
                      class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      @click="cancelEditing"
                      class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </template>
              <template v-else>
                <p class="text-gray-800">{{ post.content }}</p>
                <img 
                  v-if="post.imageUrl"
                  :src="post.imageUrl"
                  :alt="'Imagen de ' + post.userName"
                  class="mt-4 rounded-lg max-h-96 w-full object-cover"
                >
              </template>
            </div>

            <div class="p-4 border-t bg-gray-50">
              <div class="flex items-center space-x-6">
                <button 
                  @click="handleLike(post.id)"
                  class="flex items-center space-x-2"
                  :class="post.likes.includes(auth.currentUser?.uid) ? 'text-red-500' : 'text-gray-500'"
                >
                  <span class="text-xl">{{ post.likes.includes(auth.currentUser?.uid) ? '❤️' : '🤍' }}</span>
                  <span>{{ post.likes.length }}</span>
                </button>
                <button 
                  @click="selectedPost = selectedPost === post.id ? null : post.id"
                  class="flex items-center space-x-2 text-gray-500"
                >
                  <span class="text-xl">💬</span>
                  <span>{{ post.comments?.length || 0 }}</span>
                </button>
              </div>

              <div v-if="selectedPost === post.id" class="mt-4">
                <div v-if="post.comments?.length" class="space-y-3 mb-4">
                  <div 
                    v-for="comment in post.comments" 
                    :key="comment.createdAt"
                    class="bg-white p-3 rounded-lg shadow-sm"
                  >
                    <div class="flex items-center space-x-2 mb-1">
                      <span class="font-medium">{{ comment.userName }}</span>
                      <span class="text-sm text-gray-500">
                        {{ new Date(comment.createdAt).toLocaleDateString() }}
                      </span>
                    </div>
                    <p class="text-gray-700">{{ comment.content }}</p>
                  </div>
                </div>

                <div v-if="auth.currentUser" class="flex space-x-2">
                  <input
                    v-model="newComment"
                    type="text"
                    placeholder="Escribe un comentario..."
                    class="flex-1 p-2 border rounded-lg"
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
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </main>
</template>