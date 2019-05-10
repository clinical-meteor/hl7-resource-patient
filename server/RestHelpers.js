import { get } from 'lodash';

export const RestHelpers = {
    fhirVersion: 'fhir-3.0.0',
    disableOauth: true,
    isDebug: process.env.DEBUG || true,
    isTrace: process.env.TRACE,
    noAuth: process.env.NOAUTH,
    logging: function(req, route){
        if(this.isDebug){
            console.log(route + get(req, 'params.id'));
        }
        if(this.isTrace){
            console.log(req);
        }
    },
    setHeaders: function(res){
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("content-type", "application/fhir+json; charset=utf-8");
    },  
    setAdditionalHeadersForResponses: function(res){
      res.setHeader("Last-Modified", new Date());
      res.setHeader("ETag", "3.0.0");
    },  
  // this is temporary fix until PR 132 can be merged in
    // https://github.com/stubailo/meteor-rest/pull/132
    sendResult: function (res, options) {
        options = options || {};
      
        // Set status code on response
        res.statusCode = options.code || 200;
      
        // Set response body
        if (options.data !== undefined) {
          var shouldPrettyPrint = (process.env.NODE_ENV === 'development');
          var spacer = shouldPrettyPrint ? 2 : null;
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
    },
    oauthServerCheck: function(req){
      if(typeof oAuth2Server !== 'object'){
        // no oAuth server installed; Not Implemented
        JsonRoutes.sendResult(res, {
          code: 501
        });  
      }
    },
    returnPostResponseAfterAccessCheck: function(req, res, callback){
      var accessTokenStr = get(req, 'params.access_token') || get(req, 'query.access_token');
      var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});
  
      if (accessToken || this.noAuth || this.disableOauth) {
  
        if (accessToken) {
          isTrace && console.log('accessToken', accessToken);
          isTrace && console.log('accessToken.userId', accessToken.userId);
        }
  
        let filter = RestHelpers.generateFilter(req);
        let pagination = RestHelpers.generatePagination(req);
      
        callback(req, res, filter, pagination);

      } else {
        // Unauthorized
        JsonRoutes.sendResult(res, {
          code: 401
        });
      }
    },
    returnGetResponseAfterAccessCheck: function(req, res, callback){
      var accessTokenStr = get(req, 'params.access_token') || get(req, 'query.access_token');
      var accessToken = oAuth2Server.collections.accessToken.findOne({accessToken: accessTokenStr});
  
      if (accessToken || this.noAuth || this.disableOauth) {
  
        if (accessToken) {
          isTrace && console.log('accessToken', accessToken);
          isTrace && console.log('accessToken.userId', accessToken.userId);
        }
      
        let dataPayload = callback(req, res);
  
        if (dataPayload) {
  
          // Success
          JsonRoutes.sendResult(res, {
            code: 200,
            data: dataPayload
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
    },
    generateFilter: function(req){
      let filter = {};
      if(get(req, 'query.filter')){
        filter = JSON.parse(get(req, 'query.filter'));
      } 
      return filter;
    },
    generatePagination: function(req){
      let sort = {};
      let page = 1;
      let items_per_page = 25;
  
      if(get(req, 'query.page')){
        page = get(req, 'query.page');
      } 
      
      if(get(req, 'query.items_per_page')){
        items_per_page = get(req, 'query.items_per_page');
      } 
    
      if(get(req, 'query.sort')){
        sort[get(req, 'query.sort')] = 1;
      } 
  
      return {
        limit: items_per_page,
        sort: sort,
        skip: (page > 0 ? (page - 1) * items_per_page : 0)
      }
    }
  }

  export default RestHelpers;