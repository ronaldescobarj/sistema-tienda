import React, { Component } from 'react';
import './App.sass';
import Header from './components/header/header';
import { BrowserRouter as Router, Route } from "react-router-dom";
import MainDashboard from './components/main-dashboard/main-dashboard';
import Inventory from './components/inventory/inventory';
import SalesRecord from './components/sales-record/sales-record';
import AddItem from './components/add-item/add-item';
import EditItem from './components/edit-item/edit-item';
import EditAccount from './components/edit-account/edit-account';
import LoginPage from './components/login/login';
import { withFirebase } from './components/firebase';

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      authUser: null
    }
  }

  componentDidMount() {
    this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
      authUser
        ? this.setState({ authUser })
        : this.setState({ authUser: null });
    });
  }

  componentWillUnmount() {
    this.listener();
  }

  render() {
    return (
      <Router>
        <div>
          <Header authUser={this.state.authUser} />
          <Route exact path="/" component={MainDashboard} />
          <Route path="/iniciar-sesion" component={LoginPage} />
          <Route path="/inventario" component={Inventory} />
          <Route path="/nuevo-item" component={AddItem} />
          <Route path="/registro-ventas" component={SalesRecord} />
          <Route path="/item/:id" component={EditItem} />
          <Route path="/editar-cuenta" component={EditAccount} />
        </div>
      </Router>
    );
  }

}

export default withFirebase(App);