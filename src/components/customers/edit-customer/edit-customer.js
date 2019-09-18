import React, { Component } from 'react';
import { withFirebase } from '../../../providers/firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../../../providers/session';

const INITIAL_STATE = {
    name: '',
    isLoading: true,
    isSavingChanges: false,
    error: null
}

const EditCustomer = ({ match }) => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Editar cliente
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <EditCustomerForm customerId={match.params.customerId} />
    </div>
);

class EditCustomerFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    async componentDidMount() {
        let document = await this.props.firebase.getCustomerById(this.props.customerId);
        if (document.exists) {
            let customer = document.data();
            this.setState({ name: customer.name, isLoading: false });
        }
        else {
            this.setState({
                isLoading: false,
                error: "El cliente no está registrado o hubo algun error al obtenerlo"
            });
        }
    }

    async handleSubmit(event) {
        let customer = { name: this.state.name };
        event.preventDefault();
        await this.setState({ isSavingChanges: true });
        await this.props.firebase.updateCustomer(customer, this.props.customerId);
        this.setState({ ...INITIAL_STATE });
        this.props.history.push("/clientes");
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { name, isLoading, isSavingChanges, error } = this.state;
        if (isLoading) {
            return (
                <div>
                    <progress className="progress is-small is-info" max="100">15%</progress>
                </div>
            );
        }
        if (error) {
            return (
                <div>
                    <p>{error}</p>
                </div>
            )
        }
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
                                <button disabled={isSavingChanges} type="submit" className="button is-info">Guardar</button>
                            </div>
                            <div className="control">
                                <Link disabled={isSavingChanges} to="/clientes" className="button is-light">Cancelar</Link>
                            </div>
                        </div>
                        {isSavingChanges && <p>Guardando cambios...</p>}
                    </form>
                </div>
            </div>
        )
    }
}

const EditCustomerForm = withRouter(withFirebase(EditCustomerFormBase));

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(EditCustomer);