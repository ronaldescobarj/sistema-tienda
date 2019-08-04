const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });

admin.initializeApp();

const db = admin.firestore();

exports.getModelsWithColors = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        let allItems = await db.collection("inventory").get();
        let models = new Map();
        let modelKey, modelValue;
        allItems.forEach(doc => {
            modelKey = JSON.stringify({ model: doc.data().name, code: doc.data().code });
            if (models.has(modelKey)) {
                modelValue = models.get(modelKey);
                modelValue.push({ color: doc.data().color, amount: doc.data().amount });
            }
            else {
                modelValue = [{ color: doc.data().color, amount: doc.data().amount }];
            }
            models.set(modelKey, modelValue);
        });
        let modelsArray = [];
        let newModel;
        for (let model of [...models]) {
            newModel = JSON.parse(model[0]);
            newModel.colors = model[1];
            modelsArray.push(newModel);
        }
        res.send(modelsArray);
    })
})

exports.discountFromInventory = functions.firestore
    .document('sales/{saleId}')
    .onCreate((snap, context) => {
        const sale = snap.data();
        db.collection("inventory")
        .where("name", "==", sale.model)
        .where("code", "==", sale.code)
        .where("color", "==", sale.color)
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
