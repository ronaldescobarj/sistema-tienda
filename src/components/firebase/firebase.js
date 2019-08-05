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
        this.logout = this.logout.bind(this);
    }

    getItems() {
        return this.db.collection("inventory").get();
    }

    getItemById(id) {
        return this.db.collection("inventory").doc(id).get();
    }

    getItemsByParameter(parameter, value) {
        return this.db.collection("inventory").where(parameter, "==", value).get();
    }

    addItem(item) {
        return this.db.collection("inventory").add(item);
    }

    updateItem(item, id) {
        return this.db.collection("inventory").doc(id).set(item);
    }

    deleteItem(id) {
        return this.db.collection("inventory").doc(id).delete();
    }

    getSales() {
        return this.db.collection("sales").get();
    }

    getSaleById(id) {
        return this.db.collection("sales").doc(id).get();
    }

    getSalesByParameter(parameter, value) {
        return this.db.collection("sales").where(parameter, "==", value).get();
    }

    registerSale(sale) {
        return this.db.collection("sales").add(sale);
    }

    updateSale(sale, id) {
        return this.db.collection("sales").doc(id).set(sale);
    }

    deleteSale(id) {
        return this.db.collection("sales").doc(id).delete();
    }

    getCustomers() {
        return this.db.collection("customers").get();
    }

    getCustomerById(id) {
        return this.db.collection("customers").doc(id).get();
    }

    getCustomersByParameter(parameter, value) {
        return this.db.collection("customers").where(parameter, "==", value).get();
    }

    registerCustomer(customer) {
        return this.db.collection("customers").add(customer);
    }

    updateCustomer(customer, id) {
        return this.db.collection("customers").doc(id).set(customer);
    }

    deleteCustomer(id) {
        return this.db.collection("customers").doc(id).delete();
    }

    createUser(email, password) {
        this.auth.createUserWithEmailAndPassword(email, password);
    }

    login(email, password) {
        return this.auth.signInWithEmailAndPassword(email, password);
    }

    logout() {
        this.auth.signOut();
    }

    resetPassword(email) {
        return this.auth.sendPasswordResetEmail(email);
    }

    updatePassword(password) {
        return this.auth.currentUser.updatePassword(password);
    }
}

export default Firebase;