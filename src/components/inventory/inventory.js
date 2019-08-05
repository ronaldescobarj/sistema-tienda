import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link } from "react-router-dom";
import { withAuthorization } from '../session';

const INITIAL_STATE = {
    allItems: [],
    filteredAndSortedItems: [],
    total: 0,
    modalClass: "modal",
    idToDelete: '',
    parameterToSortBy: 'name',
    sortDirection: 'ascendant',
    searchFilter: ''
}

const Inventory = () => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Inventario
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <InventoryTable />
    </div>
);

class InventoryTableBase extends Component {

    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.modifyStateOfItems = this.modifyStateOfItems.bind(this);
    }

    componentDidMount() {
        this.getData();
    }

    getData() {
        const self = this;
        let items = [];
        let total = 0;
        this.props.firebase.getItems().then((response) => {
            response.forEach(doc => {
                let item = doc.data();
                item["_id"] = doc.id;
                items.push(item);
                total += parseInt(item.amount);
            });
            self.setState({ allItems: items, filteredAndSortedItems: items, total: total });
        })
    }

    calculateTotal(items) {
        let total = 0;
        items.forEach(item => {
            total += parseInt(item.amount);
        })
        return total;
    }

    openModal(id) {
        this.setState({ modalClass: "modal is-active", idToDelete: id })
    }

    modifyStateOfItems(event) {
        this.setState({ [event.target.name]: event.target.value }, () => {
            let { allItems, parameterToSortBy, sortDirection, searchFilter } = this.state;
            let filteredItems = this.filterItems(searchFilter, allItems);
            let sortedItems = this.sortItems(filteredItems, parameterToSortBy, sortDirection);
            let total = this.calculateTotal(sortedItems);
            this.setState({ filteredAndSortedItems: sortedItems, total: total });
        })
    }

    filterItems(searchTerm, itemsList) {
        let filteredItems = [];
        for (let item of itemsList) {
            for (let property in item) {
                if (property !== "_id") {
                    if (item[property].toString().includes(searchTerm)) {
                        filteredItems.push(item);
                        break;
                    }
                }
            }
        }
        return filteredItems;
    }

    deleteItem() {
        let idToDelete = this.state.idToDelete;
        this.props.firebase.deleteItem(idToDelete).then(() => {
            let { allItems, parameterToSortBy, sortDirection, searchFilter } = this.state;
            allItems = allItems.filter(element => element._id !== idToDelete);
            let filteredItems = this.filterItems(searchFilter, allItems);
            let sortedItems = this.sortItems(filteredItems, parameterToSortBy, sortDirection);
            let total = this.calculateTotal(sortedItems);
            this.setState({ allItems: allItems, filteredAndSortedItems: sortedItems, total: total });
            this.closeModal();
        });
    }

    sortItems(items, parameter, sortDirection) {
        let isAscendant = sortDirection === 'ascendant';
        items.sort((first, second) => {
            if (first[parameter] < second[parameter])
                return isAscendant ? -1 : 1;
            if (first[parameter] > second[parameter])
                return isAscendant ? 1 : -1;
            return 0;
        });
        return items;
    }

    closeModal() {
        this.setState({ modalClass: "modal", idToDelete: '' })
    }

    renderItems() {
        let tableItems = this.state.filteredAndSortedItems.map((item, index) => {
            return (
                <tr key={item._id}>
                    <td>
                        {item.name}
                    </td>
                    <td>
                        {item.code}
                    </td>
                    <td>
                        {item.color}
                    </td>
                    <td>
                        {item.amount}
                    </td>
                    <td>
                        <div className="field has-addons">
                            <p className="control">
                                <Link className="button is-info" to={"/item/" + item._id}>
                                    Ver/Editar
                                </Link>
                            </p>
                            <p className="control">
                                <button onClick={() => this.openModal(item._id)} className="button is-danger">
                                    Eliminar
                                </button>
                            </p>
                        </div>
                    </td>
                </tr>
            )
        });
        return tableItems;
    }

    render() {
        const { total, modalClass, parameterToSortBy, sortDirection, searchFilter } = this.state;
        return (
            <div>
                <div className="columns">
                    <div className="column has-text-centered">
                        <Link className="button is-success" to="/nuevo-item">Añadir nuevo item</Link>
                    </div>
                    <div className="column has-text-centered">
                        <div className="control">
                            <input className="input" type="text" placeholder="Buscar"
                                name="searchFilter" value={searchFilter} onChange={this.modifyStateOfItems}></input>
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
                                                onChange={this.modifyStateOfItems}>
                                                <option value="name">Nombre</option>
                                                <option value="code">Código</option>
                                                <option value="color">Color</option>
                                                <option value="amount">Cantidad</option>
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
                                                onChange={this.modifyStateOfItems}>
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
                                    <th>Código</th>
                                    <th>Color</th>
                                    <th>Cantidad</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tfoot>
                                <tr>
                                    <th></th>
                                    <th></th>
                                    <th>Total</th>
                                    <th>{total}</th>
                                    <th></th>
                                </tr>
                            </tfoot>
                            <tbody>
                                {this.renderItems()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={modalClass}>
                    <div className="modal-background"></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Eliminar item</p>
                        </header>
                        <section className="modal-card-body">
                            ¿Está seguro de que desea eliminar el elemento?
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button is-danger" onClick={this.deleteItem}>Eliminar</button>
                            <button className="button" onClick={this.closeModal}>Cancelar</button>
                        </footer>
                    </div>
                </div>

            </div>
        );
    }
}

const InventoryTable = withFirebase(InventoryTableBase);

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(Inventory);