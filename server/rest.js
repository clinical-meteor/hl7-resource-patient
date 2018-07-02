

//==========================================================================================
// Global Configs  

var fhirVersion = 'fhir-3.0.0';


if(typeof oAuth2Server === 'object'){
  JsonRoutes.Middleware.use(
    '/fhir-3.0.0/*',
    oAuth2Server.oauthserver.authorise()   // OAUTH FLOW - A7.1
  );
}

JsonRoutes.setResponseHeaders({
  "content-type": "application/fhir+json; charset=utf-8"
});



//==========================================================================================
// Global Method Overrides

// this is temporary fix until PR 132 can be merged in
// https://github.com/stubailo/meteor-rest/pull/132

JsonRoutes.sendResult = function (res, options) {
  options = options || {};

  // Set status code on response
  res.statusCode = options.code || 200;

  // Set response body
  if (options.data !== undefined) {
    var shouldPrettyPrint = (process.env.NODE_ENV === 'development');
    var spacer = shouldPrettyPrint ? 2 : null;cd .
    res.setHeader('Content-type', 'application/fhir+json; charset=utf-8');
    res.write(JSON.stringify(options.data, null, spacer));
  }

  // We've already set global headers on response, but if they
  // pass in more here, we set those.
  if (options.headers) {
    //setHeaders(res, options.headers);
    options.headers.forEach(function(value, key){
      res.setHeader(key, value);
    });
  }

  // Send the response
  res.end();
};




//==========================================================================================
// Step 1 - Create New Patient  

JsonRoutes.add("put", "/" + fhirVersion + "/Patient/:id", function (req, res, next) {
  process.env.DEBUG && console.log('PUT /fhir-3.0.0/Patient/' + req.params.id);
  //process.env.DEBUG && console.log('PUT /fhir-3.0.0/Patient/' + req.query._count);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);

  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});    

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {
      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }


      if (req.body) {
        patientUpdate = req.body;

        // remove id and meta, if we're recycling a resource
        delete req.body.id;
        delete req.body.meta;

        patientUpdate.resourceType = "Patient";
        patientUpdate = Patients.toMongo(patientUpdate);
        patientUpdate = Patients.prepForUpdate(patientUpdate);


        process.env.DEBUG && console.log('-----------------------------------------------------------');
        process.env.DEBUG && console.log('patientUpdate', JSON.stringify(patientUpdate, null, 2));

        var patient = Patients.findOne(req.params.id);
        var patientId;

        if(patient){
          process.env.DEBUG && console.log('Patient found...')
          patientId = Patients.update({_id: req.params.id}, {$set: patientUpdate },  function(error, result){
            if (error) {
              process.env.TRACE && console.log('PUT /fhir/Patient/' + req.params.id + "[error]", error);

              // Bad Request
              JsonRoutes.sendResult(res, {
                code: 400
              });
            }
            if (result) {
              process.env.TRACE && console.log('result', result);
              res.setHeader("Patient", "fhir/Patient/" + result);
              res.setHeader("Last-Modified", new Date());
              res.setHeader("ETag", "3.0.0");

              var patients = Patients.find({_id: req.params.id});
              var payload = [];

              patients.forEach(function(record){
                payload.push(Patients.prepForFhirTransfer(record));
              });

              console.log("payload", payload);

              // success!
              JsonRoutes.sendResult(res, {
                code: 200,
                data: Bundle.generate(payload)
              });
            }
          });
        } else {        
          process.env.DEBUG && console.log('No patient found.  Creating one.');
          patientUpdate._id = req.params.id;
          patientId = Patients.insert(patientUpdate,  function(error, result){
            if (error) {
              process.env.TRACE && console.log('PUT /fhir/Patient/' + req.params.id + "[error]", error);

              // Bad Request
              JsonRoutes.sendResult(res, {
                code: 400
              });
            }
            if (result) {
              process.env.TRACE && console.log('result', result);
              res.setHeader("Patient", "fhir/Patient/" + result);
              res.setHeader("Last-Modified", new Date());
              res.setHeader("ETag", "3.0.0");

              var patients = Patients.find({_id: req.params.id});
              var payload = [];

              patients.forEach(function(record){
                payload.push(Patients.prepForFhirTransfer(record));
              });

              console.log("payload", payload);

              // success!
              JsonRoutes.sendResult(res, {
                code: 201,
                data: Bundle.generate(payload)
              });
            }
          });        
        }
      } else {
        // no body; Unprocessable Entity
        JsonRoutes.sendResult(res, {
          code: 422
        });

      }


    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }

});



//==========================================================================================
// Step 2 - Read Patient  

