const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();



exports.checkExpiredProducts = functions.pubsub.schedule("every 1440 minutes").onRun(async (context) => {
  try {
    const db = admin.firestore();
    const settingsDoc = await db.collection('settings').doc('notifications').get();
    if (!settingsDoc.exists || !settingsDoc.data().enabled) {
      console.log('Las notificaciones están desactivadas.');
      return null;
    }
    const now = admin.firestore.Timestamp.now();
    const sevenDaysFromNow = admin.firestore.Timestamp.fromMillis(
      now.toMillis() + 7 * 24 * 60 * 60 * 1000
    );

    // Obtener todos los usuarios
    const usersSnapshot = await db.collection('users').get();

    const notifications = [];

    // Función para verificar si una fecha es caducada o próxima a caducar
    const isExpiredOrExpiring = (dateString) => {
      const date = new Date(dateString);
      return date <= sevenDaysFromNow.toDate();
    };

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userToken = userDoc.data().userToken;

      if (userToken) {
        // Obtener todos los productos del usuario
        const productsSnapshot = await db.collection(`users/${userId}/products`).get();

        if (!productsSnapshot.empty) {
          let hasExpiredOrExpiringProducts = false;

          productsSnapshot.forEach((productDoc) => {
            const product = productDoc.data();
            if (isExpiredOrExpiring(product.date)) {
              hasExpiredOrExpiringProducts = true;
              console.log('Producto:', product);
            }
          });

          if (hasExpiredOrExpiringProducts) {
            // Enviar notificación push al usuario
            const message = {
              notification: {
                title: 'Alerta de Caducidad',
                body: 'Tiene productos caducados o próximos a caducar'
              },
              token: userToken
            };
            notifications.push(admin.messaging().send(message));
            console.log(`Notificación enviada a: ${userToken} para el usuario: ${userId}`);
          }
        } else {
          console.log(`No se encontraron productos para el usuario: ${userId}`);
        }
      } else {
        console.error(`El usuario con ID ${userId} no tiene un token de notificación.`);
      }
    }

    // Enviar todas las notificaciones
    await Promise.all(notifications);

    return null;
  } catch (error) {
    console.error('Error al verificar productos caducados:', error);
    throw new functions.https.HttpsError('internal', 'Error al verificar productos caducados');
  }
});