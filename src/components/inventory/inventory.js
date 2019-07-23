import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

const Inventory = () => (
    <div>
        <h1 className="title">Inventario</h1>
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
            idToDelete: ''
        }
        this.openModal = this.openModal.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
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
        })
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
                                <Link className="button" to={"/item/" + item._id}>
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
                            <button className="button">Cancelar</button>
                        </footer>
                    </div>
                </div>

            </div>
        );
    }
}

const InventoryTable = withFirebase(InventoryTableBase);

export default Inventory;