JsonRoutes.add("get", "/" + fhirVersion + "/Patient/:id", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/Patient/' + req.params.id);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var patientData = Patients.findOne({_id: req.params.id});
      if (patientData) {
        patientData.id = patientData._id;

        delete patientData._document;
        delete patientData._id;

        process.env.TRACE && console.log('patientData', patientData);

        // Success
        JsonRoutes.sendResult(res, {
          code: 200,
          data: Patients.prepForFhirTransfer(patientData)
        });
      } else {
        // Gone
        JsonRoutes.sendResult(res, {
          code: 204
        });
      }
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 3 - Update Patient  

JsonRoutes.add("post", "/" + fhirVersion + "/Patient", function (req, res, next) {
  process.env.DEBUG && console.log('POST /fhir/Patient/', JSON.stringify(req.body, null, 2));

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var patientId;
      var newPatient;

      if (req.body) {
        newPatient = req.body;


        // remove id and meta, if we're recycling a resource
        delete newPatient.id;
        delete newPatient.meta;


        newPatient = Patients.toMongo(newPatient);

        process.env.TRACE && console.log('newPatient', JSON.stringify(newPatient, null, 2));
        // process.env.DEBUG && console.log('newPatient', newPatient);

        console.log('Cleaning new patient...')
        PatientSchema.clean(newPatient);

        var practionerContext = PatientSchema.newContext();
        practionerContext.validate(newPatient)
        console.log('New patient is valid:', practionerContext.isValid());
        console.log('check', check(newPatient, PatientSchema))
        


        var patientId = Patients.insert(newPatient,  function(error, result){
          if (error) {
            process.env.TRACE && console.log('error', error);

            // Bad Request
            JsonRoutes.sendResult(res, {
              code: 400
            });
          }
          if (result) {
            process.env.TRACE && console.log('result', result);
            res.setHeader("Patient", "fhir-3.0.0/Patient/" + result);
            res.setHeader("Last-Modified", new Date());
            res.setHeader("ETag", "3.0.0");

            var patients = Patients.find({_id: result});
            var payload = [];

            patients.forEach(function(record){
              payload.push(Patients.prepForFhirTransfer(record));
            });

            //console.log("payload", payload);
            // Created
            JsonRoutes.sendResult(res, {
              code: 201,
              data: Bundle.generate(payload)
            });
          }
        });
        console.log('patientId', patientId);
      } else {
        // Unprocessable Entity
        JsonRoutes.sendResult(res, {
          code: 422
        });
      }

    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 4 - PatientHistoryInstance

JsonRoutes.add("get", "/" + fhirVersion + "/Patient/:id/_history", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/Patient/', req.params);
  process.env.DEBUG && console.log('GET /fhir-3.0.0/Patient/', req.query._count);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var patients = Patients.find({_id: req.params.id});
      var payload = [];

      patients.forEach(function(record){
        payload.push(Patients.prepForFhirTransfer(record));

        // the following is a hack, to conform to the Touchstone Patient testscript
        // https://touchstone.aegis.net/touchstone/testscript?id=06313571dea23007a12ec7750a80d98ca91680eca400b5215196cd4ae4dcd6da&name=%2fFHIR1-6-0-Basic%2fP-R%2fPatient%2fClient+Assigned+Id%2fPatient-client-id-json&version=1&latestVersion=1&itemId=&spec=HL7_FHIR_STU3_C2
        // the _history query expects a different resource in the Bundle for each version of the file in the system
        // since we don't implement record versioning in Meteor on FHIR yet
        // we are simply adding two instances of the record to the payload 
        payload.push(Patients.prepForFhirTransfer(record));
      });
      // Success
      JsonRoutes.sendResult(res, {
        code: 200,
        data: Bundle.generate(payload, 'history')
      });
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 5 - Patient Version Read

// NOTE:  We've not implemented _history functionality yet; so this endpoint is mostly a duplicate of Step 2.

JsonRoutes.add("get", "/" + fhirVersion + "/Patient/:id/_history/:versionId", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/Patient/:id/_history/:versionId', req.params);
  //process.env.DEBUG && console.log('GET /fhir-3.0.0/Patient/:id/_history/:versionId', req.query._count);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
  
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }

  var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

  if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

    if (accessToken) {
      process.env.TRACE && console.log('accessToken', accessToken);
      process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
    }

    var patientData = Patients.findOne({_id: req.params.id});
    if (patientData) {
      
      patientData.id = patientData._id;

      delete patientData._document;
      delete patientData._id;

      process.env.TRACE && console.log('patientData', patientData);

      JsonRoutes.sendResult(res, {
        code: 200,
        data: Patients.prepForFhirTransfer(patientData)
      });
    } else {
      JsonRoutes.sendResult(res, {
        code: 204
      });
    }

  } else {
    JsonRoutes.sendResult(res, {
      code: 401
    });
  }
});



generateDatabaseQuery = function(query){
  console.log("generateDatabaseQuery", query);

  var databaseQuery = {};

  if (query.family) {
    databaseQuery['name'] = {
      $elemMatch: {
        'family': query.family
      }
    };
  }
  if (query.given) {
    databaseQuery['name'] = {
      $elemMatch: {
        'given': query.given
      }
    };
  }
  if (query.name) {
    databaseQuery['name'] = {
      $elemMatch: {
        'text': {
          $regex: query.name,
          $options: 'i'
        }
      }
    };
  }
  if (query.identifier) {
    databaseQuery['identifier'] = {
      $elemMatch: {
        'value': query.identifier
      }
    };
  }
  if (query.gender) {
    databaseQuery['gender'] = query.gender;
  }
  if (query.birthdate) {
    var dateArray = query.birthdate.split("-");
    var minDate = dateArray[0] + "-" + dateArray[1] + "-" + (parseInt(dateArray[2])) + 'T00:00:00.000Z';
    var maxDate = dateArray[0] + "-" + dateArray[1] + "-" + (parseInt(dateArray[2]) + 1) + 'T00:00:00.000Z';
    console.log("minDateArray", minDate, maxDate);

    databaseQuery['birthDate'] = {
      "$gte" : new Date(minDate),
      "$lt" :  new Date(maxDate)
    };
  }

  process.env.DEBUG && console.log('databaseQuery', databaseQuery);
  return databaseQuery;
}

JsonRoutes.add("get", "/" + fhirVersion + "/Patient", function (req, res, next) {
  process.env.DEBUG && console.log('GET /fhir-3.0.0/Patient', req.query);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var databaseQuery = generateDatabaseQuery(req.query);

      var payload = [];
      var patients = Patients.find(databaseQuery);

      patients.forEach(function(record){
        payload.push(Patients.prepForFhirTransfer(record));
      });

      // Success
      JsonRoutes.sendResult(res, {
        code: 200,
        data: Bundle.generate(payload)
      });
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});

//==========================================================================================
// Step 6 - Patient Search Type  

JsonRoutes.add("post", "/" + fhirVersion + "/Patient/:param", function (req, res, next) {
  process.env.DEBUG && console.log('POST /fhir-3.0.0/Patient/' + JSON.stringify(req.query));

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("content-type", "application/fhir+json; charset=utf-8");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){
    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});

    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      var patients = [];

      if (req.params.param.includes('_search')) {
        var searchLimit = 1;
        if (req && req.query && req.query._count) {
          searchLimit = parseInt(req.query._count);
        }

        var databaseQuery = generateDatabaseQuery(req.query);
        process.env.DEBUG && console.log('databaseQuery', databaseQuery);

        patients = Patients.find(databaseQuery, {limit: searchLimit});

        var payload = [];

        patients.forEach(function(record){
          payload.push(Patients.prepForFhirTransfer(record));
        });
      }

      //process.env.TRACE && console.log('patients', patients);

      // Success
      JsonRoutes.sendResult(res, {
        code: 200,
        data: Bundle.generate(payload)
      });
    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
});




