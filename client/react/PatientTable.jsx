import { Card, CardActions, CardMedia, CardText, CardTitle, Toggle } from 'material-ui';

import FlatButton from 'material-ui/FlatButton';
import { HTTP } from 'meteor/http';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { Table } from 'react-bootstrap';
import { Session } from 'meteor/session';
import { has, get } from 'lodash';
import { TableNoData } from 'meteor/clinical:glass-ui'
import PropTypes from 'prop-types';

import { FaTags, FaCode, FaPuzzlePiece, FaLock  } from 'react-icons/fa';
import { GoTrashcan } from 'react-icons/go'

flattenPatient = function(person){
  let result = {
    _id: person._id,
    id: person.id,
    active: true,
    gender: get(person, 'gender'),
    name: '',
    mrn: '',
    birthDate: '',
    photo: "/thumbnail-blank.png",
    initials: 'abc'
  };

  result.active = get(person, 'active', true).toString();

  // there's an off-by-1 error between momment() and Date() that we want
  // to account for when converting back to a string
  result.birthDate = moment(person.birthDate).format("YYYY-MM-DD")
  result.photo = get(person, 'photo[0].url', '');
  result.identifier = get(person, 'identifier[0].value', '');

  result.maritalStatus = get(person, 'maritalStatus.text', '');
  result.deceased = get(person, 'deceasedBoolean', '');
  result.species = get(person, 'animal.species.text', '');
  result.language = get(person, 'communication[0].language.text', '');

  let nameText = get(person, 'name[0].text', '');
  if(nameText.length > 0){
    result.name = get(person, 'name[0].text', '');    
  } else {
    if(get(person, 'name[0].suffix[0]')){
      result.name = get(person, 'name[0].suffix[0]')  + ' ';
    }

    result.name = result.name + get(person, 'name[0].given[0]') + ' ' + get(person, 'name[0].family[0]');
    
    if(get(person, 'name[0].suffix[0]')){
      result.name = result.name + ' ' + get(person, 'name[0].suffix[0]');
    }
  }

  return result;
}

