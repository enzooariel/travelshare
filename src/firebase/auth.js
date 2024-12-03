// src/firebase/auth.js
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './config';

// Función de registro
export const registerUser = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await updateProfile(user, {
      displayName: name,
    });

    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // Mostrar mensaje de éxito
    alert(`¡Bienvenido a TravelShare, ${name}! Tu cuenta ha sido creada exitosamente.`);

    return user;
  } catch (error) {
    let errorMessage;
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'Este email ya está registrado';
        break;
      case 'auth/invalid-email':
        errorMessage = 'El email no es válido';
        break;
      case 'auth/weak-password':
        errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        break;
      default:
        errorMessage = 'Error al registrar usuario';
    }
    throw new Error(errorMessage);
  }
};

// Función de login
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Mostrar mensaje de éxito
    alert(`¡Bienvenido de nuevo, ${user.displayName || 'Usuario'}!`);
    
    return user;
  } catch (error) {
    let errorMessage;
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = 'Email inválido';
        break;
      case 'auth/user-not-found':
        errorMessage = 'Usuario no encontrado';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      default:
        errorMessage = 'Error al iniciar sesión';
    }
    throw new Error(errorMessage);
  }
};