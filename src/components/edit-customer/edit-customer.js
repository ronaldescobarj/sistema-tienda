import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../session';

const INITIAL_STATE = {
    name: ''
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

    componentDidMount() {
        const self = this;
        this.props.firebase.getCustomerById(this.props.customerId).then((doc) => {
            if (doc.exists) {
                self.setState(doc.data());
            }
            else {
                console.log("no existe");
            }
        });
    }

    handleSubmit(event) {
        let customer = this.state;
        event.preventDefault();
        this.props.firebase.updateCustomer(customer, this.props.customerId).then(() => {
            this.setState({ ...INITIAL_STATE });
            this.props.history.push("/clientes");
        })
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    };

    render() {
        const { name } = this.state;
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
                                <button type="submit" className="button is-info">Guardar</button>
                            </div>
                            <div className="control">
                                <Link to="/clientes" className="button is-light">Cancelar</Link>
                            </div>
                        </div>
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