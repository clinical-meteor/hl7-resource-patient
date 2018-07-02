Session.setDefault('patientReadOnly', true);


Router.map(function () {
  this.route('newPatientRoute', {
    path: '/insert/patient',
    template: 'patientUpsertPage',
    onAfterAction: function () {
      Session.set('patientReadOnly', false);
    }
  });

});
Router.route('/upsert/patient/:id', {
  name: 'upsertPatientRoute',
  template: 'patientUpsertPage',
  data: function () {
    return Patients.findOne(this.params.id);
  },
  onAfterAction: function () {
    Session.set('patientReadOnly', false);
  }
});
Router.route('/view/patient/:id', {
  name: 'viewPatientRoute',
  template: 'patientUpsertPage',
  data: function () {
    return Patients.findOne(this.params.id);
  },
  onAfterAction: function () {
    Session.set('patientReadOnly', true);
  }
});


//-------------------------------------------------------------


Template.patientUpsertPage.helpers({
  getName: function(){
    return this.name[0].text;
  },
  getEmailAddress: function () {
    if (this.telecom && this.telecom[0] && (this.telecom[0].system === "email")) {
      return this.telecom[0].value;
    } else {
      return "";
    }
  },
  isNewPatient: function () {
    if (this._id) {
      return false;
    } else {
      return true;
    }
  },
  isReadOnly: function () {
    if (Session.get('patientReadOnly')) {
      return 'readonly';
    }
  },
  getPatientId: function () {
    if (this._id) {
      return this._id;
    } else {
      return '---';
    }
  }
});

Template.patientUpsertPage.events({
  'click #removeUserButton': function () {
    Patients.remove(this._id, function (error, result) {
      if (error) {
        console.log("error", error);
      };
      if (result) {
        Router.go('/list/patients');
      }
    });
  },
  'click #saveUserButton': function () {
    //console.log( 'this', this );

    Template.patientUpsertPage.savePatient(this);
    Session.set('patientReadOnly', true);
  },
  'click .barcode': function () {
    // TODO:  refactor to Session.toggle('patientReadOnly')
    if (Session.equals('patientReadOnly', true)) {
      Session.set('patientReadOnly', false);
    } else {
      Session.set('patientReadOnly', true);
      console.log('Locking the patient...');
      Template.patientUpsertPage.savePatient(this);
    }
  },
  'click #lockPatientButton': function () {
    //console.log( 'click #lockPatientButton' );

    if (Session.equals('patientReadOnly', true)) {
      Session.set('patientReadOnly', false);
    } else {
      Session.set('patientReadOnly', true);
    }
  },
  'click #patientListButton': function (event, template) {
    Router.go('/list/patients');
  },
  'click .imageGridButton': function (event, template) {
    Router.go('/grid/patients');
  },
  'click .tableButton': function (event, template) {
    Router.go('/table/patients');
  },
  'click #previewPatientButton': function () {
    Router.go('/customer/' + this._id);
  },
  'click #upsertPatientButton': function () {
    console.log('creating new Patients...');
    Template.patientUpsertPage.savePatient(this);
  }
});


Template.patientUpsertPage.savePatient = function (patient) {
  // TODO:  add validation functions

  if (patient._id) {
    var patientOptions = {
      patientname: $('#patientnameInput').val(),
      emails: [{
        address: $('#patientEmailInput').val()
      }],
      profile: {
        fullName: $('#patientFullNameInput').val(),
        avatar: $('#patientAvatarInput').val(),
        description: $('#patientDescriptionInput').val()
      }
    };

    Patients.update({
      _id: patient._id
    }, {
      $set: patientOptions
    }, function (error, result) {
      if (error) console.log(error);
      Router.go('/view/patient/' + patient._id);
    });

    if (patient.emails[0].address !== $('#patientEmailInput')
      .val()) {
      var options = {
        patientId: patient._id,
        email: $('#patientEmailInput')
          .val()
      };
      Meteor.call('updateEmail', options);
    }


  } else {
    var patientOptions = {
      patientname: $('#patientnameInput').val(),
      email: $('#patientEmailInput').val(),
      profile: {
        fullName: $('#patientFullNameInput').val(),
        avatar: $('#patientAvatarInput').val(),
        description: $('#patientDescriptionInput').val()
      }
    };
    //console.log( 'patientOptions', patientOptions );

    patientOptions.password = $('#patientnameInput')
      .val();
    Meteor.call('addUser', patientOptions, function (error, result) {
      if (error) {
        console.log('error', error);
      }
      if (result) {
        console.log('result', result);
        Router.go('/view/patient/' + result);
      }
    });

  }
};
