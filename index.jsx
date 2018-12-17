

// import PatientDetail from './client/react/PatientDetail.js';
// import PatientPickList from './client/react/PatientPickList.js';
// import PatientsPage from './client/react/PatientsPage.js';
// import PatientTable from './client/react/PatientTable.js';
// import { insertPatient, removePatientById, updatePatient } from './lib/methods.js';

import PatientsPage from './client/react/PatientsPage';
import PatientTable from './client/react/PatientTable';
import {PatientTable as PatientsTable} from './client/react/PatientTable';
import PatientDetail from './client/react/PatientDetail';
import PatientCard from './client/react/PatientCard';

import { Patient, Patients, PatientSchema } from './lib/Patients';

var DynamicRoutes = [{
  'name': 'PatientPage',
  'path': '/patients',
  'component': PatientsPage,
  'requireAuth': true
}];

// var DynamicRoutes = [];

var SidebarElements = [{
  'primaryText': 'Patients',
  'to': '/patients',
  'href': '/patients'
}];

export { 
  SidebarElements, 
  DynamicRoutes, 

  PatientsPage,
  PatientTable,
  PatientsTable,
  PatientDetail,
  PatientCard,

  Patient,
  Patients,
  PatientSchema
};


