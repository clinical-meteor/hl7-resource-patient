Session.setDefault( 'patientSearchFilter', '' );
Session.setDefault( 'tableLimit', 20 );
Session.setDefault( 'paginationCount', 1 );
Session.setDefault( 'selectedPagination', 0 );
Session.setDefault( 'skipCount', 0 );



//------------------------------------------------------------------------------
// ROUTING

Router.route( '/list/patients/', {
  name: 'patientsListPage',
  template: 'patientsListPage',
  data: function () {
    return Patients.find();
  }
});

//------------------------------------------------------------------------------
// TEMPLATE INPUTS

Template.patientsListPage.events( {
  'click .addRecordIcon': function () {
    Router.go( '/insert/patient' );
  },
  'click .patientItem': function () {
    Router.go( '/view/patient/' + this._id );
  },
  // use keyup to implement dynamic filtering
  // keyup is preferred to keypress because of end-of-line issues
  'keyup #patientSearchInput': function () {
    Session.set( 'patientSearchFilter', $( '#patientSearchInput' ).val() );
  }
} );


//------------------------------------------------------------------------------
// TEMPLATE OUTPUTS


var OFFSCREEN_CLASS = 'off-screen';
var EVENTS = 'webkitTransitionEnd oTransitionEnd transitionEnd msTransitionEnd transitionend';

// Template.patientsListPage.rendered = function () {
//   console.log( 'trying to update layout...' );
//
//   Template.appLayout.delayedLayout( 20 );
// };


Template.patientsListPage.helpers( {
  dateOfBirth: function(){
    return moment(this.birthDate).format("MMM DD, YYYY");
  },
  getName: function(){
    return this.name[0].text;
  },
  hasNoContent: function () {
    if ( Patients.find().count() === 0 ) {
      return true;
    } else {
      return false;
    }
  },
  patientsList: function () {
    Session.set( 'receivedData', new Date() );

    Template.appLayout.delayedLayout( 20 );

    return Patients.find();
    // return Patients.find( {
    //   'name.$.text': {
    //     $regex: Session.get( 'patientSearchFilter' ),
    //     $options: 'i'
    //   }
    // } );
  }
} );
