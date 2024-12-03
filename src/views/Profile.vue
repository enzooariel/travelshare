<!-- src/views/Profile.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { auth, db } from '../firebase/config';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

const router = useRouter();
const user = ref(null);
const isEditing = ref(false);
const loading = ref(true);
const error = ref('');

// Formulario expandido
const editForm = ref({
  displayName: '',
  photoURL: '',
  bio: '',
  location: '',
  phone: '',
  website: '',
  socialMedia: {
    instagram: '',
    twitter: '',
    facebook: ''
  }
});

onMounted(async () => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      router.push('/login');
      return;
    }

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.data();
    
    user.value = {
      ...currentUser,
      ...userData
    };

    // Llenar el formulario con datos existentes
    editForm.value = {
      displayName: user.value.displayName || '',
      photoURL: user.value.photoURL || '',
      bio: userData?.bio || '',
      location: userData?.location || '',
      phone: userData?.phone || '',
      website: userData?.website || '',
      socialMedia: userData?.socialMedia || {
        instagram: '',
        twitter: '',
        facebook: ''
      }
    };
  } catch (err) {
    error.value = 'Error al cargar el perfil';
    console.error(err);
  } finally {
    loading.value = false;
  }
});

const startEditing = () => {
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
  // Restaurar valores originales
  editForm.value = {
    displayName: user.value.displayName || '',
    photoURL: user.value.photoURL || '',
    bio: user.value.bio || '',
    location: user.value.location || '',
    phone: user.value.phone || '',
    website: user.value.website || '',
    socialMedia: user.value.socialMedia || {
      instagram: '',
      twitter: '',
      facebook: ''
    }
  };
};

