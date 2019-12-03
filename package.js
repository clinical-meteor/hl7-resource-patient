Package.describe({
  name: 'clinical:hl7-resource-patient',
  version: '5.0.8',
  summary: 'HL7 FHIR Resource - Patient',
  git: 'https://github.com/clinical-meteor/hl7-resource-patient',
  documentation: 'README.md'
});


Package.onUse(function (api) {
  api.versionsFrom('1.1.0.3');

  api.use('meteor-base@1.4.0');
  api.use('ecmascript@0.12.4');

  api.use('mongo');
  api.use('session');
  api.use('http');

  api.use('aldeed:collection2@3.0.0');
  api.use('clinical:hl7-resource-datatypes@4.0.0');
  api.use('clinical:hl7-resource-bundle@1.5.5');

  api.use('simple:json-routes@2.1.0');
  api.use('momentjs:moment@2.17.1');
  api.use('react-meteor-data@0.2.15');
  api.use('clinical:extended-api@2.5.0');
  api.use('matb33:collection-hooks@0.7.15');  

  api.use('clinical:base-model@1.5.0');
  api.use('clinical:user-model@1.7.0');
  api.imply('clinical:user-model');

  api.addFiles('lib/Patients.js');
  // api.addFiles('server/methods.js', 'server');
  // api.addFiles('server/rest.js', 'server');

  // if(Package['clinical:fhir-vault-server']){
  //   api.use('clinical:fhir-vault-server@0.0.3', ['client', 'server'], {weak: true});
  // }
  
  api.export('Patient');
  api.export('Patients');
  api.export('PatientSchema');

  api.addFiles('assets/noAvatar.png', "client", {isAsset: true});    

  api.mainModule('index.jsx', 'client');
});


Npm.depends({
  "simpl-schema": "1.5.3",
  "moment": "2.22.2",
  "validator": "10.9.0",
  "lodash": "4.17.4",
  "material-fhir-ui": "0.7.8",
  "react-icons": "3.8.0"
});

