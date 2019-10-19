
import React, { Component } from 'react';
import { withFirebase } from '../../../providers/firebase';
import { Link } from "react-router-dom";
import { withAuthorization } from '../../../providers/session';
import axios from 'axios';
import parseDate from '../../../utils/date-parser';

const INITIAL_STATE = {
    allSales: [],
    filteredAndSortedSales: [],
    totalSold: 0,
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

const SingleSalesRecord = ({ match }) => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Registro de ventas individuales
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <SingleSalesRecordTable />
    </div>
);

class SingleSalesRecordTableBase extends Component {

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
        let totalSold = 0, totalInBolivianos = 0, totalInSoles = 0;
        let response = await this.props.firebase.getSingleSales();
        if (!response.empty) {
            response.forEach(doc => {
                let sale = doc.data();
                sale["_id"] = doc.id;
                sales.push(sale);
                totalSold += parseInt(sale.amountSold);
                totalInBolivianos += parseInt(sale.totalToPayInBolivianos);
                totalInSoles += parseInt(sale.totalToPayInSoles);
            });
            this.setState({
                allSales: sales,
                filteredAndSortedSales: sales,
                totalSold,
                totalInBolivianos,
                totalInSoles,
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
        let totalSold = this.calculateTotal(filteredAndSortedSales, "amountSold");
        let totalInBolivianos = this.calculateTotal(filteredAndSortedSales, "totalToPayInBolivianos");
        let totalInSoles = this.calculateTotal(filteredAndSortedSales, "totalToPayInSoles");
        this.setState({ filteredAndSortedSales, totalSold, totalInBolivianos, totalInSoles });
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
        let response = await axios.delete('https://us-central1-sistema-tienda-c6c67.cloudfunctions.net/deleteSingleSale',
            {
                data: {
                    shouldUpdateInventory: this.state.shouldUpdateInventory,
                    sale: this.getSale(this.state.allSales, idToDelete)
                }
            });
        let { allSales, parameterToSortBy, sortDirection, searchFilter } = this.state;
        allSales = allSales.filter(element => element._id !== idToDelete);
        let filteredSales = this.filterSales(searchFilter, allSales);
        let sortedSales = this.sortSales(filteredSales, parameterToSortBy, sortDirection);
        let totalGiven = this.calculateTotal(sortedSales, "amountGiven");
        let totalOnStock = this.calculateTotal(sortedSales, "amountOnStock");
        let total = this.calculateTotal(sortedSales, "totalToPay");
        await this.setState({
            allSales: allSales,
            filteredAndSortedSales: sortedSales,
            totalGiven: totalGiven,
            totalOnStock: totalOnStock,
            total: total,
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
                        {parseDate(sale.date)}
                    </td>
                    <td>
                        {sale.code}
                    </td>
                    <td>
                        {sale.color}
                    </td>
                    <td>
                        {sale.customerName}
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
                                    to={"/ventas-individuales/venta-individual/" + sale._id}>
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
        const { totalSold, totalInBolivianos, totalInSoles, modalClass, parameterToSortBy,
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
                    <p>No hay ventas individuales registradas.</p>
                    <br></br>
                    <Link className="button is-success" to={"/ventas-individuales/nueva-venta-individual"}>Registrar nueva venta</Link>
                </div>
            );
        }
        return (
            <div>
                <div className="columns">
                    <div className="column has-text-centered">
                        <Link className="button is-success" to={"ventas-individuales/nueva-venta-individual"}>Registrar nueva venta</Link>
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
                                                <option value="amountGiven">Cantidad vendida</option>
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
                                    <th>Código</th>
                                    <th>Color</th>
                                    <th>Cliente</th>
                                    <th>Cantidad vendida</th>
                                    <th>Precio Bs/S/</th>
                                    <th>Total Bs/S/</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tfoot>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th></th>
                                    <th>Total</th>
                                    <th>{totalSold}</th>
                                    <th>Total a pagar</th>
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
            </div>
        );
    }
}

const SingleSalesRecordTable = withFirebase(SingleSalesRecordTableBase);

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(SingleSalesRecord);