export class PatientTable extends React.Component {
  constructor(props) {
    super(props);
  }
  getMeteorData() {
    let data = {
      style: {
        hideOnPhone: {
          visibility: 'visible',
          display: 'table'
        },
        cellHideOnPhone: {
          visibility: 'visible',
          display: 'table',
          paddingTop: '16px',
          maxWidth: '120px'
        },
        cell: {
          paddingTop: '16px'
        },
        avatar: {
          // color: rgb(255, 255, 255);
          backgroundColor: 'rgb(188, 188, 188)',
          userSelect: 'none',
          borderRadius: '2px',
          height: '40px',
          width: '40px'
        }
      },
      selected: [],
      patients: []
    };

    let query = {};
    let options = {};

    // number of items in the table should be set globally
    if (get(Meteor, 'settings.public.defaults.paginationLimit')) {
      options.limit = get(Meteor, 'settings.public.defaults.paginationLimit');
    }
    // but can be over-ridden by props being more explicit
    if(this.props.limit){
      options.limit = this.props.limit;      
    }

    if(this.props.data){
      // console.log('this.props.data', this.props.data);

      if(this.props.data.length > 0){              
        this.props.data.forEach(function(patient){
          data.patients.push(flattenPatient(patient));
        });  
      }
    } else {
      data.patients = Patients.find().map(function(patient){
        return flattenPatient(patient);
      });
    }


    if (Session.get('appWidth') < 768) {
      data.style.hideOnPhone.visibility = 'hidden';
      data.style.hideOnPhone.display = 'none';
      data.style.cellHideOnPhone.visibility = 'hidden';
      data.style.cellHideOnPhone.display = 'none';
    } else {
      data.style.hideOnPhone.visibility = 'visible';
      data.style.hideOnPhone.display = 'table-cell';
      data.style.cellHideOnPhone.visibility = 'visible';
      data.style.cellHideOnPhone.display = 'table-cell';
    }

    console.log("PatientTable[data]", data);
    return data;
  }
  imgError(avatarId) {
    this.refs[avatarId].src = Meteor.absoluteUrl() + 'noAvatar.png';
  }
  rowClick(id){
    Session.set('patientsUpsert', false);
    Session.set('selectedPatientId', id);
    Session.set('patientPageTabIndex', 2);
  }
  renderRowAvatarHeader(){
    if (get(Meteor, 'settings.public.defaults.avatars') && (this.props.showAvatars === true)) {
      return (
        <th className='avatar'>photo</th>
      );
    }
  }
  renderRowAvatar(patient, avatarStyle){
    //console.log('renderRowAvatar', patient, avatarStyle)
    
    if (get(Meteor, 'settings.public.defaults.avatars') && (this.props.showAvatars === true)) {
      return (
        <td className='avatar'>
          <img src={patient.photo} ref={patient._id} onError={ this.imgError.bind(this, patient._id) } style={avatarStyle}/>
        </td>
      );
    }
  }
  renderSpeciesHeader(displaySpecies){
    if(displaySpecies){
      return (
        <th className='species'>Species</th>
      );
    }
  }
  renderSpeciesRow(displaySpecies, patient){
    if(displaySpecies){
      return (
        <td className='species' style={this.data.style.cellHideOnPhone}>
          {patient.species}
        </td>
      );
    }

  }
  renderSendButtonHeader(){
    if (this.props.showSendButton === true) {
      return (
        <th className='sendButton' style={this.data.style.hideOnPhone}></th>
      );
    }
  }
  renderSendButton(patient, avatarStyle){
    if (this.props.showSendButton === true) {
      return (
        <td className='sendButton' style={this.data.style.hideOnPhone}>
          <FlatButton label="send" onClick={this.onSend.bind('this', this.data.patients[i]._id)}/>
        </td>
      );
    }
  }
  onSend(id){
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
  selectPatientRow(patientId, foo, bar){
    console.log('Selecting a new Patient...');
    console.log('patientId', patientId, foo, bar)
    if(typeof this.props.onRowClick === "function"){
      console.log('Apparently we received an onRowClick() as a prop')
      this.props.onRowClick(patientId);
    } else {
      Session.set('selectedPatientId', patientId);
      Session.set('selectedPatient', Patients.findOne(patientId));
    }
  }
  renderToggleHeader(){
    if (!this.props.hideToggle) {
      return (
        <th className="toggle" style={{width: '60px'}} >Toggle</th>
      );
    }
  }
  renderToggle(){
    if (!this.props.hideToggle) {
      return (
        <td className="toggle" style={{width: '60px'}}>
            <Toggle
              defaultToggled={true}
            />
          </td>
      );
    }
  }
  renderActionIconsHeader(){
    if (!this.props.hideActionIcons) {
      return (
        <th className='actionIcons' style={{minWidth: '120px'}}>Actions</th>
      );
    }
  }
  renderActionIcons(patient ){
    if (!this.props.hideActionIcons) {
      let iconStyle = {
        marginLeft: '4px', 
        marginRight: '4px', 
        marginTop: '4px', 
        fontSize: '120%'
      }

      return (
        <td className='actionIcons' style={{minWidth: '120px'}}>
          <FaTags style={iconStyle} onClick={this.showSecurityDialog.bind(this, patient)} />
          <GoTrashcan style={iconStyle} onClick={this.removeRecord.bind(this, patient._id)} />  
        </td>
      );
    }
  } 

  renderMaritalStatusHeader(){
    if (!this.props.hideMaritalStatus) {
      return (
        <th className="maritalStatus">Marital Status</th>
      );
    }
  }
  renderMaritalStatus(patient){
    if (!this.props.hideMaritalStatus) {
      return (
        <td className='maritalStatus'>{patient.maritalStatus}</td>
      );
    }
  }

  renderLanguageHeader(){
    if (!this.props.hideLanguage) {
      return (
        <th className="language">Language</th>
      );
    }
  }
  renderLanguage(patient){
    if (!this.props.hideLanguage) {
      return (
        <td className='language'>{patient.language}</td>
      );
    }
  }
  removeRecord(_id){
    console.log('Remove patient ', _id)
    Patients._collection.remove({_id: _id})
  }
  showSecurityDialog(patient){
    console.log('showSecurityDialog', patient)

    Session.set('securityDialogResourceJson', Patients.findOne(get(patient, '_id')));
    Session.set('securityDialogResourceType', 'Patient');
    Session.set('securityDialogResourceId', get(patient, '_id'));
    Session.set('securityDialogOpen', true);
  }
  render () {
    let tableRows = [];
    let footer;

    if(this.data.patients.length === 0){
      footer = <TableNoData noDataPadding={ this.props.noDataMessagePadding } />
    } else {
      for (var i = 0; i < this.data.patients.length; i++) {

        let rowStyle = {
          cursor: 'pointer'
        }
        if(get(this.data.patients[i], 'modifierExtension[0]')){
          rowStyle.color = "orange";
        }

        tableRows.push(
          <tr key={i} className="patientRow" style={rowStyle} onClick={this.selectPatientRow.bind(this, this.data.patients[i]._id )} >
  
            { this.renderToggle(this.data.patients[i]) }
            { this.renderActionIcons(this.data.patients[i]) }

            { this.renderRowAvatar(this.data.patients[i], this.data.style.avatar) }
  
            <td className='identifier' style={this.data.style.cellHideOnPhone}>{this.data.patients[i].identifier}</td>
            <td className='name' onClick={ this.rowClick.bind('this', this.data.patients[i]._id)} style={this.data.style.cell}>{this.data.patients[i].name }</td>
            <td className='gender' onClick={ this.rowClick.bind('this', this.data.patients[i]._id)} style={this.data.style.cell}>{this.data.patients[i].gender}</td>
            <td className='birthDate' onClick={ this.rowClick.bind('this', this.data.patients[i]._id)} style={{minWidth: '100px', paddingTop: '16px'}}>{this.data.patients[i].birthDate }</td>

            { this.renderMaritalStatus(this.data.patients[i]) }
            { this.renderLanguage(this.data.patients[i]) }

            {/* <td className='maritalStatus' style={this.data.style.cellHideOnPhone}>{this.data.patients[i].maritalStatus}</td> */}
            {/* <td className='language' style={this.data.style.cellHideOnPhone}>{this.data.patients[i].language}</td> */}
            <td className='isActive' onClick={ this.rowClick.bind('this', this.data.patients[i]._id)} style={this.data.style.cellHideOnPhone}>{this.data.patients[i].active}</td>

              { this.renderSpeciesRow(this.props.displaySpecies, this.data.patients[i]) }
              { this.renderSendButton(this.data.patients[i], this.data.style.avatar) }
          </tr>
        );
      }
    }
    


    return(
      <div>
        <Table id='patientsTable' hover >
          <thead>
            <tr>
              { this.renderToggleHeader() }
              { this.renderActionIconsHeader() }
              { this.renderRowAvatarHeader() }
  
              <th className='identifier' style={this.data.style.hideOnPhone}>Identifier</th>
              <th className='name'>Name</th>
              <th className='gender'>Gender</th>
              <th className='birthdate' style={{minWidth: '100px'}}>Birthdate</th>

              { this.renderMaritalStatusHeader(this.data.patients[i]) }
              { this.renderLanguageHeader(this.data.patients[i]) }

              {/* <th className='maritalStatus' style={this.data.style.hideOnPhone}>Marital Status</th> */}
              {/* <th className='language' style={this.data.style.hideOnPhone}>Language</th> */}
              <th className='isActive' style={this.data.style.hideOnPhone}>Active</th>
              
              { this.renderSpeciesHeader(this.props.displaySpecies) }
              { this.renderSendButtonHeader() }
            </tr>
          </thead>
          <tbody>
            { tableRows }
          </tbody>
        </Table>
        { footer }
      </div>
    );
  }
}

PatientTable.propTypes = {
  id: PropTypes.string,
  data: PropTypes.array,
  fhirVersion: PropTypes.string,
  showSendButton: PropTypes.bool,
  displaySpecies: PropTypes.bool,
  onRowClick: PropTypes.func,
  hideToggle: PropTypes.bool,
  hideActionIcons: PropTypes.bool,
  hideMaritalStatus: PropTypes.bool,
  hideLanguage: PropTypes.bool,
  noDataMessagePadding: PropTypes.number  
};

ReactMixin(PatientTable.prototype, ReactMeteorData);
export default PatientTable;