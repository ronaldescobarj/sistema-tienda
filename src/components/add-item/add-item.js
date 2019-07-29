import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Redirect } from "react-router-dom";
import { withAuthorization } from '../session';

const AddItem = () => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Añadir nuevo item
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <AddItemForm />
    </div>
);

class AddItemFormBase extends Component {
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

    onSubmit(event) {
        let item = {
            name: this.state.name,
            code: this.state.code,
            color: this.state.color,
            amount: parseInt(this.state.amount)
        };
        event.preventDefault();
        this.props.firebase.addItem(item).then((response) => {
            this.redirectToInventory();
        })
    }

    redirectToInventory() {
        this.setState( {redirect: true} );
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
            <div className="columns is-mobile">
                <div className="column is-half is-offset-one-quarter">
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
                                <button type="submit" className="button is-info">Guardar</button>
                            </div>
                            <div className="control">
                                <button onClick={this.redirectToInventory} className="button is-light">Cancelar</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        )
    }
}

const AddItemForm = withFirebase(AddItemFormBase);

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(AddItem);

