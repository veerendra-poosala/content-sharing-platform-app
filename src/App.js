import React, { Component } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Cookie from 'js-cookie';
import Home from './components/Home';
import Login from './components/Login';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Search from './components/Search';
import Register from './components/Register';
import './App.css';

class App extends Component {
  state = {
    isAuthenticated: false
  };

  componentDidMount() {
    const token = Cookie.get('csp_app_jwt_token');
    if (token !== undefined) {
      this.setState({ isAuthenticated: true });
    }
  }

  render() {
   // const { isAuthenticated } = this.state;

    return (
      <Switch>
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <ProtectedRoute
          exact
          path="/"
          component={Home}
        />
        <ProtectedRoute exact path="/search/:text" component={Search} />
        <Route path="/not-found" component={NotFound} />
        <Redirect to="/not-found" />
      </Switch>
    );
  }
}

export default App;
