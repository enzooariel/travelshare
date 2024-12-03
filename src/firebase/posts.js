// src/firebase/posts.js
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

// Funciones existentes anteriores
export const toggleLike = async (postId, userId) => {
  const postRef = doc(db, 'posts', postId);
  const postDoc = await getDoc(postRef);
  const postData = postDoc.data();
  
  const likes = postData.likes || [];
  const hasLiked = likes.includes(userId);

  await updateDoc(postRef, {
    likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId)
  });

  return !hasLiked;
};

export const addComment = async (postId, userId, userName, content) => {
  const postRef = doc(db, 'posts', postId);
  
  const comment = {
    userId,
    userName,
    content,
    createdAt: new Date().toISOString()
  };

  await updateDoc(postRef, {
    comments: arrayUnion(comment)
  });

  return comment;
};

// NUEVAS FUNCIONES que agregamos 👇
export const deletePost = async (postId) => {
  try {
    await deleteDoc(doc(db, 'posts', postId));
    return true;
  } catch (error) {
    console.error('Error al eliminar post:', error);
    throw error;
  }
};

export const updatePost = async (postId, newData) => {
  try {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      ...newData,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error al actualizar post:', error);
    throw error;
  }
};