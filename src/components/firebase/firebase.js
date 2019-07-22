import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const config = {
    apiKey: "AIzaSyC3EhlCCUxl_LvMbOCZ8PdmqQr8dMTt37I",
    authDomain: "sistema-tienda-c6c67.firebaseapp.com",
    databaseURL: "https://sistema-tienda-c6c67.firebaseio.com",
    projectId: "sistema-tienda-c6c67",
    storageBucket: "",
    messagingSenderId: "565410523155",
    appId: "1:565410523155:web:4bbe023764c421df"
};

class Firebase {
    constructor() {
        app.initializeApp(config);
        this.auth = app.auth();
        this.db = app.firestore();
    }

    addItem(item) {
        return this.db.collection("inventory").add(item);
    }

    getItems() {
        return this.db.collection("inventory").get();
    }

    createUser(email, password) {
        this.auth.createUserWithEmailAndPassword(email, password);
    }

    login(email, password) {
        this.auth.signInWithEmailAndPassword(email, password);
    }

    logout() {
        this.auth.signOut();
    }

    resetPassword(email) {
        this.auth.sendPasswordResetEmail(email);
    }

    updatePassword(password) {
        this.auth.currentUser.updatePassword(password);
    }

    getUserById(uid) {
        this.db.ref(`users/${uid}`);
    }

    getUsers() {
        this.db.ref('users');
    }
}

export default Firebase;