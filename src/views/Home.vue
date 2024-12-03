<!-- src/views/Home.vue -->
<script setup>
import { ref } from 'vue';
import { auth } from '../firebase/config';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <main class="min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="max-w-4xl mx-auto text-center">
        <h1 class="text-5xl font-bold text-gray-800 mb-6">
          Comparte tus aventuras<br/>
          <span class="text-blue-600">con el mundo</span>
        </h1>
        
        <p class="text-xl text-gray-600 mb-8">
          Únete a nuestra comunidad de viajeros y comparte tus experiencias únicas
        </p>

        <div class="space-x-4">
          <button 
            v-if="!auth.currentUser"
            @click="router.push('/register')"
            class="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg"
          >
            Comenzar ahora
          </button>
          <button 
            @click="router.push('/posts')"
            class="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-lg text-lg border-2 border-blue-600"
          >
            Explorar historias
          </button>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="container mx-auto px-4 py-16">
      <div class="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        <div class="bg-white p-6 rounded-xl shadow-lg text-center">
          <div class="text-4xl mb-4">✈️</div>
          <h3 class="text-xl font-bold mb-2">Comparte Viajes</h3>
          <p class="text-gray-600">
            Documenta tus aventuras y comparte tus experiencias con otros viajeros
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg text-center">
          <div class="text-4xl mb-4">🤝</div>
          <h3 class="text-xl font-bold mb-2">Conecta</h3>
          <p class="text-gray-600">
            Conoce otros viajeros y descubre nuevas perspectivas
          </p>
        </div>

        <div class="bg-white p-6 rounded-xl shadow-lg text-center">
          <div class="text-4xl mb-4">💡</div>
          <h3 class="text-xl font-bold mb-2">Inspírate</h3>
          <p class="text-gray-600">
            Encuentra inspiración para tu próxima aventura
          </p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="bg-blue-600 text-white py-16">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">
          ¿Listo para compartir tu historia?
        </h2>
        <p class="text-xl mb-8 text-blue-100">
          Únete a miles de viajeros compartiendo sus experiencias
        </p>
        <button 
          v-if="auth.currentUser"
          @click="router.push('/create-post')"
          class="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg text-lg"
        >
          Crear publicación
        </button>
        <button 
          v-else
          @click="router.push('/register')"
          class="bg-white text-blue-600 px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg text-lg"
        >
          Unirme ahora
        </button>
      </div>
    </div>
  </main>
</template>