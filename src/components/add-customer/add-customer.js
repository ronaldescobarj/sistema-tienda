import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../session';

const INITIAL_STATE = {
    name: '',
    isSavingData: false
}

const AddCustomer = () => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Añadir nuevo cliente
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <AddCustomerForm />
    </div>
);

class AddCustomerFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit(event) {
        let customer = { name: this.state.name };
        event.preventDefault();
        this.setState({ isSavingData: true }, () => {
            this.props.firebase.addCustomer(customer).then((response) => {
                this.setState({ ...INITIAL_STATE });
                this.props.history.push("/clientes");
            });
        });
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { name, isSavingData } = this.state;
        return (
            <div className="columns is-mobile">
                <div className="column is-half is-offset-one-quarter">
                    <form onSubmit={this.handleSubmit}>
                        <div className="field">
                            <label className="label">Nombre</label>
                            <div className="control">
                                <input className="input" type="text" placeholder="Nombre"
                                    name="name" value={name} onChange={this.handleChange}></input>
                            </div>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button disabled={isSavingData} type="submit" className="button is-info">Guardar</button>
                            </div>
                            <div className="control">
                                <Link disabled={isSavingData} to="/clientes" className="button is-light">Cancelar</Link>
                            </div>
                        </div>
                        {isSavingData && <p>Guardando item...</p>}
                    </form>
                </div>
            </div>
        )
    }
}

const AddCustomerForm = withRouter(withFirebase(AddCustomerFormBase));

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(AddCustomer);

