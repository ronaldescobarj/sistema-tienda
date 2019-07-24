import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link } from "react-router-dom";

const Inventory = () => (
    <div>
        <section className="hero is-small is-info">
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
        this.state = {
            items: [],
            total: 0,
            modalClass: "modal",
            idToDelete: '',
            parameterToSortBy: 'name',
            sortDirection: 'ascendant'
        }
        this.openModal = this.openModal.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
        this.sort = this.sort.bind(this);
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
                let obj = doc.data();
                obj["_id"] = doc.id;
                items.push(obj);
                total += parseInt(doc.data().amount);
            });
            self.setState({ items: items, total: total });
        })
    }

    openModal(id) {
        this.setState({ modalClass: "modal is-active", idToDelete: id })
    }

    deleteItem() {
        this.props.firebase.deleteItem(this.state.idToDelete).then(() => {
            this.getData();
            this.closeModal();
        });
    }

    sort(event) {
        this.setState({ [event.target.name]: event.target.value }, () => {
            console.log(this.state);
            let parameter = this.state.parameterToSortBy;
            let isAscendant = this.state.sortDirection === 'ascendant';
            let items = this.state.items;
            items.sort((first, second) => {
                if (first[parameter] < second[parameter])
                    return isAscendant ? -1 : 1;
                if (first[parameter] > second[parameter])
                    return isAscendant ? 1 : -1;
                return 0;
            });
            this.setState({ items: items });
        });
    }

    closeModal() {
        this.setState({ modalClass: "modal", idToDelete: '' })
    }

    renderItems() {
        let tableItems = this.state.items.map((item, index) => {
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
        return (
            <div>
                <div className="columns">
                    <div className="column has-text-centered">
                        <Link className="button is-success" to="/nuevo-item">Añadir nuevo item</Link>
                    </div>
                    <div className="column has-text-centered">
                        <div className="field is-horizontal has-text-centered">
                            <div className="field-label">
                                <label className="label">Ordenar por</label>
                            </div>
                            <div className="field-body">
                                <div className="field">
                                    <div className="control">
                                        <div className="select is-primary">
                                            <select name="parameterToSortBy" value={this.state.parameterToSortBy}
                                                onChange={this.sort}>
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
                        <div className="field is-horizontal">
                            <div className="field-label">
                                <label className="label">De manera</label>
                            </div>
                            <div className="field-body">
                                <div className="field">
                                    <div className="control">
                                        <div className="select is-info">
                                            <select name="sortDirection" value={this.state.sortDirection} onChange={this.sort}>
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
                    <div className="column is-three-fifths">
                        <table className="table">
                            <thead>
                                <tr>
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
                                    <th>{this.state.total}</th>
                                    <th></th>
                                </tr>
                            </tfoot>
                            <tbody>
                                {this.renderItems()}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={this.state.modalClass}>
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

export default Inventory;