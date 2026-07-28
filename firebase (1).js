// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    updateProfile,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// Your exact Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDW7sJD66CMHJJiPwBlPigNMxcou-7oRQY",
    authDomain: "iseescan-loginform.firebaseapp.com",
    projectId: "iseescan-loginform",
    storageBucket: "iseescan-loginform.firebasestorage.app",
    messagingSenderId: "1082567159781",
    appId: "1:1082567159781:web:602b0bce6b214d9a44090c"
};

// Initialize Firebase App & Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/**
 * Register a new iSeeScan user account
 */
export async function signUpUser(email, password, username) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: username });
    return userCredential.user;
}

/**
 * Log in an existing iSeeScan user account
 */
export async function loginUser(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
    return await sendPasswordResetEmail(auth, email);
}

/**
 * Log out current session
 */
export async function logoutUser() {
    return await signOut(auth);
}

/**
 * Monitor Auth State
 */
export function listenToAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

export { auth };