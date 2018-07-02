import { HTTP } from 'meteor/http';
import { Meteor } from 'meteor/meteor';

import { Patients } from '../lib/Patients';
import { get } from 'lodash';

Patients.after.insert(function (userId, doc) {

  // HIPAA Audit Log
  HipaaLogger.logEvent({eventType: "create", userId: userId, userName: '', collectionName: "Patients"});

  // RELAY/SEND FUNCTIONALITY
  // interface needs to be active in order to send the messages
  if (get(Meteor, 'settings.public.interfaces.default.status') === "active") {
    HTTP.put(get(Meteor, 'settings.public.interfaces.default.channel.endpoint') + '/Patient', {
      data: doc
    }, function(error, result){
      if (error) {
        console.log("POST /Patient", error);
      }
      if (result) {
        console.log("POST /Patient", result);
      }
    });
  }
});
Patients.after.update(function (userId, doc) {

  // HIPAA Audit Log
  HipaaLogger.logEvent({eventType: "update", userId: userId, userName: '', collectionName: "Patients"});

  // interface needs to be active in order to send the messages
  if (get(Meteor, 'settings.public.interfaces.default.status') === "active") {
    HTTP.put(get(Meteor, 'settings.public.interfaces.default.channel.endpoint') + '/Patient', {
      data: doc
    }, function(error, result){
      if (error) {
        console.log("POST /Patient", error);
      }
      if (result) {
        console.log("POST /Patient", result);
      }
    });
  }
});
Patients.after.remove(function (userId, doc) {
  // ...
});
