const functions = require('firebase-functions');

const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// Take the text parameter passed to this HTTP endpoint and insert it into the
// Realtime Database under the path /messages/:pushId/original
exports.addMessage = functions.https.onRequest((req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push it into the Realtime Database then send a response
  admin.database().ref('/chats').push({original: original}).then(snapshot => {
    // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
    res.redirect(303, snapshot.ref);
  });
});

// exports.sentNotification = functions.database.ref('/chats/{pushId}/original')
exports.sentNotification = functions.database.ref('/chats/group_besar')
    .onWrite(event => {

      var tokensMentah = [];
      const getDeviceTokensPromise = admin.database().ref(`/catalog/group_besar`).once('value').then(function(snapshot) {
        snapshot.forEach(function(data) {
          var tokenData = data.val();
          tokensMentah.push(tokenData.token)
        });

        const tokens = tokensMentah;
        // Notification details.
        const payload = {
          notification: {
            title: 'You have a new massage!',
            body: 'Click For Read Massage',
          }
        };

        // Send notifications to all tokens.
        return admin.messaging().sendToDevice(tokens, payload).then(response => {
          // For each message check if there was an error.
          const tokensToRemove = [];
          response.results.forEach((result, index) => {
            const error = result.error;
            if (error) {
              console.error('Failure sending notification to', tokens[index], error);
              // Cleanup the tokens who are not registered anymore.
              if (error.code === 'messaging/invalid-registration-token' ||
                  error.code === 'messaging/registration-token-not-registered') {
                tokensToRemove.push(tokensSnapshot.ref.child(tokens[index]).remove());
              }
            }
          });
          return Promise.all(tokensToRemove);
        });

      });
    });
