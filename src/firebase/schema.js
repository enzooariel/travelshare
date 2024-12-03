// src/firebase/schema.js

/**
 * @typedef {Object} User
 * @property {string} name - Nombre del usuario
 * @property {string} email - Email del usuario
 * @property {string} photoURL - URL de la foto de perfil
 */

/**
 * @typedef {Object} Post
 * @property {string} userId - ID del usuario que creó el post
 * @property {string} content - Contenido del post
 * @property {string} imageUrl - URL de la imagen adjunta
 * @property {timestamp} createdAt - Fecha de creación
 * @property {string} location - Ubicación del post
 */

/**
 * @typedef {Object} Comment
 * @property {string} postId - ID del post al que pertenece
 * @property {string} userId - ID del usuario que comentó
 * @property {string} content - Contenido del comentario
 * @property {timestamp} createdAt - Fecha de creación
 */

// Este archivo sirve como documentación de la estructura de datos
// No es necesario exportar nada, es solo referencia