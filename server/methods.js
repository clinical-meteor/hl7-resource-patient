

Meteor.methods({
  createPatient:function(patientObject){
    check(patientObject, Object);

    if (process.env.NIGHTWATCH || this.userId) {
      console.log('-----------------------------------------');
      console.log('Creating Patient...');
      Patients.insert(patientObject, function(error, result){
        if (error) {
          console.log(error);
          if (typeof HipaaLogger === 'object') {
            HipaaLogger.logEvent({
              eventType: "error",
              userId: Meteor.userId(),
              userName: Meteor.user().fullName(),
              collectionName: "Patients"
            });
          }
        }
        if (result) {
          console.log('Patient created: ' + result);
          if (typeof HipaaLogger === 'object') {
            HipaaLogger.logEvent({
              eventType: "create",
              userId: Meteor.userId(),
              userName: Meteor.user().fullName(),
              collectionName: "Patients"
            });
          }
        }
      });
    } else {
      console.log('Not authorized.  Try logging in or setting NIGHTWATCH=true')
    }  
  },
  initializePatient:function(){
    if (process.env.NIGHTWATCH || this.userId || (["JaneDoe", 'init', 'initone'].includes(process.env.Patients))) {
        console.log('-----------------------------------------');
        console.log('No records found in Patients collection.  Lets create some...');
    
        var defaultPatient = {
            '_id': 'janedoe',
            'meta': {
              'tag': ['test']
            },
            'name' : [
            {
                'text' : 'Jane Doe',
                'resourceType' : 'HumanName'
            }
            ],
            'active' : true,
            'gender' : 'female',
            'identifier' : [
            {
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
            }
            ],
            'birthdate' : new Date(1970, 1, 25),
            'resourceType' : 'Patient'
        };
    
        if(Patients.findOne({_id: 'janedoe'}).count() === 0){
          Meteor.call('createPatient', defaultPatient);
        }
    } else {
      console.log('Not authorized.  Try logging in or setting NIGHTWATCH=true')
    }  
  },
  'Patients/drop': function(){
    console.log('-----------------------------------------');
    console.log('Dropping patients... ');

    if (process.env.NIGHTWATCH || this.userId) {
        Patients.find().forEach(function(patient){
            Patients.remove({_id: patient._id});
        });    
    } else {
      console.log('Not authorized.  Try logging in or setting NIGHTWATCH=true')
    }
  }
});
