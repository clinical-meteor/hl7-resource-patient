import { CardActions, CardText, DatePicker, Toggle, RaisedButton, TextField } from 'material-ui';
import { get, has, set } from 'lodash';
import { Row, Col } from 'react-bootstrap';
import moment from 'moment';

import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import PropTypes from 'prop-types';

import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';


const styles = {
  block: {
    maxWidth: 250,
  },
  toggle: {
    marginTop: 16,
  },
  thumbOff: {
    backgroundColor: '#ffcccc',
  },
  trackOff: {
    backgroundColor: '#ff9d9d',
  },
  thumbSwitched: {
    backgroundColor: 'red',
  },
  trackSwitched: {
    backgroundColor: '#ff9d9d',
  },
  labelStyle: {
    color: 'red',
  },
};

export class PatientDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      patientId: false,
      patient: {
        resourceType : 'Patient',
        name : [{
          text : '',
          prefix: [''],
          family: [''],
          given: [''],
          suffix: [''],
          resourceType : 'HumanName'
        }],
        active : true,
        gender : "",
        birthDate : '',
        photo : [{
          url: ""
        }],
        identifier: [{
          use: 'usual',
          type: {
            coding: [
              {
                system: 'http://hl7.org/fhir/v2/0203',
                code: 'MR'
              }
            ]
          },
          value: ''
        }],
        deceasedBoolean: false,
        multipleBirthBoolean: false,
        maritalStatus: {
          text: ''
        },
        contact: [],
        animal: {
          species: {
            text: 'Human'
          }
        },
        communication: [{
          language: {
            text: 'English'
          }
        }],
        careProvider: [{
          display: '',
          reference: ''
        }],
        managingOrganization: {
          reference: '',
          display: ''
        }
      },
      form: {
        prefix: '',
        family: '',
        given: '',
        suffix: '',
        identifier: '',
        deceased: false,
        multipleBirth: false,
        maritalStatus: '',
        species: '',
        language: ''
      }
    }
  }
  dehydrateFhirResource(patient) {
    let formData = Object.assign({}, this.state.form);

    formData.prefix = get(patient, 'name[0].prefix[0]')
    formData.family = get(patient, 'name[0].family[0]')
    formData.given = get(patient, 'name[0].given[0]')
    formData.suffix = get(patient, 'name[0].suffix[0]')
    formData.identifier = get(patient, 'identifier[0].value')
    formData.deceased = get(patient, 'deceasedBoolean')
    formData.gender = get(patient, 'gender')
    formData.multipleBirth = get(patient, 'multipleBirthBoolean')
    formData.maritalStatus = get(patient, 'maritalStatus.text')
    formData.species = get(patient, 'animal.species.text')
    formData.language = get(patient, 'communication[0].language.text')
    formData.birthDate = moment(patient.birthDate).format("YYYY-MM-DD")

    return formData;
  }
  shouldComponentUpdate(nextProps){
    process.env.NODE_ENV === "test" && console.log('PatientDetail.shouldComponentUpdate()', nextProps, this.state)
    let shouldUpdate = true;

    // both false; don't take any more updates
    if(nextProps.patient === this.state.patient){
      shouldUpdate = false;
    }

    // received an patient from the table; okay lets update again
    if(nextProps.patientId !== this.state.patientId){
      this.setState({patientId: nextProps.patientId})
      
      if(nextProps.patient){
        this.setState({patient: nextProps.patient})     
        this.setState({form: this.dehydrateFhirResource(nextProps.patient)})       
      }
      shouldUpdate = true;
    }
 
    return shouldUpdate;
  }
  getMeteorData() {
    let data = {
      patientId: this.props.patientId,
      patient: false,
      form: this.state.form
    };

    if(this.props.patient){
      data.patient = this.props.patient;
    }
    if(this.props.displayBirthdate){
      data.displayBirthdate = this.props.displayBirthdate;
    }

    if(process.env.NODE_ENV === "test") console.log("PatientDetail[data]", data);
    return data;
  }

  render() {
    if(process.env.NODE_ENV === "test") console.log('PatientDetail.render()', this.state)
    let formData = this.state.form;

    return (
      <div id={this.props.id} className="patientDetail">
        <CardText>
          <Row>
            <Col md={4}>
              <TextField
                id='mrnInput'
                ref='identifier'
                name='identifier'
                floatingLabelText='Identifier (Medical Record Number)'
                value={ get(formData, 'identifier', '')}
                onChange={ this.changeState.bind(this, 'identifier')}
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
            <Col md={3} mdOffset={5}>
              <br />
              <Toggle
                label="Deceased"
                labelPosition="right"
                defaultToggled={false}
                style={styles.toggle}
              />
            </Col>
          </Row>
          <Row>
            <Col md={1}>
              <TextField
                id='prefixInput'
                ref='prefix'
                name='prefix'
                floatingLabelText='Prefix'
                value={ get(formData, 'prefix', '')}
                onChange={ this.changeState.bind(this, 'prefix')}
                hintText=''
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
            <Col md={5}>
              <TextField
                id='givenInput'
                ref='given'
                name='given'
                floatingLabelText='Given Name'
                hintText='Jane'
                value={ get(formData, 'given', '')}
                onChange={ this.changeState.bind(this, 'given')}
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
            <Col md={3}>
              <TextField
                id='familyInput'
                ref='family'
                name='family'
                floatingLabelText='Family Name'
                hintText='Doe'
                value={ get(formData, 'family', '')}
                onChange={ this.changeState.bind(this, 'family')}
                floatingLabelFixed={true}
                fullWidth
                /><br/>

            </Col>
            <Col md={3}>
              <TextField
                id='suffixInput'
                ref='suffix'
                name='suffix'
                floatingLabelText='Suffix / Maiden'
                hintText=''
                value={ get(formData, 'suffix', '')}
                onChange={ this.changeState.bind(this, 'suffix')}
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
          </Row>
          <Row>
            <Col md={3}>
              <TextField
                id='maritalStatusInput'
                ref='maritalStatus'
                name='maritalStatus'
                floatingLabelText='Marital Status'
                hintText='single | maried | other'
                value={ get(formData, 'maritalStatus', '')}
                onChange={ this.changeState.bind(this, 'maritalStatus')}
                floatingLabelFixed={false}
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
            <Col md={3}>
              <TextField
                id='genderInput'
                ref='gender'
                name='gender'
                floatingLabelText='Gender'
                hintText='male | female | unknown'
                value={ get(formData, 'gender', '')}
                onChange={ this.changeState.bind(this, 'gender')}
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
            <Col md={3}>
              {/* <br />
              { this.renderDatePicker(true, get(formData, 'birthDate') ) } */}

              <TextField
                id='birthDateInput'
                ref='birthDate'
                name='birthDate'
                type='date'
                floatingLabelText='Birthdate'
                // hintText='YYYY-MM-DD'
                value={ get(formData, 'birthDate', '')}
                onChange={ this.changeState.bind(this, 'birthDate')}
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
            <Col md={3} >
              <br />
              <Toggle
                label="Multiple Birth"
                defaultToggled={false}
                labelPosition="right"
                style={styles.toggle}
              />              
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <TextField
                id='photoInput'
                ref='photo'
                name='photo'
                floatingLabelText='Photo'
                hintText='http://somewhere.com/image.jpg'
                value={ get(formData, 'photo', '')}
                onChange={ this.changeState.bind(this, 'photo')}
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
            <Col md={3}>
              <TextField
                id='speciesInput'
                ref='species'
                name='species'
                floatingLabelText='Species'
                value={ get(formData, 'species', '')}
                hintText='Human'
                onChange={ this.changeState.bind(this, 'species')}
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
            <Col md={3}>
              <TextField
                id='languageInput'
                ref='language'
                name='language'
                floatingLabelText='Language'
                value={ get(formData, 'language', '')}
                onChange={ this.changeState.bind(this, 'language')}
                hintText='English'
                floatingLabelFixed={true}
                fullWidth
                /><br/>
            </Col>
          </Row>


        </CardText>
        <CardActions>
          { this.determineButtons(this.data.patientId) }
        </CardActions>
      </div>
    );
  }
  renderDatePicker(displayDatePicker, birthDate){
    if (displayDatePicker) {
      console.log('renderDatePicker', displayDatePicker, birthDate, typeof birthDate)

      let javascriptDate;
      let momentDate;

      if(typeof birthDate === "string"){
        momentDate = moment(birthDate).toDate();
      } else {
        momentDate = birthDate;
      }
    
      console.log('javascriptDate', javascriptDate)
      console.log('momentDate', momentDate)

      return (
        <DatePicker 
          name='birthDate'
          hintText="Birthdate" 
          container="inline" 
          mode="landscape"
          value={ momentDate ? momentDate : null}    
          onChange={ this.changeState.bind(this, 'birthDate')}      
          floatingLabelFixed={true}
          fullWidth
        />
      );
    }
  }
  determineButtons(patientId){
    if (patientId) {
      return (
        <div>
          <RaisedButton id='updatePatientButton' className='updatePatientButton' label="Save" primary={true} onClick={this.handleSaveButton.bind(this)} style={{marginRight: '20px'}} />
          <RaisedButton id='deletePatientButton' label="Delete" onClick={this.handleDeleteButton.bind(this)} />
        </div>
      );
    } else {
      return(
        <RaisedButton id='savePatientButton'  className='savePatientButton' label="Save" primary={true} onClick={this.handleSaveButton.bind(this)} />
      );
    }
  }

  updateFormData(formData, field, textValue){
    if(process.env.NODE_ENV === "test") console.log("PatientDetail.updateFormData", formData, field, textValue);

    switch (field) {
      case "prefix":
        set(formData, 'prefix', textValue)
        break;
      case "family":
        set(formData, 'family', textValue)
        break;
      case "given":
        set(formData, 'given', textValue)
        break;        
      case "suffix":
        set(formData, 'suffix', textValue)
        break;
      case "identifier":
        set(formData, 'identifier', textValue)
        break;
      case "gender":
        set(formData, 'gender', textValue)
        break;
      case "maritalStatus":
        set(formData, 'maritalStatus', textValue)
        break;
      case "deceased":
        set(formData, 'deceased', textValue)
        break;
      case "multipleBirth":
        set(formData, 'multipleBirth', textValue)
        break;
      case "species":
        set(formData, 'species', textValue)
        break;
      case "language":
        set(formData, 'language', textValue)
        break;
      case "photo":
        set(formData, 'photo', textValue)
        break;
      case "birthDate":
        set(formData, 'birthDate', textValue)
        break;
      default:
    }

    if(process.env.NODE_ENV === "test") console.log("formData", formData);
    return formData;
  }
  updatePatient(patientData, field, textValue){
    if(process.env.NODE_ENV === "test") console.log("PatientDetail.updatePatient", patientData, field, textValue);

    switch (field) {
      case "prefix":
        set(patientData, 'name[0].prefix[0]', textValue)
        break;
      case "family":
        set(patientData, 'name[0].family[0]', textValue)
        break;
      case "given":
        set(patientData, 'name[0].given[0]', textValue)
        break;        
      case "suffix":
        set(patientData, 'name[0].suffix[0]', textValue)
        break;
      case "identifier":
        set(patientData, 'identifier[0].value', textValue)
        break;
      case "deceased":
        set(patientData, 'deceasedBoolean', textValue)
        break;
      case "multipleBirth":
        set(patientData, 'multipleBirthBoolean', textValue)
        break;
      case "gender":
        set(patientData, 'gender', textValue)
        break;
      case "maritalStatus":
        set(patientData, 'maritalStatus.text', textValue)
        break;
      case "species":
        set(patientData, 'animal.species.text', textValue)
        break;
      case "language":
        set(patientData, 'communication[0].language.text', textValue)
        break;  
      case "photo":
        set(patientData, 'photo[0].url', textValue)
        break;
      case "birthDate":
        set(patientData, 'birthDate', textValue)
        break;
    }
    return patientData;
  }
  changeState(field, event, textValue){
    if(process.env.NODE_ENV === "test") console.log("   ");
    if(process.env.NODE_ENV === "test") console.log("PatientDetail.changeState", field, textValue);
    if(process.env.NODE_ENV === "test") console.log("this.state", this.state);

    let formData = Object.assign({}, this.state.form);
    let patientData = Object.assign({}, this.state.patient);

    formData = this.updateFormData(formData, field, textValue);
    patientData = this.updatePatient(patientData, field, textValue);

    if(process.env.NODE_ENV === "test") console.log("patientData", patientData);
    if(process.env.NODE_ENV === "test") console.log("formData", formData);

    this.setState({patient: patientData})
    this.setState({form: formData})
  }


  // this could be a mixin
  handleSaveButton(){
    if(process.env.NODE_ENV === "test") console.log('^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^&&')
    console.log('Saving a new Patient...', this.state)

    let self = this;
    let fhirPatientData = Object.assign({}, this.state.patient);

    if(process.env.NODE_ENV === "test") console.log('fhirPatientData', fhirPatientData);


    let patientValidator = PatientSchema.newContext();
    console.log('patientValidator', patientValidator)
    patientValidator.validate(fhirPatientData)

    console.log('IsValid: ', patientValidator.isValid())
    // console.log('ValidationErrors: ', patientValidator.validationErrors());

    if (this.state.patientId) {
      if(process.env.NODE_ENV === "test") console.log("Updating patient...");

      delete fhirPatientData._id;

      // not sure why we're having to respecify this; fix for a bug elsewhere
      fhirPatientData.resourceType = 'Patient';

      Patients._collection.update({_id: this.state.patientId}, {$set: fhirPatientData }, function(error, result){
        if (error) {
          if(process.env.NODE_ENV === "test") console.log("Patients.insert[error]", error);
          Bert.alert(error.reason, 'danger');
        }
        if (result) {
          HipaaLogger.logEvent({eventType: "update", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Patients", recordId: self.state.patientId});
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
          HipaaLogger.logEvent({eventType: "create", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Patients", recordId: self.state.patientId});
          Session.set('patientPageTabIndex', 1);
          Session.set('selectedPatientId', false);
          Bert.alert('Patient added!', 'success');
        }
      });
    }
  }

  handleCancelButton(){
    Session.set('patientPageTabIndex', 1);
  }

  handleDeleteButton(){
    let self = this;
    Patients._collection.animalremove({_id: this.state.patientId}, function(error, result){
      if (error) {
        if(process.env.NODE_ENV === "test") console.log('Patients.insert[error]', error);
        Bert.alert(error.reason, 'danger');
      }
      if (result) {
        HipaaLogger.logEvent({eventType: "delete", userId: Meteor.userId(), userName: Meteor.user().fullName(), collectionName: "Patients", recordId: self.state.patientId});
        Session.set('patientPageTabIndex', 1);
        Session.set('selectedPatientId', false);
        Bert.alert('Patient removed!', 'success');
      }
    });
  }
}

PatientDetail.propTypes = {
  id: PropTypes.string,
  fhirVersion: PropTypes.string,
  patientId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  patient: PropTypes.oneOfType([PropTypes.object, PropTypes.bool])
};
ReactMixin(PatientDetail.prototype, ReactMeteorData);
export default PatientDetail;