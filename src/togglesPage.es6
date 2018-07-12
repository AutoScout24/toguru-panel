import React from 'react'

import { getTogglesList } from './state/actions.es6'
import { Paginator, paginationFilter } from './components/paginator.es6'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { Template } from './components/template.es6'

import { objectToArray } from './utils.es6'

const generateRolloutBlock = percentage => {
  switch (percentage) {
    case 100:
      return <span className="badge rolled-out">100%</span>
    case 0:
      return <span className="badge not-rolling">0%</span>
    case undefined:
      return <span className="badge not-rolling">0%</span>
    default:
      return <span className="badge rolling-out">{percentage + "%"}</span>
  }
}

const ToggleEntry = ({toggle}) => (
  <tr>
    <td><Link to={"/edit/" + toggle.id}>{toggle.id}</Link></td>
    <td>{generateRolloutBlock(toggle.rolloutPercentage)}</td>
    <td>{objectToArray(toggle.tags).map((tag, index) => <code className="tag" key={toggle.id + "-" + tag + "-" + index}>{tag}</code>)}</td>
  </tr>
)

const TogglesList = ({toggles}) => (
  <div className="content table-responsive table-full-width no-padding-bottom">
      <table className="table table-hover table-striped toggles-table no-padding-bottom">
          <thead>
            <tr>
              <th>Toggle ID</th>
              <th>Rollout</th>
              <th>Tags</th>
            </tr>
          </thead>
          <tbody>
              {toggles.map(t => <ToggleEntry toggle={t} key={t.id}/>)}
          </tbody>
      </table>
      <hr className="no-padding"/>
  </div>
)

const isToggleIdContainsQuery = (id, query) =>
  id.indexOf(query) != -1

const isTogglePercentageContainsQuery = (percentage, query) => {
  if(!percentage) return false
  return (percentage + "%").startsWith(query)
}

const isToggleTagsContainsQuery = (tags, query) =>
  objectToArray(tags).map(t => t.toLowerCase().startsWith(query)).find(t => t == true) != undefined

const filterToggles = (query) => (toggle) => {
  if(!query) return true;
  return isToggleIdContainsQuery(toggle.id, query) ||
         isTogglePercentageContainsQuery(toggle.rolloutPercentage, query) ||
         isToggleTagsContainsQuery(toggle.tags, query)
}

const toTogglesList = state =>
  ({toggles: objectToArray(state.toggles), config: state.config})

export const TogglesPage =
  connect(toTogglesList)(
    React.createClass({
      getInitialState() {
        return {
          query: null,
          fetchStatus: "",
          currentPage: 1,
          filteredToggles: []
        }
      },
      componentDidMount() {
        if(this.props.toggles.length == 0) {
          this.fetchList()
        }
      },
      fetchList() {
        this.setState({fetchStatus: "loading"})
        this.props.dispatch(getTogglesList())
            .then(_ => this.setState({fetchStatus: "success"}))
            .catch(err => {
              alert("Unable to fetch data from Toguru API.")
              this.setState({fetchStatus: "failed"})
            })
      },
      onQueryChange(query) {
        if(query) {
          const filteredToggles = this.props.toggles.filter(filterToggles(this.state.query))
          this.setState({query, currentPage: 1, filteredToggles})
        } else {
          this.setState({query, currentPage: 1, filteredToggles: []})
        }
      },
      getToggles() {
        return this.state.filteredToggles.length > 0 ? this.state.filteredToggles : this.props.toggles
      },
      render() {
        return (
          <Template pageName='toggles'>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-12">
                        <div className="card">
                            <div className="header">
                              <ul className="search-panel">
                                <li>
                                  <h4 className="title">Toggles list &nbsp;<span className={"pe-7s-refresh-cloud sync-button " + this.state.fetchStatus} onClick={this.fetchList}></span></h4>
                                  <Link to={'/create'} className="category new_toggle">Add new toggle</Link>
                                </li>
                                <li>
                                  <div className="form-group">
                                    <input type="text" className="form-control" placeholder="Search query" onChange={e => this.onQueryChange(e.target.value.toLowerCase())} onInput={e => this.onQueryChange(e.target.value.toLowerCase())}/>
                                  </div>
                                </li>
                              </ul>
                            </div>
                            <TogglesList toggles={this.getToggles().filter(paginationFilter(this.state.currentPage, this.props.config.entriesPerPage))}/>
                            <div className="pagination-wrapper">
                              <Paginator totalEntries={this.getToggles().length} perPage={this.props.config.entriesPerPage} currentPage={this.state.currentPage} onClick={page => this.setState({currentPage: page})}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </Template>
        )
      }
    })
  )
