import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { arrayToObject } from './../utils.es6'

const SET_TOGGLES = 'SET_TOGGLES'
const SET_TOGGLE = 'SET_TOGGLE'
const SET_API_KEY = 'SET_API_KEY'
const DROP_TOGGLE = 'DROP_TOGGLE'
const SET_AUDIT_LOG = 'SET_AUDIT_LOG'

const API_KEY = 'API_KEY'

const defaultState = {
  config: config,
  toggles: {},
  auditLog: [],
  apiKey: localStorage.getItem(API_KEY)
}

const addToggleToState = (state, toggle) => {  
  const toggles = {...state.toggles, [toggle.id] : toggle}
  return {...state, toggles}
}

const removeToggleFromState = (state, toggleId) => {
  const {
    toggleId: ignore, // eslint-disable-line no-unused-vars
    ...toggles
  } = state.toggles
  
  return {...state, toggles}
}

const reducer = (state = defaultState, action) => {
  switch(action.type) {
    case SET_TOGGLES:
      return {...state, toggles: arrayToObject(action.toggles, "id")}
    case SET_TOGGLE:
      return addToggleToState(state, action.toggle)
    case DROP_TOGGLE:
      return removeToggleFromState(state, action.toggleId)
    case SET_API_KEY:
      localStorage.setItem(API_KEY, action.apiKey)
      return {...state, apiKey: action.apiKey}
    case SET_AUDIT_LOG:
      return {...state, auditLog: action.auditLog}
    default:
      return state
  }
}

export const setAuditLog = auditLog => ({ type: SET_AUDIT_LOG, auditLog })

export const setApiKey = apiKey => ({ type: SET_API_KEY, apiKey })

export const setToggles = toggles => ({ type: SET_TOGGLES, toggles })

export const setToggle = toggle => ({ type: SET_TOGGLE, toggle })

export const dropToggle = toggleId => ({ type: DROP_TOGGLE, toggleId })

export const store = createStore(reducer, applyMiddleware(thunk))
