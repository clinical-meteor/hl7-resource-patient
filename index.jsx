import React from 'react';

// import PatientDetail from './client/react/PatientDetail.js';
// import PatientPickList from './client/react/PatientPickList.js';
// import PatientsPage from './client/react/PatientsPage.js';
// import PatientTable from './client/react/PatientTable.js';
// import { insertPatient, removePatientById, updatePatient } from './lib/methods.js';

// import {PatientTable as PatientsTable} from './client/react/PatientTable';
// import PatientDetail from './client/react/PatientDetail';
// import PatientCard from './client/react/PatientCard';
// import PatientTable from './client/react/PatientTable';

import PatientsPage from './client/react/PatientsPage';
// import { PatientCard, PatientDetail, PatientTable } from 'material-fhir-ui';
// import { Patient, Patients, PatientSchema, PatientDstu2, PatientStu3 } from './lib/Patients';

// const PatientTables = PatientTable;

import { FaUserInjured } from 'react-icons/fa';

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
  'icon': <FaUserInjured />
}];

export { 
  SidebarElements, 
  DynamicRoutes, 

  PatientsPage
  // PatientTable,
  // PatientsTable,
  // PatientDetail,
  // PatientCard,

  // Patient,
  // Patients,
  // PatientSchema,
  // PatientDstu2, 
  // PatientStu3
};