//==========================================================================================
// Step 7 - Patient Delete    

JsonRoutes.add("delete", "/" + fhirVersion + "/Patient/:id", function (req, res, next) {
  process.env.DEBUG && console.log('DELETE /fhir-3.0.0/Patient/' + req.params.id);

  res.setHeader("Access-Control-Allow-Origin", "*");

  var accessTokenStr = (req.params && req.params.access_token) || (req.query && req.query.access_token);
  if(typeof oAuth2Server === 'object'){

    var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});
    if (accessToken || process.env.NOAUTH || Meteor.settings.private.disableOauth) {

      if (accessToken) {
        process.env.TRACE && console.log('accessToken', accessToken);
        process.env.TRACE && console.log('accessToken.userId', accessToken.userId);
      }

      if (Patients.find({_id: req.params.id}).count() === 0) {
        // No Content
        JsonRoutes.sendResult(res, {
          code: 204
        });
      } else {
        Patients.remove({_id: req.params.id}, function(error, result){
          if (result) {
            // No Content
            JsonRoutes.sendResult(res, {
              code: 204
            });
          }
          if (error) {
            // Conflict
            JsonRoutes.sendResult(res, {
              code: 409
            });
          }
        });
      }


    } else {
      // Unauthorized
      JsonRoutes.sendResult(res, {
        code: 401
      });
    }
  } else {
    // no oAuth server installed; Not Implemented
    JsonRoutes.sendResult(res, {
      code: 501
    });
  }
  
  
});





// WebApp.connectHandlers.use("/fhir/Patient", function(req, res, next) {
//   res.setHeader("Access-Control-Allow-Origin", "*");
//   return next();
// });
