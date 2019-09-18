import React from 'react';
import './App.sass';
import Header from './components/header/header';
import { BrowserRouter as Router, Route } from "react-router-dom";
import MainDashboard from './components/main-dashboard/main-dashboard';
import Inventory from './components/inventory/inventory';
import AddItem from './components/add-item/add-item';
import EditAccount from './components/edit-account/edit-account';
import LoginPage from './components/login/login';
import { withAuthentication } from './components/session';
import ForgotPassword from './components/forgot-password/forgot-password';
import CustomersList from './components/customers-list/customers-list';
import EditCustomer from './components/edit-customer/edit-customer';
import EditItem from './components/edit-item/edit-item';
import AddCustomer from './components/add-customer/add-customer';
import SalesRecord from './components/sales-record/sales-record';
import EditSale from './components/edit-sale/edit-sale';
import RegisterSale from './components/register-sale/register-sale';
import PaymentsInAdvance from './components/payments-in-advance/payments-in-advance';
import AddPayment from './components/add-payment/add-payment';
import EditPayment from './components/edit-payment/edit-payment';
import RegisterSingleSale from './components/register-single-sale/register-single-sale';
import SingleSalesRecord from './components/single-sales-record/single-sales-record';
import EditSingleSale from './components/edit-single-sale/edit-single-sale';

import { library } from '@fortawesome/fontawesome-svg-core'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { faCheckSquare, faCoffee } from '@fortawesome/free-solid-svg-icons'

library.add(fab, faCheckSquare, faCoffee)

function App() {

  return (
    <Router>
      <div>
        <Header />
        <Route exact path="/" component={MainDashboard} />
        <Route path="/iniciar-sesion" component={LoginPage} />
        <Route exact path="/inventario" component={Inventory} />
        <Route path="/inventario/nuevo-item" component={AddItem} />
        <Route path="/inventario/item/:itemId" component={EditItem} />
        <Route exact path="/ventas-individuales" component={SingleSalesRecord} />
        <Route path="/ventas-individuales/nueva-venta-individual" component={RegisterSingleSale} />
        <Route path="/ventas-individuales/venta-individual/:singleSaleId" component={EditSingleSale} />
        <Route exact path="/clientes" component={CustomersList} />
        <Route path="/clientes/nuevo-cliente" component={AddCustomer} />
        <Route exact path="/clientes/cliente/:customerId" component={EditCustomer} />
        <Route exact path="/clientes/cliente/:customerId/registro-de-ventas" component={SalesRecord} />
        <Route exact path="/clientes/cliente/:customerId/registro-de-ventas/nueva-venta" component={RegisterSale} />
        <Route path="/clientes/cliente/:customerId/registro-de-ventas/venta/:saleId" component={EditSale} />
        <Route exact path="/clientes/cliente/:customerId/adelantos-de-pago" component={PaymentsInAdvance} />
        <Route exact path="/clientes/cliente/:customerId/adelantos-de-pago/nuevo-pago" component={AddPayment} />
        <Route path="/clientes/cliente/:customerId/adelantos-de-pago/pago/:paymentId" component={EditPayment} />
        <Route path="/editar-cuenta" component={EditAccount} />
        <Route path="/olvide-mi-contrasenia" component={ForgotPassword} />
      </div>
    </Router>
  );
}

export default withAuthentication(App);