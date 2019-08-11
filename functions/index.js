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
    .onCreate(async (snap, context) => {
        const sale = snap.data();
        let response = await db.collection("inventory").where("name", "==", sale.model).where("code", "==", sale.code).where("color", "==", sale.color).get();
        let itemId, item;
        response.forEach((element) => {
            itemId = element.id;
            item = element.data();
        })
        item.amount = item.amount - sale.amountGiven;
        return await db.collection("inventory").doc(itemId).set(item);
    });


exports.updateAmountOnInventory = functions.firestore
    .document("sales/{saleId}")
    .onUpdate(async (change, context) => {
        const updatedSale = change.after.data();
        const previousSale = change.before.data();
        if (updatedSale.code !== previousSale.code || updatedSale.model !== previousSale.model || updatedSale.color !== previousSale.color) {
            let response = await db.collection("inventory").where("name", "==", previousSale.model).where("code", "==", previousSale.code).where("color", "==", previousSale.color).get();
            let itemId, item;
            response.forEach((element) => {
                itemId = element.id;
                item = element.data();
            });
            item.amount = item.amount + previousSale.amountGiven;
            await db.collection("inventory").doc(itemId).set(item);
            let newResponse = await db.collection("inventory").where("name", "==", updatedSale.model).where("code", "==", updatedSale.code).where("color", "==", updatedSale.color).get();
            newResponse.forEach((element) => {
                itemId = element.id;
                item = element.data();
            });
            item.amount = item.amount - updatedSale.amountGiven;
            return await db.collection("inventory").doc(itemId).set(item);
        }
        else {
            let amountToModify = updatedSale.amountGiven - previousSale.amountGiven;
            let response = await db.collection("inventory").where("name", "==", updatedSale.model).where("code", "==", updatedSale.code).where("color", "==", updatedSale.color).get();
            let itemId, item;
            response.forEach((element) => {
                itemId = element.id;
                item = element.data();
            })
            item.amount = item.amount - amountToModify;
            return await db.collection("inventory").doc(itemId).set(item);
        }

    })

exports.deleteSale = functions.https.onRequest((req, res) => {
    return cors(req, res, async () => {
        let shouldUpdateInventory = req.body.shouldUpdateInventory;
        let sale = req.body.sale;
        let amountToAdd = sale.amountGiven;
        let saleId = sale._id;
        await db.collection("sales").doc(saleId).delete();
        if (shouldUpdateInventory) {
            let response = await db.collection("inventory").where("name", "==", sale.model).where("code", "==", sale.code).where("color", "==", sale.color).get();
            if (response.empty)
                res.send({ error: "No se pudieron actualizar los cambios en el inventario ya que el item de la venta eliminada ya no existe en el inventario" });
            else {
                let itemId, item;
                response.forEach((element) => {
                    itemId = element.id;
                    item = element.data();
                });
                item.amount = item.amount + amountToAdd;
                await db.collection("inventory").doc(itemId).set(item);
            }
        }
        res.send({ success: true });
    })
})
