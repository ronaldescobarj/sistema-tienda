import React, { Component } from 'react';
import { withFirebase } from '../../../providers/firebase';
import { Link } from "react-router-dom";
import { withAuthorization } from '../../../providers/session';
import parseDate from '../../../utils/date-parser';

const INITIAL_STATE = {
    allPayments: [],
    filteredAndSortedPayments: [],
    totalInBolivianos: 0,
    totalInSoles: 0,
    modalClass: "modal",
    idToDelete: '',
    parameterToSortBy: 'numberOfPayment',
    sortDirection: 'ascendant',
    searchFilter: '',
    isLoading: true,
    isDeleting: false,
    noPayments: false,
    shouldUpdateInventory: false
}

const PaymentsInAdvance = ({ match }) => (
    <div>
        <section className="hero is-small is-light">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Pagos por adelantado
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <PaymentsInAdvanceTable customerId={match.params.customerId} />
    </div>
);

class PaymentsInAdvanceTableBase extends Component {

    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.deletePayment = this.deletePayment.bind(this);
        this.modifyStateOfPayments = this.modifyStateOfPayments.bind(this);
    }

    async componentDidMount() {
        await this.getData();
    }

    async getData() {
        let payments = [];
        let totalInBolivianos = 0, totalInSoles = 0;
        let response = await this.props.firebase.getPaymentsByParameter("customerId", this.props.customerId);
        if (!response.empty) {
            response.forEach(doc => {
                let payment = doc.data();
                payment["_id"] = doc.id;
                payments.push(payment);
                totalInBolivianos += parseFloat(payment.amountPaidInBolivianos);
                totalInSoles += parseFloat(payment.amountPaidInSoles);
            });
            payments = this.sortPayments(payments, "numberOfPayment", "ascendant");
            this.setState({
                allPayments: payments,
                filteredAndSortedPayments: payments,
                totalInBolivianos, totalInSoles,
                isLoading: false
            });
        }
        else {
            this.setState({ isLoading: false, noPayments: true });
        }
    }

    getPayment(payments, id) {
        return payments.find(payment => payment._id === id);
    }

    calculateTotal(payments, parameter) {
        let total = 0;
        payments.forEach(payment => {
            total += parseFloat(payment[parameter]);
        })
        return total;
    }

    async modifyStateOfPayments(event) {
        await this.setState({ [event.target.name]: event.target.value });
        let { allPayments, parameterToSortBy, sortDirection, searchFilter } = this.state;
        let filteredPayments = this.filterPayments(searchFilter, allPayments);
        let sortedPayments = this.sortPayments(filteredPayments, parameterToSortBy, sortDirection);
        let totalInBolivianos = this.calculateTotal(sortedPayments, "amountPaidInBolivianos");
        let totalInSoles = this.calculateTotal(sortedPayments, "amountPaidInSoles");
        this.setState({
            filteredAndSortedPayments: sortedPayments,
            totalInBolivianos, totalInSoles
        });
    }

    filterPayments(searchTerm, paymentsList) {
        let filteredPayments = [];
        for (let payment of paymentsList) {
            for (let property in payment) {
                if (property !== "_id") {
                    if (payment[property].toString().includes(searchTerm)) {
                        filteredPayments.push(payment);
                        break;
                    }
                }
            }
        }
        return filteredPayments;
    }

    sortPayments(payments, parameter, sortDirection) {
        let isAscendant = sortDirection === 'ascendant';
        payments.sort((first, second) => {
            if (first[parameter] < second[parameter])
                return isAscendant ? -1 : 1;
            if (first[parameter] > second[parameter])
                return isAscendant ? 1 : -1;
            return 0;
        });
        return payments;
    }

    async deletePayment() {
        let idToDelete = this.state.idToDelete;
        await this.setState({ isDeleting: true });
        await this.props.firebase.deletePayment(idToDelete);
        let { allPayments, parameterToSortBy, sortDirection, searchFilter } = this.state;
        allPayments = allPayments.filter(element => element._id !== idToDelete);
        let filteredPayments = this.filterPayments(searchFilter, allPayments);
        let sortedPayments = this.sortPayments(filteredPayments, parameterToSortBy, sortDirection);
        let totalInBolivianos = this.calculateTotal(sortedPayments, "amountPaidInBolivianos");
        let totalInSoles = this.calculateTotal(sortedPayments, "amountPaidInSoles");
        this.setState({
            allPayments: allPayments,
            filteredAndSortedPayments: sortedPayments,
            totalInBolivianos, totalInSoles,
            isDeleting: false,
        });
        this.closeModal();
    }

    openModal(id) {
        this.setState({ modalClass: "modal is-active", idToDelete: id })
    }

    closeModal() {
        this.setState({ modalClass: "modal", idToDelete: '' })
    }

    renderPayments() {
        let tablePayments = this.state.filteredAndSortedPayments.map((payment, index) => {
            return (
                <tr key={payment._id}>
                    <td>
                        {parseDate(payment.date)}
                    </td>
                    <td>
                        {payment.numberOfPayment}
                    </td>
                    <td>
                        {payment.amountPaidInBolivianos}
                    </td>
                    <td>
                        {payment.amountPaidInSoles}
                    </td>
                    <td>
                        <div className="field has-addons">
                            <p className="control">
                                <Link
                                    className="button is-info"
                                    to={"/clientes/cliente/" + this.props.customerId + "/adelantos-de-pago/pago/" + payment._id}>
                                    Ver/Editar
                                </Link>
                            </p>
                            <p className="control">
                                <button onClick={() => this.openModal(payment._id)} className="button is-danger">
                                    Eliminar
                                </button>
                            </p>
                        </div>
                    </td>
                </tr>
            )
        });
        return tablePayments;
    }

    render() {
        const { totalInBolivianos, totalInSoles, modalClass, parameterToSortBy,
            sortDirection, searchFilter, isLoading, isDeleting, noPayments } = this.state;
        if (isLoading) {
            return (
                <div>
                    <progress className="progress is-small is-info" max="100">15%</progress>
                </div>
            );
        }
        if (noPayments) {
            return (
                <div className="column has-text-centered">
                    <p>El cliente actual no tiene pagos registrados.</p>
                    <br></br>
                    <Link className="button is-success" to={"/clientes/cliente/" + this.props.customerId + "/adelantos-de-pago/nuevo-pago"}>Registrar nuevo pago</Link>
                </div>
            );
        }
        return (
            <div>
                <div className="columns">
                    <div className="column has-text-centered">
                        <Link className="button is-success" to={"/clientes/cliente/" + this.props.customerId + "/adelantos-de-pago/nuevo-pago"}>Registrar nuevo pago</Link>
                    </div>
                    <div className="column has-text-centered">
                        <div className="control">
                            <input className="input" type="text" placeholder="Buscar"
                                name="searchFilter" value={searchFilter} onChange={this.modifyStateOfPayments}></input>
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
                                                onChange={this.modifyStateOfPayments}>
                                                <option value="numberOfPayment">Numero de pago</option>
                                                <option value="date">Fecha</option>
                                                <option value="amountPaidInBolivianos">Cantidad pagada</option>
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
                                                onChange={this.modifyStateOfPayments}>
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
                    <div style={{ overflowX: 'auto' }} className="column is-four-fifths">
                        <table className="table is-striped is-fullwidth">
                            <thead>
                                <tr className="is-selected is-link">
                                    <th>Fecha</th>
                                    <th>Número</th>
                                    <th>Cantidad pagada Bs</th>
                                    <th>Cantidad pagada S/</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tfoot>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th>{totalInBolivianos}</th>
                                    <th>{totalInSoles}</th>
                                    <th></th>
                                </tr>
                            </tfoot>
                            <tbody>
                                {this.renderPayments()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={modalClass}>
                    <div className="modal-background"></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Eliminar pago</p>
                        </header>
                        <section className="modal-card-body">
                            ¿Está seguro de que desea eliminar el pago?
                        </section>
                        <footer className="modal-card-foot">
                            <button disabled={isDeleting} className="button is-danger" onClick={this.deletePayment}>Eliminar</button>
                            <button disabled={isDeleting} className="button" onClick={this.closeModal}>Cancelar</button>
                            {isDeleting && <p>Eliminando pago...</p>}
                        </footer>
                    </div>
                </div>
            </div>
        );
    }
}

const PaymentsInAdvanceTable = withFirebase(PaymentsInAdvanceTableBase);

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(PaymentsInAdvance);