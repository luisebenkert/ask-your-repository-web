// @flow
import React from 'react';
import toJson from 'enzyme-to-json';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { mount } from 'enzyme';
import LoginForm from './LoginForm';
import initialState from '../../state/initialState';
import AuthService from '../../services/AuthService';

const mockStore = configureMockStore();

jest.mock('../../services/AuthService');

describe('<LoginForm />', () => {
  let wrapper;
  let store;

  beforeAll(() => {
    AuthService.logout.mockImplementation(() => Promise.resolve());
  });

  beforeEach(() => {
    store = mockStore(initialState);
    wrapper = mount((
      <Provider store={store}>
        <MemoryRouter>
          <LoginForm />
        </MemoryRouter>
      </Provider>
    )).find('LoginForm');
  });

  it('renders correctly', () => {
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
