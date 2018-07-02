##  clinical:hl7-resource-patient   

HL7 FHIR Resource - Patient


--------------------------------------------  
#### Schema Version 

The resource in this package implements the `FHIR 1.6.0 - STU3 Ballot` version of the Patient resource schema, specified at  [http://hl7.org/fhir/2016Sep/patient.html](http://hl7.org/fhir/2016Sep/patient.html).  


--------------------------------------------  
#### Installation  

```bash
meteor add clinical:hl7-resource-patient
```

You may also wish to install the `autopublish` package, which will set up a default publication/subscription of the Patients collection for logged in users.  You will need to remove the package before going into production, however.

```bash
meteor add clinical:autopublish  
```


--------------------------------------------  
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

--------------------------------------------  
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

--------------------------------------------  
#### Initialize a Sample Patient  

Call the `initializePatient` method to create a sample patient in the Patients collection.

```js
Meteor.startup(function(){
  Meteor.call('initializePatient');
})
```
--------------------------------------------  
#### Server Methods  

This package supports `createPatient`, `initializePatient`, and `dropPatient` methods.

--------------------------------------------  
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

--------------------------------------------  
#### Conformance Statement  

This package conforms to version `FHIR 1.6.0 - STU3 Ballot`, as per the Touchstone testing utility.  

![https://raw.githubusercontent.com/clinical-meteor/hl7-resource-patient/master/screenshots/Screen%20Shot%202017-03-18%20at%2010.56.09%20PM.png](https://raw.githubusercontent.com/clinical-meteor/hl7-resource-patient/master/screenshots/Screen%20Shot%202017-03-18%20at%2010.56.09%20PM.png)  


--------------------------------------------  
#### Licensing   

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)
