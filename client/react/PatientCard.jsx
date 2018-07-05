import React from 'react';
import ReactMixin from 'react-mixin';

import { ListItem } from 'material-ui/List';
import { GlassCard, Glass, DynamicSpacer } from 'meteor/clinical:glass-ui';
import { Card, CardActions, CardHeader, CardText, CardTitle } from 'material-ui/Card';
import { Col, Grid, Row } from 'react-bootstrap';
import TextField from 'material-ui/TextField';

import { get } from 'lodash';

const style = {
    avatar: {
        position: 'absolute',
        zIndex: 10,
        transition: '1s',
        left: '0px',
        top: '0px',
        width: '100%',
        height: '100%'
    }, 
    photo: {
        position: 'absolute',
        height: '160px',
        width: '160px',
        left: '-20px',
        top: '-10px',       
        zIndex: 10 
    },
    title: {
        left: '160px'
    },
    synopsis: {
        marginLeft: '160px',
        position: 'relative',
        top: '0px'
    },
    patientCard: {
        position: 'relative'
    }
}
export class PatientCard extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    // console.log('PatientCard', this.props.patient)


    let { active, familyName, givenName, fullName, email, birthdate, gender, avatar, patient, zDepth, ...otherProps } = this.props;

    if ( patient ) {
        fullName = get(this, 'props.patient.name[0].text');
        familyName = get(this, 'props.patient.name[0].family[0]');        
        givenName = get(this, 'props.patient.name[0].given[0]');
        email = get(this, 'props.patient.contact[0].value');
        birthdate = get(this, 'props.patient.birthDate');
        gender = get(this, 'props.patient.gender');
        avatar = get(this, 'props.patient.photo[0].url', '');
    }
    return (
      <div className='patientCard' {...otherProps} style={style.patientCard} >
        <Card zDepth={zDepth} style={ style.photo }>
            <img id='avatarImage' className='avatarImage' ref='avatarImage' onError={this.imgError.bind(this)} src={ this.props.avatar } style={ style.avatar} />
        </Card>
        <GlassCard>
            <CardTitle
                title={ fullName }
                subtitle={ email }
                style={ style.title }
              >
              </CardTitle>
            <CardText>
                <div id='profileDemographicsPane' style={{position: 'relative'}}>
                  <Row style={ style.synopsis} >
                    <Col md={6}>
                      <TextField
                        id='givenNameInput'
                        ref='given'
                        name='given'
                        type='text'
                        floatingLabelText='given name'
                        defaultValue={ givenName }
                        onChange={ this.props.updateGivenName ? this.props.updateGivenName.bind(this) : null }
                        fullWidth
                        /><br/>
                    </Col>
                    <Col md={6}>
                      <TextField
                        id='familyNameInput'
                        ref='family'
                        name='family'
                        type='text'
                        floatingLabelText='family name'
                        defaultValue={ familyName }
                        onChange={ this.props.updateFamilyName ? this.props.updateFamilyName.bind(this) : null }
                        fullWidth
                        /><br/>
                    </Col>
                  </Row>
                  <Row style={ style.synopsis }>
                    <Col md={3}>
                      <TextField
                        id='birthdateInput'
                        ref='birthdate'
                        name='birthdate'
                        type='date'
                        floatingLabelText='date of birth (yyyy-mm-dd)'
                        floatingLabelFixed={true}
                        defaultValue={ birthdate }                          
                        onChange={ this.props.updateBirthdate ? this.props.updateBirthdate.bind(this) : null }
                        fullWidth
                        /><br/>
                    </Col>
                    <Col md={3}>
                      <TextField
                        id='genderInput'
                        ref='gender'
                        name='gender'
                        type='text'
                        floatingLabelText='gender'
                        defaultValue={ gender }
                        onChange={ this.props.updateGender ? this.props.updateGender.bind(this) : null }
                        fullWidth
                        /><br/>

                    </Col>
                    <Col md={6}>
                      <TextField
                        id='avatarInput'
                        ref='avatar'
                        name='avatar'
                        type='text'
                        floatingLabelText='avatar'
                        defaultValue={ avatar }
                        onChange={ this.props.updateAvatar ? this.props.updateAvatar.bind(this) : null }
                        fullWidth
                        /><br/>

                    </Col>
                  </Row>
                </div>
            </CardText>
        </GlassCard>
        <DynamicSpacer />

        { this.props.children }
      </div>
    );
  }
  imgError() {
    this.refs.avatarImage.src = Meteor.absoluteUrl() + 'noAvatar.png';
  }
}



export default PatientCard ;