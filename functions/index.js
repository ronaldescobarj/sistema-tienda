const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.discountFromInventory = functions.firestore
    .document('sales/{saleId}')
    .onCreate((snap, context) => {
        const sale = snap.data();
        db.collection("inventory")
        .where("name", "==", sale.model)
        .where("code", "==", sale.code)
        .where("color", "==", sale.color)
        .where("amount", "==", sale.amount)
        .get().then((response) => {
            let itemId, item;
            response.forEach((element) => {
                itemId = element.id;
                item = element.data();
            })
            let updatedItem = item;
            updatedItem.amount = updatedItem.amount - sale.amountGiven;
            return db.collection("inventory").doc(itemId).set(updatedItem);
        }).catch(error => error);
    });

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
