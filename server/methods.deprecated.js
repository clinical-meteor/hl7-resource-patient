

// Meteor.methods({
//   createPatient:function(patientObject){
//     check(patientObject, Object);

//     if (process.env.NODE_ENV === 'test') {
//       console.log('-----------------------------------------');
//       console.log('Creating Patient...');
//       Patients.insert(patientObject, function(error, result){
//         if (error) {
//           console.log(error);
//           if (typeof HipaaLogger === 'object') {
//             HipaaLogger.logEvent({
//               eventType: "error",
//               userId: Meteor.userId(),
//               userName: Meteor.user().fullName(),
//               collectionName: "Patients"
//             });
//           }
//         }
//         if (result) {
//           console.log('Patient created: ' + result);
//           if (typeof HipaaLogger === 'object') {
//             HipaaLogger.logEvent({
//               eventType: "create",
//               userId: Meteor.userId(),
//               userName: Meteor.user().fullName(),
//               collectionName: "Patients"
//             });
//           }
//         }
//       });
//     } else {
//       console.log('This command can only be run in a test environment.');
//       console.log('Try setting NODE_ENV=test');
//     }
//   },
//   initializePatient:function(){
//     if (Patients.find().count() === 0) {
//       console.log('-----------------------------------------');
//       console.log('No records found in Patients collection.  Lets create some...');

//       var defaultPatient = {
//         'name' : [
//           {
//             'text' : 'Jane Doe',
//             'resourceType' : 'HumanName'
//           }
//         ],
//         'active' : true,
//         'gender' : 'female',
//         'identifier' : [
//           {
//             'use' : 'usual',
//             'type' : {
//               text: 'Medical record number',
//               'coding' : [
//                 {
//                   'system' : 'http://hl7.org/fhir/v2/0203',
//                   'code' : 'MR'
//                 }
//               ]
//             },
//             'system' : 'urn:oid:1.2.36.146.595.217.0.1',
//             'value' : '123',
//             'period' : {}
//           }
//         ],
//         'birthdate' : new Date(1970, 1, 25),
//         'resourceType' : 'Patient'
//       };

//       Meteor.call('createPatient', defaultPatient);
//     } else {
//       console.log('Patients already exist.  Skipping.');
//     }
//   },
//   dropPatients: function(){
//     console.log('-----------------------------------------');
//     console.log('Dropping patients... ');

//     if (process.env.NODE_ENV === 'test') {
//       console.log('-----------------------------------------');
//       console.log('Creating Patient...');
//       Patients.find().forEach(function(patient){
//         Patients.remove({_id: patient._id});
//       });
//     } else {
//       console.log('This command can only be run in a test environment.');
//       console.log('Try setting NODE_ENV=test');
//     }
//   }
// });
