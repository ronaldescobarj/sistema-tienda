import app from 'firebase/app';

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
    }
}

export default Firebase;