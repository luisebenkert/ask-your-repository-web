// @flow
import React from 'react';
import { Route, Switch } from 'react-router';
import { connect } from 'react-redux';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import LandingPage from './landing_page/LandingPage';
import FlashMessages from './utility/flash/FlashMessages';
import AuthorizedApp from './AuthorizedApp';
import Footer from './footer/Footer';
import type { AppState } from '../state/AppState';
import './App.scss';

type Props = {
  isAuthenticated: boolean,
};

function App(props: Props) {
  return (
    <div className="App">
      <FlashMessages />
      <Switch>
        <Route path="/login" component={LoginForm} />
        <Route path="/register" component={RegisterForm} />
        <Route path="/" component={props.isAuthenticated ? AuthorizedApp : LandingPage} />
      </Switch>
      <Footer />
    </div>
  );
}

const mapStateToProps = (state: AppState) => ({
  isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProps)(App);