const saveProfile = async () => {
  try {
    loading.value = true;
    error.value = '';

    if (!editForm.value.displayName.trim()) {
      throw new Error('El nombre es requerido');
    }

    // Actualizar en Authentication
    await updateProfile(auth.currentUser, {
      displayName: editForm.value.displayName,
      photoURL: editForm.value.photoURL
    });

    // Actualizar en Firestore
    await updateDoc(doc(db, 'users', auth.currentUser.uid), {
      name: editForm.value.displayName,
      photoURL: editForm.value.photoURL,
      bio: editForm.value.bio,
      location: editForm.value.location,
      phone: editForm.value.phone,
      website: editForm.value.website,
      socialMedia: editForm.value.socialMedia,
      updatedAt: new Date().toISOString()
    });

    // Actualizar estado local
    user.value = {
      ...user.value,
      ...editForm.value
    };
    
    isEditing.value = false;
    alert('Perfil actualizado correctamente');
  } catch (err) {
    error.value = err.message || 'Error al actualizar el perfil';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <main class="container mx-auto px-4 py-8 max-w-3xl">
    <!-- Loading y Error states igual que antes -->
    <div v-if="loading" class="text-center py-8">
      <p class="text-gray-600">Cargando perfil...</p>
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ error }}
    </div>

    <div v-else class="bg-white shadow rounded-lg">
      <!-- Profile Header -->
      <div class="p-6 border-b">
        <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <!-- User Avatar -->
          <div class="relative group">
            <img 
              v-if="user?.photoURL"
              :src="user.photoURL"
              :alt="user.displayName"
              class="w-32 h-32 rounded-full object-cover"
            />
            <div 
              v-else 
              class="w-32 h-32 bg-blue-500 rounded-full flex items-center justify-center"
            >
              <span class="text-4xl text-white font-bold">
                {{ user?.displayName?.charAt(0).toUpperCase() || 'U' }}
              </span>
            </div>
          </div>

          <!-- User Info Form -->
          <div class="flex-1">
            <div v-if="!isEditing" class="space-y-2">
              <h1 class="text-2xl font-bold">{{ user?.displayName }}</h1>
              <p class="text-gray-600">{{ user?.email }}</p>
              <p v-if="user?.bio" class="text-gray-700">{{ user.bio }}</p>
              <p v-if="user?.location" class="text-gray-600">
                📍 {{ user.location }}
              </p>
              <div v-if="user?.phone || user?.website" class="space-y-1">
                <p v-if="user.phone" class="text-gray-600">📞 {{ user.phone }}</p>
                <a 
                  v-if="user.website" 
                  :href="user.website"
                  target="_blank"
                  class="text-blue-500 hover:underline"
                >
                  🌐 {{ user.website }}
                </a>
              </div>
              <div class="flex space-x-4">
                <a 
                  v-if="user?.socialMedia?.instagram"
                  :href="`https://instagram.com/${user.socialMedia.instagram}`"
                  target="_blank"
                  class="text-pink-500 hover:underline"
                >
                  Instagram
                </a>
                <a 
                  v-if="user?.socialMedia?.twitter"
                  :href="`https://twitter.com/${user.socialMedia.twitter}`"
                  target="_blank"
                  class="text-blue-400 hover:underline"
                >
                  Twitter
                </a>
                <a 
                  v-if="user?.socialMedia?.facebook"
                  :href="`https://facebook.com/${user.socialMedia.facebook}`"
                  target="_blank"
                  class="text-blue-600 hover:underline"
                >
                  Facebook
                </a>
              </div>
            </div>

            <!-- Edit Form -->
            <div v-else class="space-y-4">
              <div>
                <label class="block text-sm mb-1">Foto de Perfil URL</label>
                <input
                  type="url"
                  v-model="editForm.photoURL"
                  class="w-full p-2 border rounded-lg"
                  placeholder="https://ejemplo.com/foto.jpg"
                >
              </div>
              <div>
                <label class="block text-sm mb-1">Nombre</label>
                <input
                  type="text"
                  v-model="editForm.displayName"
                  class="w-full p-2 border rounded-lg"
                  placeholder="Tu nombre"
                  required
                >
              </div>
              <div>
                <label class="block text-sm mb-1">Biografía</label>
                <textarea
                  v-model="editForm.bio"
                  class="w-full p-2 border rounded-lg"
                  placeholder="Cuéntanos sobre ti"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label class="block text-sm mb-1">Ubicación</label>
                <input
                  type="text"
                  v-model="editForm.location"
                  class="w-full p-2 border rounded-lg"
                  placeholder="Tu ciudad"
                >
              </div>
              <div>
                <label class="block text-sm mb-1">Teléfono</label>
                <input
                  type="tel"
                  v-model="editForm.phone"
                  class="w-full p-2 border rounded-lg"
                  placeholder="Tu número de teléfono"
                >
              </div>
              <div>
                <label class="block text-sm mb-1">Sitio Web</label>
                <input
                  type="url"
                  v-model="editForm.website"
                  class="w-full p-2 border rounded-lg"
                  placeholder="https://tusitio.com"
                >
              </div>
              <div class="space-y-2">
                <label class="block text-sm">Redes Sociales</label>
                <input
                  type="text"
                  v-model="editForm.socialMedia.instagram"
                  class="w-full p-2 border rounded-lg"
                  placeholder="Usuario de Instagram"
                >
                <input
                  type="text"
                  v-model="editForm.socialMedia.twitter"
                  class="w-full p-2 border rounded-lg"
                  placeholder="Usuario de Twitter"
                >
                <input
                  type="text"
                  v-model="editForm.socialMedia.facebook"
                  class="w-full p-2 border rounded-lg"
                  placeholder="Usuario de Facebook"
                >
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div>
            <template v-if="!isEditing">
              <button 
                @click="startEditing"
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
              >
                Editar Perfil
              </button>
            </template>
            <template v-else>
              <div class="space-y-2">
                <button 
                  @click="saveProfile"
                  class="w-full bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                  :disabled="loading"
                >
                  Guardar
                </button>
                <button 
                  @click="cancelEditing"
                  class="w-full bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                  :disabled="loading"
                >
                  Cancelar
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Posts Section (mantener igual) -->
      <div class="p-6">
        <h2 class="text-xl font-bold mb-4">Mis Publicaciones</h2>
        <p class="text-gray-600">
          No hay publicaciones aún. 
          <router-link to="/create-post" class="text-blue-500 hover:underline">
            ¡Crea tu primera publicación!
          </router-link>
        </p>
      </div>
    </div>
  </main>
</template>