import Avatar from 'material-ui/Avatar';
import FlatButton from 'material-ui/FlatButton';
import { HTTP } from 'meteor/http';
import React from 'react';
import { ReactMeteorData } from 'meteor/react-meteor-data';
import ReactMixin from 'react-mixin';
import { Table } from 'react-bootstrap';
import { Session } from 'meteor/session';
import { has, get } from 'lodash';
import { TableNoData } from 'meteor/clinical:glass-ui'


flattenPatient = function(person){
  let result = {
    _id: person._id,
    id: person.id,
    active: person.active.toString(),
    gender: person.gender,
    name: '',
    mrn: '',
    birthDate: '',
    photo: "/thumbnail-blank.png",
    initials: 'abc'
  };

  // there's an off-by-1 error between momment() and Date() that we want
  // to account for when converting back to a string
  result.birthDate = moment(person.birthDate).add(1, 'days').format("YYYY-MM-DD")
  result.photo = get(person, 'photo[0].url', '');
  result.mrn = get(person, 'identifier[0].value', '');

  if(has(person, 'name[0].text')){
    result.name = get(person, 'name[0].text');    
  } else {
    result.name = get(person, 'name[0].given[0]') + ' ' + get(person, 'name[0].family[0]');
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

    // console.log("PatientTable[data]", data);
    return data;
  }
  imgError(avatarId) {
    this.refs[avatarId].src = Meteor.absoluteUrl() + 'noAvatar.png';
  }
  rowClick(id){
    Session.set('patientsUpsert', false);
    Session.set('selectedPatient', id);
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
    console.log('renderRowAvatar', patient, avatarStyle)
    if (get(Meteor, 'settings.public.defaults.avatars') && (this.props.showAvatars === true)) {
      return (
        <td className='avatar'>
          <img src={patient.photo} ref={patient._id} onError={ this.imgError.bind(this, patient._id) } style={avatarStyle}/>
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
  selectPatientRow(patientId){
    if(typeof(this.props.onRowClick) === "function"){
      this.props.onRowClick(patientId);
    }
  }
  render () {
    let tableRows = [];
    let footer;

    if(this.data.patients.length === 0){
      footer = <TableNoData noDataPadding={ this.props.noDataPadding } />
    } else {
      for (var i = 0; i < this.data.patients.length; i++) {
        tableRows.push(
          <tr key={i} className="patientRow" style={{cursor: "pointer"}} onClick={this.selectPatientRow.bind(this, this.data.patients[i].id )} >
  
            { this.renderRowAvatar(this.data.patients[i], this.data.style.avatar) }
  
            <td className='name' onClick={ this.rowClick.bind('this', this.data.patients[i]._id)} style={this.data.style.cell}>{this.data.patients[i].name }</td>
            <td className='gender' onClick={ this.rowClick.bind('this', this.data.patients[i]._id)} style={this.data.style.cell}>{this.data.patients[i].gender}</td>
            <td className='birthDate' onClick={ this.rowClick.bind('this', this.data.patients[i]._id)} style={{minWidth: '100px', paddingTop: '16px'}}>{this.data.patients[i].birthDate }</td>
            <td className='isActive' onClick={ this.rowClick.bind('this', this.data.patients[i]._id)} style={this.data.style.cellHideOnPhone}>{this.data.patients[i].active}</td>
            <td className='mrn' style={this.data.style.cellHideOnPhone}>{this.data.patients[i].mrn}</td>
            <td className='id' onClick={ this.rowClick.bind('this', this.data.patients[i].id)} style={this.data.style.cellHideOnPhone}><span className="barcode">{this.data.patients[i].id}</span></td>            

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
              { this.renderRowAvatarHeader() }

              <th className='name'>name</th>
              <th className='gender'>gender</th>
              <th className='birthdate' style={{minWidth: '100px'}}>birthdate</th>
              <th className='isActive' style={this.data.style.hideOnPhone}>active</th>
              <th className='mrn' style={this.data.style.hideOnPhone}>mrn</th>
              <th className='id' style={this.data.style.hideOnPhone}>_id</th>
              
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


ReactMixin(PatientTable.prototype, ReactMeteorData);
export default PatientTable;