import React from 'react';

import PatientsPage from './client/PatientsPage';

// import { PatientCard, PatientDetail, PatientTable } from 'material-fhir-ui';
// import { Patient, Patients, PatientSchema, PatientDstu2, PatientStu3 } from './lib/Patients';

// const PatientTables = PatientTable;

var DynamicRoutes = [{
  'name': 'PatientPage',
  'path': '/patients',
  'component': PatientsPage,
  'requireAuth': true
}];

var SidebarElements = [{
  'primaryText': 'Patients',
  'to': '/patients',
  'href': '/patients',
  'iconName': "FaUserInjured"
}];

export { 
  SidebarElements, 
  DynamicRoutes, 

  PatientsPage
};


