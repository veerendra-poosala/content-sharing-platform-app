import {Component} from 'react'
import {Redirect} from 'react-router-dom'

import Cookies from 'js-cookie'


import './index.css'
import { Link } from 'react-router-dom/cjs/react-router-dom.min'

class Register extends Component {
  state = {
    showErrorMsg: false,
    errorMsg: '',
    username: '',
    password: '',
    gender : 'male',
    location : '',
    mobileNumber : ''
  }

  onSuccessfulLoginSubmission = jwtToken => {
    Cookies.set('csp_app_jwt_token', jwtToken, {expires: 30});
    const {history} = this.props
     history.replace('/')
  }

  handleLoginFormSubmit = async event => {
    event.preventDefault()
    try {
      const {username, password, gender, location, mobileNumber} = this.state
      const userDetails = {
        username,
        password,
        gender,
        location,
        "mobile_number" : mobileNumber,
    }
       
      const backendApiUrl = process.env.REACT_APP_API_URL
      const url = `${backendApiUrl}/users/`
      const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(userDetails),
      }
      const response = await fetch(url, options)
      const data = await response.json()
      
      if (response.ok) {
        const {history} = this.props
        this.setState({showErrorMsg: false})
        return history.replace('/login')
      } else {
        const errorMsg = data.error_msg
        this.setState({showErrorMsg: true, errorMsg})
      }
    } catch (e) {
      console.log('Login error', e)
    }
  }

  onChangeUsername = event => {
    this.setState({username: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  onChangeGender = event => {
    this.setState({gender: event.target.value})
  }

  onChangeLocation = event => {
    this.setState({location: event.target.value})
  }

  onChangeMobileNumber = event => {
    this.setState({mobileNumber: event.target.value})
  }

  

  renderUsername = () => {
    const {username} = this.state

    return (
      <div className="form-field-container">
        <label htmlFor="username" className="label-text">
          USERNAME
        </label>
        <input
          type="text"
          className="text-input-element"
          id="username"
          onChange={this.onChangeUsername}
          value={username}
          placeholder="Username"
        />
      </div>
    )
  }



  renderGender = () => {
    const {gender} = this.state

    return (
      <div className="form-field-container updated-form-field-container">
        <p className="label-text">
          GENDER
        </p>
        <div className='radio-buttons-container'>
            <div className='radio-button'>
            <label htmlFor='male' className='label-text'>Male</label>
        <input
          type="radio"
          className="text-input-element-radio"
          id="male"
          checked={gender === 'male'}
          onChange={this.onChangeGender}
          value='male'
          name="gender"
         
        />
            </div>
        <div className='radio-button'>
        <label htmlFor='female' className='label-text'>FeMale</label>
        <input
          type="radio"
          className="text-input-element-radio"
          id="female"
          checked={gender === 'female'}
          onChange={this.onChangeGender}
          value='female'
          name="gender"
         
        />
        </div>
        </div>
        
      </div>
    )
  }

  renderPassword = () => {
    const {password} = this.state
   
    return (
      <div className="form-field-container">
        <label htmlFor="password" className="label-text">
          password
        </label>
        <input
          type="password"
          className="text-input-element"
          id="password"
          onChange={this.onChangePassword}
          value={password}
          placeholder="Password"
        />
      </div>
    )
  }

  renderLocation = () => {
    const {location} = this.state

    return (
      <div className="form-field-container">
        <label htmlFor="location" className="label-text">
          LOCATION
        </label>
        <input
          type="text"
          className="text-input-element"
          id="location"
          onChange={this.onChangeLocation}
          value={location}
          placeholder="Enter your location here"
        />
      </div>
    )
  }

  renderMobileNumber = () => {
    const {mobileNumber} = this.state

    return (
      <div className="form-field-container">
        <label htmlFor="mobileNumber" className="label-text">
          MOBILE NUMBER
        </label>
        <input
          type="text"
          className="text-input-element"
          id="mobileNumber"
          onChange={this.onChangeMobileNumber}
          value={mobileNumber}
          placeholder="Enter your mobile number here"
        />
      </div>
    )
  }



  render() {
    const {showErrorMsg, errorMsg} = this.state
    const jwtToken = Cookies.get('csp_app_jwt_token');
    if (jwtToken !== undefined){
        // console.log('jwtToken',jwtToken)
         return <Redirect to="/" />
    }
    return (
      <div className="login-route-bg-container">
        <div className="login-route-landing-image-container">
          <img
            className="login-route-landing-image"
            alt="website login"
            src="https://res.cloudinary.com/v45/image/upload/v1689574130/instaShareProject/loginRoute/Layer_2_3x_aerufg.png"
          />
        </div>
        <div className="form-bg-container">
          <form
            className="register-form-container"
            onSubmit={this.handleLoginFormSubmit}
          >
            <div className="form-heading-container">
              <img
                className="website-logo-login-route"
                alt="website logo"
                src="https://res.cloudinary.com/v45/image/upload/v1689618508/Standard_Collection_8_1_gev4v9.png"
              />
              <h1 className="login-route-main-heading">Content Sharing Platform</h1>
              {this.renderUsername()}
              {this.renderPassword()}
              {this.renderLocation()}
              {this.renderMobileNumber()}
              {this.renderGender()}
              <div className="form-field-container error-msg-container">
                {showErrorMsg && <p className="error-msg">{errorMsg} </p>}
              </div>
              <div className="form-field-container register-button-container">
                
                <button type="submit" className="login-button">
                  <p className="button-text">Register</p>
                </button>
                <Link to="/login">
                <p >Already Registered, Login here...</p>
                </Link>
              </div>
              
              
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default Register