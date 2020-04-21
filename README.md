##  clinical:hl7-resource-patient   

> **NOTICE:  After a very successful run of nearly 50+ pilots and prototypes, this package is being retired and archived.  Future work on FHIR Patient resource is being done in the [clinical:hl7-fhir-data-infrastructure](https://github.com/clinical-meteor/hl7-fhir-data-infrastructure) atmosphere package and the [material-fhir-ui](https://github.com/clinical-meteor/material-fhir-ui) NPM package.**    

> One of our learnings over the 50+ pilots was how to best organize our packages, and we've determined that we want to a) consolidate React pure function components (Tables, Cards, etc) into an NPM package that is accessible to Webpack and other build environments.  And b) we wanted to consolidate the React class components which rely on Meteor's reactive data infrastructure into it's own separate package.  We're also c) moving the Rest server endpoints into a third package.   

> Separating each FHIR resource into it's own package was a time consuming task; but was definately worth.  Over the 50+ pilots, we were able to track usage patterns and what functionality was specific to each resource and what was shared, common, infrastructure.  Our refactor back into a consolidated package architecture will be based on all those learnings, and we look forward to publishing some of the best FHIR UI libraries on the web.  


#### Licensing  
![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)


#### Integration & Verification Tests  
[![CircleCI](https://circleci.com/gh/clinical-meteor/hl7-resource-patient/tree/master.svg?style=svg)](https://circleci.com/gh/clinical-meteor/hl7-resource-patient/tree/master)


#### API Reference  
The resource in this package implements Patient resource schema, specified at [https://www.hl7.org/fhir/DSTU2/patient.html](https://www.hl7.org/fhir/DSTU2/patient.html). 



#### Installation  

```bash
meteor add clinical:hl7-resource-patient
```

You may also wish to install the `autopublish` package, which will set up a default publication/subscription of the Patients collection for logged in users.  You will need to remove the package before going into production, however.

```bash
meteor add clinical:autopublish  
```



#### Example    

```js
var newPatient = {
  'name' : [
    {
      'text' : 'Jane Doe',
      'given' : 'Jane',
      'family' : 'Doe',
      'resourceType' : 'HumanName'
    }
  ],
  'active' : true,
  'gender' : 'female',
  'identifier' : [{
      'use' : 'usual',
      'type' : {
        text: 'Medical record number',
        'coding' : [
          {
            'system' : 'http://hl7.org/fhir/v2/0203',
            'code' : 'MR'
          }
        ]
      },
      'system' : 'urn:oid:1.2.36.146.595.217.0.1',
      'value' : '123',
      'period' : {}
   }],
  'birthdate' : new Date(1970, 1, 25),
  'resourceType' : 'Patient'
};
Patients.insert(newPatient);
```


#### Extending the Schema  

If you have extra fields that you would like to attach to the schema, extend the schema like so:  

```js
ExtendedPatientSchema = new SimpleSchema([
  PatientSchema,
  {
    "createdAt": {
      "type": Date,
      "optional": true
    }
  }
]);
Patients.attachSchema( ExtendedPatientSchema );
```


#### Initialize a Sample Patient  

Call the `initializePatient` method to create a sample patient in the Patients collection.

```js
Meteor.startup(function(){
  Meteor.call('initializePatient');
})
```

#### Server Methods  

This package supports `createPatient`, `initializePatient`, and `dropPatient` methods.


#### REST API Points    

This package supports the following REST API endpoints.  All endpoints require an OAuth token.  

```
GET    /fhir-1.6.0/Patient/:id    
GET    /fhir-1.6.0/Patient/:id/_history  
PUT    /fhir-1.6.0/Patient/:id  
GET    /fhir-1.6.0/Patient  
POST   /fhir-1.6.0/Patient/:param  
POST   /fhir-1.6.0/Patient  
DELETE /fhir-1.6.0/Patient/:id
```

If you would like to test the REST API without the OAuth infrastructure, launch the app with the `NOAUTH` environment variable, or set `Meteor.settings.private.disableOauth` to true in you settings file.

```bash
NOAUTH=true meteor
```


#### Conformance Statement  

This package conforms to version `FHIR 1.6.0 - STU3 Ballot`, as per the Touchstone testing utility.  

![https://raw.githubusercontent.com/clinical-meteor/hl7-resource-patient/master/screenshots/Screen%20Shot%202017-03-18%20at%2010.56.09%20PM.png](https://raw.githubusercontent.com/clinical-meteor/hl7-resource-patient/master/screenshots/Screen%20Shot%202017-03-18%20at%2010.56.09%20PM.png)  


