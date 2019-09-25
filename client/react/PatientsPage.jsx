import { CardText, CardTitle, RaisedButton, Tab, Tabs } from 'material-ui';
import { Glass, GlassCard, VerticalCanvas, FullPageCanvas } from 'meteor/clinical:glass-ui';

import { PatientTable, PatientDetail } from 'material-fhir-ui';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { HTTP } from 'meteor/http';

import { get } from 'lodash';

let defaultPatient = {
  index: 2,
  id: '',
  username: '',
  email: '',
  given: '',
  family: '',
  gender: ''
};
Session.setDefault('patientFormData', defaultPatient);
Session.setDefault('patientSearchFilter', '');
Session.setDefault('selectedPatientId', false);
Session.setDefault('fhirVersion', 'v1.0.2');

export class PatientsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patientId: false,
      patient: {}
    }
  }

  getMeteorData() {
    let data = {
      style: {
        opacity: Session.get('globalOpacity'),
        tab: {
          borderBottom: '1px solid lightgray',
          borderRight: 'none'
        }
      },
      tabIndex: Session.get('patientPageTabIndex'),
      patientSearchFilter: Session.get('patientSearchFilter'),
      fhirVersion: Session.get('fhirVersion'),
      selectedPatientId: Session.get("selectedPatientId"),
      paginationLimit: 100,
      selectedPatient: false,
      selected: [],
      patients: []
    };

    // number of items in the table should be set globally
    if (get(Meteor, 'settings.public.defaults.paginationLimit')) {
      data.paginationLimit = get(Meteor, 'settings.public.defaults.paginationLimit');
    }

    if (Session.get('selectedPatientId')){
      data.selectedPatient = Patients.findOne({_id: Session.get('selectedPatientId')});
      this.state.patient = Patients.findOne({_id: Session.get('selectedPatientId')});
      this.state.patientId = Session.get('selectedPatientId');
    } else {
      data.selectedPatient = false;
      this.state.patientId = false;
      this.state.patient = {}
    }

    data.patients = Patients.find().fetch();

    data.style = Glass.blur(data.style);
    data.style.appbar = Glass.darkroom(data.style.appbar);
    data.style.tab = Glass.darkroom(data.style.tab);

    if(process.env.NODE_ENV === "test") console.log("PatientsPage[data]", data);
    return data;
  }
  onCancelUpsertPatient(context){
    Session.set('patientPageTabIndex', 1);
  }
  onDeletePatient(context){
    Patients._collection.remove({_id: context.state.patientId}, function(error, result){
      if (error) {
        if(process.env.NODE_ENV === "test") console.log('Patients.insert[error]', error);
        Bert.alert(error.reason, 'danger');
      }
      if (result) {
        HipaaLogger.logEvent({eventType: "delete", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Patients", recordId: context.state.patientId});
        Session.set('patientPageTabIndex', 1);
        Session.set('selectedPatientId', false);
        Bert.alert('Patient removed!', 'success');
      }
    });
  }
  onUpsertPatient(context){
    //if(process.env.NODE_ENV === "test") console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^&&')
    console.log('Saving a new Patient...', context.state)

    if(get(context, 'state.patient')){
      let self = context;
      let fhirPatientData = Object.assign({}, context.state.patient);
  
      if(process.env.NODE_ENV === "test") console.log('fhirPatientData', fhirPatientData);
  
  
      let patientValidator = PatientSchema.newContext();
      // console.log('patientValidator', patientValidator)
      patientValidator.validate(fhirPatientData)
  
      if(process.env.NODE_ENV === "development"){
        console.log('IsValid: ', patientValidator.isValid())
        console.log('ValidationErrors: ', patientValidator.validationErrors());
  
      }
  
      console.log('Checking context.state again...', context.state)
      if (get(context, 'state.patientId')) {
        if(process.env.NODE_ENV === "development") {
          console.log("Updating patient...");
        }

        delete fhirPatientData._id;
  
        // not sure why we're having to respecify this; fix for a bug elsewhere
        fhirPatientData.resourceType = 'Patient';
  
        Patients._collection.update({_id: context.state.patientId}, {$set: fhirPatientData }, function(error, result){
          if (error) {
            if(process.env.NODE_ENV === "test") console.log("Patients.insert[error]", error);
            Bert.alert(error.reason, 'danger');
          }
          if (result) {
            HipaaLogger.logEvent({eventType: "update", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Patients", recordId: context.state.patientId});
            Session.set('selectedPatientId', false);
            Session.set('patientPageTabIndex', 1);
            Bert.alert('Patient added!', 'success');
          }
        });
      } else {
        if(process.env.NODE_ENV === "test") console.log("Creating a new patient...", fhirPatientData);
  
        Patients._collection.insert(fhirPatientData, function(error, result) {
          if (error) {
            if(process.env.NODE_ENV === "test")  console.log('Patients.insert[error]', error);
            Bert.alert(error.reason, 'danger');
          }
          if (result) {
            HipaaLogger.logEvent({eventType: "create", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Patients", recordId: context.state.patientId});
            Session.set('patientPageTabIndex', 1);
            Session.set('selectedPatientId', false);
            Bert.alert('Patient added!', 'success');
          }
        });
      }
    } 
  }
  onTableRowClick(patientId){
    Session.set('selectedPatientId', patientId);
    Session.set('selectedPatient', Patients.findOne(patientId));

  }
  onTableCellClick(id){
    Session.set('patientsUpsert', false);
    Session.set('selectedPatientId', id);
    Session.set('patientPageTabIndex', 2);

  }
  tableActionButtonClick(id){
    let patient = Patients.findOne({_id: id});

    console.log("PatientTable.onSend()", patient);

    var httpEndpoint = "http://localhost:8080";
    if (get(Meteor, 'settings.public.interfaces.default.channel.endpoint')) {
      httpEndpoint = get(Meteor, 'settings.public.interfaces.default.channel.endpoint');
    }
    HTTP.post(httpEndpoint + '/Patient', {
      data: patient
    }, function(error, result){
      if (error) {
        console.log("error", error);
      }
      if (result) {
        console.log("result", result);
      }
    });
  }
  handleTabChange(index){
    Session.set('patientPageTabIndex', index);
  }

  onNewTab(){
    Session.set('selectedPatientId', false);
    Session.set('patientUpsert', false);
  }

  render() {
    console.log('React.version: ' + React.version);

    return (
      <div id="patientsPage">
        <FullPageCanvas>
          <GlassCard height="auto">
            <CardTitle
              title="Patients"
            />
            <CardText>
              <Tabs id='patientsPageTabs' default value={this.data.tabIndex} onChange={this.handleTabChange} initialSelectedIndex={1}>
                 <Tab className="newPatientTab" label='New' style={this.data.style.tab} onActive={ this.onNewTab } value={0}>
                   <PatientDetail 
                      fhirVersion={ this.data.fhirVersion }
                      id='newPatient' 
                      onDelete={ this.onDeletePatient }
                      onUpsert={ this.onUpsertPatient }
                      onCancel={ this.onCancelUpsertPatient } 
                      />
                 </Tab>
                 <Tab className="patientListTab" label='Patients' onActive={this.handleActive} style={this.data.style.tab} value={1}>
                   <PatientTable 
                      noDataMessagePadding={100}
                      patients={ this.data.patients }
                      paginationLimit={ this.pagnationLimit }
                      appWidth={ Session.get('appWidth') }
                      actionButtonLabel="Send"
                      onRowClick={ this.onTableRowClick }
                      onCellClick={ this.onTableCellClick }
                      onActionButtonClick={this.tableActionButtonClick}
                      />
                 </Tab>
                 <Tab className="patientDetailTab" label='Detail' onActive={this.handleActive} style={this.data.style.tab} value={2}>
                   <PatientDetail 
                      id='patientDetails' 
                      fhirVersion={ this.data.fhirVersion }
                      patient={ this.data.selectedPatient }
                      patientId={ this.data.selectedPatientId }
                      onDelete={ this.onDeletePatient }
                      onUpsert={ this.onUpsertPatient }
                      onCancel={ this.onCancelUpsertPatient } 
                    />
                 </Tab>
             </Tabs>


            </CardText>
          </GlassCard>
        </FullPageCanvas>
      </div>
    );
  }
}



ReactMixin(PatientsPage.prototype, ReactMeteorData);

export default PatientsPage;