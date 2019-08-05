import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link } from "react-router-dom";
import { withAuthorization } from '../session';

const INITIAL_STATE = {
    allCustomers: [],
    filteredAndSortedCustomers: [],
    modalClass: "modal",
    idToDelete: '',
    parameterToSortBy: 'name',
    sortDirection: 'ascendant',
    searchFilter: ''
}

const CustomersList = () => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Lista de clientes
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <CustomersTable />
    </div>
);

class CustomersTableBase extends Component {

    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.deleteCustomer = this.deleteCustomer.bind(this);
        this.modifyStateOfCustomers = this.modifyStateOfCustomers.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        const self = this;
        let customers = [];
        this.props.firebase.getCustomers().then((response) => {
            response.forEach(doc => {
                let customer = doc.data();
                customer["_id"] = doc.id;
                customers.push(customer);
            });
            self.setState({ allCustomers: customers, filteredAndSortedCustomers: customers });
        })
    }

    openModal(id) {
        this.setState({ modalClass: "modal is-active", idToDelete: id })
    }

    modifyStateOfCustomers(event) {
        this.setState({ [event.target.name]: event.target.value }, () => {
            let { allCustomers, sortDirection, searchFilter } = this.state;
            let filteredCustomers = this.filterCustomers(searchFilter, allCustomers);
            let sortedCustomers = this.sortCustomers(filteredCustomers, sortDirection);
            this.setState({ filteredAndSortedCustomers: sortedCustomers });
        })
    }

    filterCustomers(searchTerm, customersList) {
        let filteredCustomers = [];
        for (let customer of customersList) {
            if (customer.name.includes(searchTerm)) {
                filteredCustomers.push(customer);
                break;
            }
        }
        return filteredCustomers;
    }

    sortCustomers(customers, sortDirection) {
        let isAscendant = sortDirection === 'ascendant';
        customers.sort((first, second) => {
            if (first.name < second.name)
                return isAscendant ? -1 : 1;
            if (first.name > second.name)
                return isAscendant ? 1 : -1;
            return 0;
        });
        return customers;
    }

    deleteCustomer() {
        let idToDelete = this.state.idToDelete;
        this.props.firebase.deleteCustomer(idToDelete).then(() => {
            let { allCustomers, sortDirection, searchFilter } = this.state;
            allCustomers = allCustomers.filter(element => element._id !== idToDelete);
            let filteredCustomers = this.filterCustomers(searchFilter, allCustomers);
            let sortedCustomers = this.sortCustomers(filteredCustomers, sortDirection);
            this.setState({ allCustomers: allCustomers, filteredAndSortedCustomers: sortedCustomers });
            this.closeModal();
        });
    }

    closeModal() {
        this.setState({ modalClass: "modal", idToDelete: '' })
    }

    renderCustomers() {
        let tableCustomers = this.state.filteredAndSortedCustomers.map((customer, index) => {
            return (
                <tr key={customer._id}>
                    <td>
                        {customer.name}
                    </td>
                    <td>
                        <div className="field has-addons">
                            <p className="control">
                                <Link className="button is-info" to={"/customer/" + customer._id}>
                                    Ver/Editar
                                </Link>
                            </p>
                            <p className="control">
                                <button onClick={() => this.openModal(customer._id)} className="button is-danger">
                                    Eliminar
                                </button>
                            </p>
                            <p className="control">
                                <Link className="button is-info" to={"/customer/" + customer._id + "/sales"}>
                                    Ver ventas
                                </Link>
                            </p>
                        </div>
                    </td>
                </tr>
            )
        });
        return tableCustomers;
    }

    render() {
        const { modalClass, sortDirection, searchFilter } = this.state;
        return (
            <div>
                <div className="columns">
                    <div className="column has-text-centered">
                        <Link className="button is-success" to="/nuevo-customer">Añadir nuevo cliente</Link>
                    </div>
                    <div className="column has-text-centered">
                        <div className="control">
                            <input className="input" type="text" placeholder="Buscar"
                                name="searchFilter" value={searchFilter} onChange={this.modifyStateOfCustomers}></input>
                        </div>
                    </div>
                    <div className="column">
                        <div className="columns is-mobile">
                            <div className="column has-text-right">
                                <label className="label">Ordenar de manera</label>
                            </div>
                            <div className="column has-text-left">
                                <div className="field has-text-left">
                                    <div className="control has-text-left">
                                        <div className="select is-info">
                                            <select name="sortDirection" value={sortDirection}
                                                onChange={this.modifyStateOfCustomers}>
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
                    <div className="column is-four-fifths">
                        <table className="table is-striped is-fullwidth">
                            <thead>
                                <tr className="is-selected is-link">
                                    <th>Nombre</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tfoot>
                                <tr>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </tfoot>
                            <tbody>
                                {this.renderCustomers()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={modalClass}>
                    <div className="modal-background"></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Eliminar cliente</p>
                        </header>
                        <section className="modal-card-body">
                            ¿Está seguro de que desea eliminar al cliente?
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-danger" onClick={this.deleteCustomer}>Eliminar</button>
                            <button className="button" onClick={this.closeModal}>Cancelar</button>
                        </footer>
                    </div>
                </div>

            </div>
        );
    }
}

const CustomersTable = withFirebase(CustomersTableBase);

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(CustomersList);