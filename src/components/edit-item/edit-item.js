import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Redirect } from "react-router-dom";

const EditItem = ({ match }) => (
    <div>
        <EditItemForm itemId={match.params.id} />
    </div>
);

class EditItemFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            code: '',
            color: '',
            amount: 0,
            redirect: false
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.redirectToInventory = this.redirectToInventory.bind(this);
    }

    componentDidMount() {
        const self = this;
        this.props.firebase.getItemById(this.props.itemId).then((doc) => {
            if (doc.exists) {
                self.setState(doc.data());
            }
            else {
                console.log("no existe");
            }
        });
    }

    redirectToInventory() {
        this.setState({ redirect: true })
    }

    onSubmit(event) {
        let item = {
            name: this.state.name,
            code: this.state.code,
            color: this.state.color,
            amount: parseInt(this.state.amount)
        };
        event.preventDefault();
        this.props.firebase.updateItem(item, this.props.itemId).then(() => {
            this.redirectToInventory();
        })
    }

    onChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    };


    render() {
        const { redirect } = this.state;

        if (redirect) {
            return <Redirect to='/inventario' />;
        }

        return (
            <form onSubmit={this.onSubmit}>
                <div className="field">
                    <label className="label">Nombre</label>
                    <div className="control">
                        <input className="input" type="text" placeholder="Nombre"
                            name="name" value={this.state.name} onChange={this.onChange}></input>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Código</label>
                    <div className="control">
                        <input className="input" type="text" placeholder="Código"
                            name="code" value={this.state.code} onChange={this.onChange}></input>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Color</label>
                    <div className="control">
                        <input className="input" type="text" placeholder="Color"
                            name="color" value={this.state.color} onChange={this.onChange}></input>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Cantidad</label>
                    <div className="control">
                        <input className="input" type="number" placeholder="Cantidad"
                            name="amount" value={this.state.amount} onChange={this.onChange}></input>
                    </div>
                </div>
                <div className="field is-grouped">
                    <div className="control">
                        <button type="submit" className="button is-link">Guardar</button>
                    </div>
                    <div className="control">
                        <button onClick={this.redirectToInventory} className="button is-text">Cancelar</button>
                    </div>
                </div>
            </form>
        )
    }
}

const EditItemForm = withFirebase(EditItemFormBase);

export default EditItem;
