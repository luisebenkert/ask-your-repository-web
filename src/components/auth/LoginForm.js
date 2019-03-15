// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import Form from 'react-validation/build/form';
import Input from 'react-validation/build/input';
import Button from 'react-validation/build/button';
import GoogleLogin from './GoogleLogin';
import { login } from '../../state/auth/auth.actionCreators';
import './Forms.scss';

type Props = {
  dispatch: Function,
};

type State = {
  email: string,
  password: string,
  missingInput: boolean,
};

class LoginForm extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      missingInput: false,
    };
  }

  handleChange = (e: SyntheticInputEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.resetErrors();

    const { email, password } = this.state;
    const { dispatch } = this.props;

    if (email && password) {
      dispatch(login(email, password));
    }
    else {
      this.handleMissingInput();
    }
  }

  handleMissingInput = () => {
    this.setState({
      missingInput: true,
    });
  }

  resetErrors = () => {
    this.setState({
      missingInput: false,
    });
  }

  render() {
    const { email, password, missingInput } = this.state;
    return (
      <Form onSubmit={this.handleSubmit} className="Form">
        <h1>Login</h1>
        {missingInput ? (
          <p>Please fill in all fields. </p>
        ) : ''}
        <div className="form-input">
          <label>
            Email or Username:
            <Input
              type="text"
              name="email"
              value={email}
              onChange={this.handleChange}
              data-cy="login-email-input"
            />
          </label>
        </div>
        <div className="form-input">
          <label>
            Password:
            <Input
              type="password"
              name="password"
              value={password}
              onChange={this.handleChange}
              data-cy="login-password-input"
            />
          </label>
        </div>
        <div>
          <Link to="/register">
            No account yet? Register here.
          </Link>
        </div>
        <div className="Form__buttons">
          <Button data-cy="login-submit-button">
            Login
          </Button>
          <GoogleLogin />
          <Link to="/" className="cancel">Cancel</Link>
        </div>
      </Form>
    );
  }
}

export default connect()(LoginForm);
