import React, { Component, PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { Link } from 'react-router'

import * as KeychainActions from '../actions/keychain'
import Alert from '../components/Alert'
import InputGroup from '../components/InputGroup'
import { decrypt, encrypt } from '../utils/keychain-utils'

function mapStateToProps(state) {
  return {
    encryptedMnemonic: state.keychain.encryptedMnemonic
  }
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(KeychainActions, dispatch)
}

class NewPasswordPage extends Component {
  static propTypes = {
    encryptedMnemonic: PropTypes.string.isRequired,
    updateMnemonic: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      currentPassword: '',
      newPassword: '',
      newPassword2: '',
      alerts: []
    }

    this.updateAlert = this.updateAlert.bind(this)
    this.reencryptMnemonic = this.reencryptMnemonic.bind(this)
    this.onValueChange = this.onValueChange.bind(this)
  }

  updateAlert(alertStatus, alertMessage) {
    this.setState({
      alerts: [{
        status: alertStatus,
        message: alertMessage
      }]
    })
  }

  reencryptMnemonic() {
    const _this = this,
          currentPassword = this.state.currentPassword,
          newPassword = this.state.newPassword,
          newPassword2 = this.state.newPassword2,
          dataBuffer = new Buffer(this.props.encryptedMnemonic, 'hex')

    decrypt(dataBuffer, currentPassword, function(err, plaintextBuffer) {
      if (!err) {
        if (newPassword.length < 8) {
          _this.updateAlert('danger', 'New password must be at least 8 characters')
        } else {
          if (newPassword !== newPassword2) {
            _this.updateAlert('danger', 'New passwords must match')
          } else {
            encrypt(plaintextBuffer, newPassword, function(err, ciphertextBuffer) {
              _this.props.updateMnemonic(ciphertextBuffer.toString('hex'))
              _this.updateAlert('success', 'Password updated!')
              _this.setState({
                currentPassword: '',
                newPassword: '',
                newPassword2: ''
              })
            })
          }
        }
      } else {
        _this.updateAlert('danger', 'Incorrect password')
      }
    })
  }

  onValueChange(event) {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  render() {
    return (
      <div>
        <div>
          <h3>Change Password</h3>

          { this.state.alerts.map(function(alert, index) {
            return (
              <Alert key={index} message={alert.message} status={alert.status} />
            )
          })}



          <div>
            <fieldset>
              <InputGroup name="currentPassword" label="Current Password" type="password"
                data={this.state} onChange={this.onValueChange} />
            </fieldset>
            <fieldset>
              <InputGroup name="newPassword" label="New Password" type="password"
                data={this.state} onChange={this.onValueChange} />
            </fieldset>
            <fieldset>
              <InputGroup name="newPassword2" label="New Password" type="password"
                data={this.state} onChange={this.onValueChange} />
            </fieldset>
            <div>
              <button className="btn btn-primary" onClick={this.reencryptMnemonic}>
                Update Password
              </button>
            </div>
          </div>

        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(NewPasswordPage)
