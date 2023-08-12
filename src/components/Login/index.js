import {Component} from 'react'
import {Redirect} from 'react-router-dom'

import Cookies from 'js-cookie'


import './index.css'

class Login extends Component {
  state = {
    showErrorMsg: false,
    errorMsg: '',
    username: '',
    password: '',
  }

  onSuccessfulLoginSubmission = jwtToken => {
    Cookies.set('csp_app_jwt_token', jwtToken, {expires: 30});
    const {history} = this.props
     history.replace('/')
  }

  handleLoginFormSubmit = async event => {
    event.preventDefault()
    try {
      const {username, password} = this.state
      const userDetails = {
        "username":username,
        "password":password}
       
      const backendApiUrl = process.env.REACT_APP_API_URL
      const url = `${backendApiUrl}/login/`
      const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: JSON.stringify(userDetails),
      }
      const response = await fetch(url, options)
      const data = await response.json()
      
      if (data.jwtToken !== undefined) {
        this.onSuccessfulLoginSubmission(data.jwtToken)
        this.setState({showErrorMsg: false})
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
            className="login-form-container"
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
              <div className="form-field-container error-msg-container">
                {showErrorMsg && <p className="error-msg">{errorMsg} </p>}
              </div>
              <div className="form-field-container">
                
                
                <button type="submit" className="login-button">
                  <p className="button-text">Login</p>
                </button>
                
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}

export default Login