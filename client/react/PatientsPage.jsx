import { CardText, CardTitle } from 'material-ui/Card';
import { Tab, Tabs } from 'material-ui/Tabs';
import { Glass, GlassCard, VerticalCanvas, FullPageCanvas } from 'meteor/clinical:glass-ui';

import PatientDetail from './PatientDetail';
import PatientTable from './PatientTable';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';

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
      selectedPatient: false
    };

    
    if (Session.get('selectedPatientId')){
      data.selectedPatient = Patients.findOne({_id: Session.get('selectedPatientId')});
    } else {
      data.selectedPatient = false;
    }


    data.style = Glass.blur(data.style);
    data.style.appbar = Glass.darkroom(data.style.appbar);
    data.style.tab = Glass.darkroom(data.style.tab);

    if(process.env.NODE_ENV === "test") console.log("PatientsPage[data]", data);
    return data;
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
        <VerticalCanvas>
          <GlassCard height="auto">
            <CardTitle
              title="Patients"
            />
            <CardText>
              <Tabs id='patientsPageTabs' default value={this.data.tabIndex} onChange={this.handleTabChange} initialSelectedIndex={1}>
                 <Tab className="newPatientTab" label='New' style={this.data.style.tab} onActive={ this.onNewTab } value={0}>
                   <PatientDetail 
                      fhirVersion={ this.data.fhirVersion }
                      id='newPatient' />
                 </Tab>
                 <Tab className="patientListTab" label='Patients' onActive={this.handleActive} style={this.data.style.tab} value={1}>
                   <PatientTable 
                      showBarcodes={true} 
                      showAvatars={true} 
                      noDataMessagePadding={100}
                      />
                 </Tab>
                 <Tab className="patientDetailTab" label='Detail' onActive={this.handleActive} style={this.data.style.tab} value={2}>
                   <PatientDetail 
                      id='patientDetails' 
                      fhirVersion={ this.data.fhirVersion }
                      patient={ this.data.selectedPatient }
                      patientId={ this.data.selectedPatientId }
                    />
                 </Tab>
             </Tabs>


            </CardText>
          </GlassCard>
        </VerticalCanvas>
      </div>
    );
  }
}



ReactMixin(PatientsPage.prototype, ReactMeteorData);

export default PatientsPage;