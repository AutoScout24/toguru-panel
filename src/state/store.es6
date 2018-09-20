import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import DevTools from '../components/devTools';
import {arrayToObject} from './../utils.es6'
import baseConfig from '../../dist/config.json'

const SET_TOGGLES = 'SET_TOGGLES'
const SET_TOGGLE = 'SET_TOGGLE'
const SET_API_KEY = 'SET_API_KEY'
const DROP_TOGGLE = 'DROP_TOGGLE'
const SET_AUDIT_LOG = 'SET_AUDIT_LOG'
const SHOW_API_KEY_ALERT = 'SHOW_API_KEY_ALERT'
const HIDE_API_KEY_ALERT = 'HIDE_API_KEY_ALERT'
const DISABLE_TOGGLE = 'DISABLE_TOGGLE'

const API_KEY = 'API_KEY'

const defaultState = {
    config: window.config || baseConfig,
    toggles: {},
    auditLog: [],
    apiKey: localStorage.getItem(API_KEY),
    apiKeyAlert: {
        visible: false,
        failedAction: null
    }
}

const emptyActivations = {activations: [{rollout: {percentage: 0}}]}

const addToggleToState = (state, toggle) => {
    const toggleObj = {}
    toggleObj[toggle.id] = toggle

    return Object.assign({}, state, {toggles: Object.assign({}, state.toggles, toggleObj)})
}

const updateToggleField = (state, toggleId, updateFunc) => {
    return addToggleToState(state, updateFunc(state.toggles[toggleId]))
}

const removeToggleFromState = (state, toggleId) => {
    const toggles = Object.assign({}, state.toggles)
    delete toggles[toggleId]

    return Object.assign({}, state, {toggles})
}

const reducer = (state = defaultState, action) => {
    switch (action.type) {
        case SET_TOGGLES:
            return Object.assign({}, state, {toggles: arrayToObject(action.toggles, "id")})
        case SET_TOGGLE:
            return addToggleToState(state, action.toggle)
        case DROP_TOGGLE:
            return removeToggleFromState(state, action.toggleId)
        case SET_API_KEY:
            localStorage.setItem(API_KEY, action.apiKey)
            return Object.assign({}, state, {apiKey: action.apiKey})
        case SET_AUDIT_LOG:
            return Object.assign({}, state, {auditLog: action.auditLog})
        case SHOW_API_KEY_ALERT:
            return Object.assign({}, state, {apiKeyAlert: {visible: true, failedAction: action.failedAction}})
        case HIDE_API_KEY_ALERT:
            return Object.assign({}, state, {apiKeyAlert: defaultState.apiKeyAlert})
        case DISABLE_TOGGLE:
            return updateToggleField(state, action.toggleId, t => Object.assign({}, t, emptyActivations))
        default:
            return state
    }
}

export const hideApiKeyAlert = () => ({type: HIDE_API_KEY_ALERT})
export const showApiKeyAlert = failedAction => ({type: SHOW_API_KEY_ALERT, failedAction})
export const setAuditLog = auditLog => ({type: SET_AUDIT_LOG, auditLog})
export const setApiKey = apiKey => ({type: SET_API_KEY, apiKey})
export const setToggles = toggles => ({type: SET_TOGGLES, toggles})
export const setToggle = toggle => ({type: SET_TOGGLE, toggle})
export const dropToggle = toggleId => ({type: DROP_TOGGLE, toggleId})
export const disableToggle = toggleId => ({type: DISABLE_TOGGLE, toggleId})

// Exclude devtools for production build
const enhancer = process.env !== 'production' ?
    compose(
        applyMiddleware(thunk),
        DevTools.instrument() // Enable Redux DevTools with the monitors you chose
    ) :
    compose(applyMiddleware(thunk))

export const store = createStore(reducer, defaultState, enhancer)
