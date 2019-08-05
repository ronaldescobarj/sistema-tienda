import React from 'react';
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
import { withAuthentication } from './components/session';
import ForgotPassword from './components/forgot-password/forgot-password';
import RegisterSale from './components/register-sale/register-sale';
import CustomersList from './components/customers-list/customers-list';

function App() {

  return (
    <Router>
      <div>
        <Header />
        <Route exact path="/" component={MainDashboard} />
        <Route path="/iniciar-sesion" component={LoginPage} />
        <Route path="/inventario" component={Inventory} />
        <Route path="/nuevo-item" component={AddItem} />
        <Route path="/item/:id" component={EditItem} />
        <Route path="/registro-ventas" component={SalesRecord} />
        <Route path="/registrar-venta" component={RegisterSale} />
        <Route path="/clientes" component={CustomersList} />
        <Route path="/editar-cuenta" component={EditAccount} />
        <Route path="/olvide-mi-contrasenia" component={ForgotPassword} />
      </div>
    </Router>
  );
}

export default withAuthentication(App);