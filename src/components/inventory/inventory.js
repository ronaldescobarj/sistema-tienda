import React, { Component } from 'react';
import { withFirebase } from '../firebase';

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
        }
    }

    componentDidMount() {
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
                        </tr>
                    </thead>
                    <tfoot>
                        <tr>
                            <th></th>
                            <th></th>
                            <th>Total</th>
                            <th>{this.state.total}</th>
                        </tr>
                    </tfoot>
                    <tbody>
                        {this.renderItems()}
                    </tbody>
                </table>
            </div>
        );
    }
}

const InventoryTable = withFirebase(InventoryTableBase);

export default Inventory;