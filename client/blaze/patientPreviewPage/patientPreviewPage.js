
Router.map(function(){
  this.route('patientPreviewPage', {
    path: '/patient/:id',
    template: 'patientPreviewPage',
    data: function () {
      return Patients.findOne({_id: this.params.id});
    }
  });
});


Template.patientPreviewPage.events({
  "click .listButton": function(event, template){
    Router.go('/list/patients');
  },
  "click .imageGridButton": function(event, template){
    Router.go('/grid/patients');
  },
  "click .tableButton": function(event, template){
    Router.go('/table/patients');
  },
  "click .indexButton": function(event, template){
    Router.go('/list/patients');
  },
  "click .patientId": function(){
    Router.go('/upsert/patient/' + this._id);
  }
});
