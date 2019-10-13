import React, { Component } from 'react';
import { withFirebase } from '../../../providers/firebase';
import { Link } from "react-router-dom";
import { withAuthorization } from '../../../providers/session';
import axios from 'axios';
import PaymentsInAdvance from '../../payments/payments-in-advance/payments-in-advance';

const INITIAL_STATE = {
    allSales: [],
    filteredAndSortedSales: [],
    totalGiven: 0,
    totalInBolivianos: 0,
    totalInSoles: 0,
    modalClass: "modal",
    idToDelete: '',
    parameterToSortBy: 'date',
    sortDirection: 'ascendant',
    searchFilter: '',
    isLoading: true,
    isDeleting: false,
    noSales: false,
    message: '',
    shouldUpdateInventory: false
}

const SalesRecord = ({ match }) => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Registro de ventas
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <SalesRecordTable customerId={match.params.customerId} />
    </div>
);

class SalesRecordTableBase extends Component {

    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.deleteSale = this.deleteSale.bind(this);
        this.modifyStateOfSales = this.modifyStateOfSales.bind(this);
        this.toggleInventoryUpdateWhenDeleting = this.toggleInventoryUpdateWhenDeleting.bind(this);
    }

    async componentDidMount() {
        await this.getData();
    }

    async getData() {
        let sales = [];
        let totalGiven = 0, totalInBolivianos = 0, totalInSoles = 0;
        let response = await this.props.firebase.getSalesByParameter("customerId", this.props.customerId);
        if (!response.empty) {
            response.forEach(doc => {
                let sale = doc.data();
                sale["_id"] = doc.id;
                sales.push(sale);
                totalGiven += parseInt(sale.amountGiven);
                totalInBolivianos += parseFloat(sale.totalToPayInBolivianos);
                totalInSoles += parseFloat(sale.totalToPayInSoles);
            });
            this.setState({
                allSales: sales,
                filteredAndSortedSales: sales,
                totalGiven, totalInBolivianos, totalInSoles,
                isLoading: false
            });
        }
        else {
            this.setState({ isLoading: false, noSales: true });
        }
    }

    getSale(sales, id) {
        return sales.find(sale => sale._id === id);
    }

    calculateTotal(sales, parameter) {
        let total = 0;
        sales.forEach(sale => {
            total += parseInt(sale[parameter]);
        })
        return total;
    }

    toggleInventoryUpdateWhenDeleting(event) {
        this.setState({ shouldUpdateInventory: event.target.checked });
    }

    async modifyStateOfSales(event) {
        await this.setState({ [event.target.name]: event.target.value });
        let { allSales, parameterToSortBy, sortDirection, searchFilter } = this.state;
        let filteredSales = this.filterSales(searchFilter, allSales);
        let filteredAndSortedSales = this.sortSales(filteredSales, parameterToSortBy, sortDirection);
        let totalGiven = this.calculateTotal(filteredAndSortedSales, "amountGiven");
        let totalInBolivianos = this.calculateTotal(filteredAndSortedSales, "totalToPayInBolivianos");
        let totalInSoles = this.calculateTotal(filteredAndSortedSales, "totalToPayInSoles");
        this.setState({ filteredAndSortedSales, totalGiven, totalInBolivianos, totalInSoles });
    }

    filterSales(searchTerm, salesList) {
        let filteredSales = [];
        for (let sale of salesList) {
            for (let property in sale) {
                if (property !== "_id") {
                    if (sale[property].toString().toLowerCase().includes(searchTerm.toLowerCase())) {
                        filteredSales.push(sale);
                        break;
                    }
                }
            }
        }
        return filteredSales;
    }

    sortSales(sales, parameter, sortDirection) {
        let isAscendant = sortDirection === 'ascendant';
        sales.sort((first, second) => {
            if (first[parameter] < second[parameter])
                return isAscendant ? -1 : 1;
            if (first[parameter] > second[parameter])
                return isAscendant ? 1 : -1;
            return 0;
        });
        return sales;
    }

    async deleteSale() {
        let idToDelete = this.state.idToDelete;
        await this.setState({ isDeleting: true });
        let response = await axios.delete('https://us-central1-sistema-tienda-c6c67.cloudfunctions.net/deleteSale',
            {
                data: {
                    shouldUpdateInventory: this.state.shouldUpdateInventory,
                    sale: this.getSale(this.state.allSales, idToDelete)
                }
            });
        let { allSales, parameterToSortBy, sortDirection, searchFilter } = this.state;
        allSales = allSales.filter(element => element._id !== idToDelete);
        let filteredSales = this.filterSales(searchFilter, allSales);
        let filteredAndSortedSales = this.sortSales(filteredSales, parameterToSortBy, sortDirection);
        let totalGiven = this.calculateTotal(filteredAndSortedSales, "amountGiven");
        let totalInBolivianos = this.calculateTotal(filteredAndSortedSales, "totalToPayInBolivianos");
        let totalInSoles = this.calculateTotal(filteredAndSortedSales, "totalToPayInSoles");
        await this.setState({
            allSales, filteredAndSortedSales, totalGiven, totalInBolivianos, totalInSoles,
            isDeleting: false,
            message: response.data.error ? response.data.error : ''
        });
        this.closeModal();
    }

    openModal(id) {
        this.setState({ modalClass: "modal is-active", idToDelete: id })
    }

    closeModal() {
        this.setState({ modalClass: "modal", idToDelete: '' })
    }

    renderSales() {
        let tableSales = this.state.filteredAndSortedSales.map((sale, index) => {
            return (
                <tr key={sale._id}>
                    <td>
                        {sale.date}
                    </td>
                    <td>
                        {sale.model}
                    </td>
                    <td>
                        {sale.color}
                    </td>
                    <td>
                        {sale.amountGiven}
                    </td>
                    <td>
                        {sale.amountBorrowed}
                    </td>
                    <td>
                        {sale.totalGiven}
                    </td>
                    <td>
                        {sale.amountOnStock}
                    </td>
                    <td>
                        {sale.amountSold}
                    </td>
                    <td>
                        {sale.priceInBolivianos}/{sale.priceInSoles}
                    </td>
                    <td>
                        {sale.totalToPayInBolivianos}/{sale.totalToPayInSoles}
                    </td>
                    <td>
                        <div className="field has-addons">
                            <p className="control">
                                <Link
                                    className="button is-info"
                                    to={"/clientes/cliente/" + this.props.customerId + "/registro-de-ventas/venta/" + sale._id}>
                                    Ver/Editar
                                </Link>
                            </p>
                            <p className="control">
                                <button onClick={() => this.openModal(sale._id)} className="button is-danger">
                                    Eliminar
                                </button>
                            </p>
                        </div>
                    </td>
                </tr>
            )
        });
        return tableSales;
    }

    render() {
        const { totalGiven, totalInBolivianos, totalInSoles, modalClass, parameterToSortBy,
            sortDirection, searchFilter, isLoading, isDeleting, noSales, shouldUpdateInventory,
        message } = this.state;
        if (isLoading) {
            return (
                <div>
                    <progress className="progress is-small is-info" max="100">15%</progress>
                </div>
            );
        }
        if (noSales) {
            return (
                <div className="column has-text-centered">
                    <p>El cliente actual no tiene ventas registradas.</p>
                    <br></br>
                    <Link className="button is-success" to={"/clientes/cliente/" + this.props.customerId + "/registro-de-ventas/nueva-venta"}>Registrar nueva venta</Link>
                </div>
            );
        }
        return (
            <div>
                <div className="columns">
                    <div className="column has-text-centered">
                        <Link className="button is-success" to={"/clientes/cliente/" + this.props.customerId + "/registro-de-ventas/nueva-venta"}>Registrar nueva venta</Link>
                    </div>
                    <div className="column has-text-centered">
                        <div className="control">
                            <input className="input" type="text" placeholder="Buscar"
                                name="searchFilter" value={searchFilter} onChange={this.modifyStateOfSales}></input>
                        </div>
                    </div>
                    <div className="column has-text-centered">
                        <div className="columns is-mobile">
                            <div className="column has-text-right">
                                <label className="label">Ordenar por</label>
                            </div>
                            <div className="column has-text-left">
                                <div className="field">
                                    <div className="control has-text-left">
                                        <div className="select is-primary">
                                            <select name="parameterToSortBy" value={parameterToSortBy}
                                                onChange={this.modifyStateOfSales}>
                                                <option value="date">Fecha</option>
                                                <option value="model">Modelo</option>
                                                <option value="color">Color</option>
                                                <option value="amountGiven">Se le dió</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="column">
                        <div className="columns is-mobile">
                            <div className="column has-text-right">
                                <label className="label">De manera</label>
                            </div>
                            <div className="column has-text-left">
                                <div className="field has-text-left">
                                    <div className="control has-text-left">
                                        <div className="select is-info">
                                            <select name="sortDirection" value={sortDirection}
                                                onChange={this.modifyStateOfSales}>
                                                <option value="ascendant">Ascendente</option>
                                                <option value="descendant">Descendente</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="columns is-mobile is-centered">
                    <div className="column">
                        <table className="table is-striped is-fullwidth">
                            <thead>
                                <tr className="is-selected is-link">
                                    <th>Fecha</th>
                                    <th>Modelo</th>
                                    <th>Color</th>
                                    <th>Se le dio</th>
                                    <th>Prestó</th>
                                    <th>Total</th>
                                    <th>En stock</th>
                                    <th>Vendió</th>
                                    <th>Precio Bs/S</th>
                                    <th>Total Bs/S</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tfoot>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th>Total</th>
                                    <th>{totalGiven}</th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th>Total</th>
                                    <th>{totalInBolivianos}/{totalInSoles}</th>
                                    <th></th>
                                </tr>
                            </tfoot>
                            <tbody>
                                {this.renderSales()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={modalClass}>
                    <div className="modal-background"></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Eliminar venta</p>
                        </header>
                        <section className="modal-card-body">
                            ¿Está seguro de que desea eliminar la venta?
                            <br></br>
                            <br></br>
                            <div className="control">
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        name="hasOffer"
                                        checked={shouldUpdateInventory}
                                        onChange={this.toggleInventoryUpdateWhenDeleting}
                                    />
                                    Actualizar cantidad del inventario al eliminar venta
                                </label>
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button disabled={isDeleting} className="button is-danger" onClick={this.deleteSale}>Eliminar</button>
                            <button disabled={isDeleting} className="button" onClick={this.closeModal}>Cancelar</button>
                            {isDeleting && <p>Eliminando venta...</p>}
                        </footer>
                    </div>
                </div>
                {message && <p>{message}</p>}
                <PaymentsInAdvance></PaymentsInAdvance>
            </div>
        );
    }
}

const SalesRecordTable = withFirebase(SalesRecordTableBase);

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(SalesRecord);