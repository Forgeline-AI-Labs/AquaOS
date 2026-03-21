import React from 'react'
import Enzyme, { mount, shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import App from './app'
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import 'isomorphic-fetch'
import JackSelector from './jack_selector'
import SelectEquipment from './select_equipment'
import SignIn from './sign_in'
import fetchMock from 'fetch-mock'
import {Provider} from 'react-redux'

Enzyme.configure({ adapter: new Adapter() })
const mockStore = configureMockStore([thunk])

describe('App', () => {
  afterEach(() => {
    fetchMock.reset()
    fetchMock.restore()
  })
  it('<App />', () => {
    SignIn.isSignedIn = jest.fn().mockImplementation(() => {
      return new Promise(function (resolve) {
        return resolve(true)
      })
    })
    const m = shallow(<App />).instance()
    m.setState({loaded: true})
    m.render()
    m.state.logged = true
    m.getComponent()
    m.componentDidMount()
  })

})
