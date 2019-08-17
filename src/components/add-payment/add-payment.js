import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../session';

const INITIAL_STATE = {
    date: '',
    numberOfPayment: 0,
    amountPaid: 0,
    isSavingData: false
}

const AddPayment = ({ match }) => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Registrar nuevo pago
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <AddPaymentForm customerId={match.params.customerId} />
    </div>
);

class AddPaymentFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    async handleSubmit(event) {
        let payment = {
            date: this.state.date,
            numberOfPayment: this.state.numberOfPayment,
            amountPaid: this.state.amountPaid,
            customerId: this.props.customerId
        };
        event.preventDefault();
        await this.setState({ isSavingData: true });
        try {
            await this.props.firebase.addPayment(payment);
        } catch(error) {
            console.log(error);    
        }
        this.setState({ ...INITIAL_STATE });
        this.props.history.push("/clientes/cliente/" + this.props.customerId + "/adelantos-de-pago");
    }

    handleChange(event) {
        let value;
        if (event.target.type === "number")
            value = parseInt(event.target.value);
        else
            value = event.target.value;
        this.setState({ [event.target.name]: value });
    };

    render() {
        const { date, numberOfPayment, amountPaid, isSavingData } = this.state;
        return (
            <div className="columns is-mobile">
                <div className="column is-half is-offset-one-quarter">
                    <form onSubmit={this.handleSubmit}>
                        <div className="field">
                            <label className="label">Fecha</label>
                            <div className="control">
                                <input className="input" type="date" placeholder="Fecha"
                                    name="date" value={date} onChange={this.handleChange}></input>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Número de pago</label>
                            <div className="control">
                                <input className="input" type="number" placeholder="Número de pago"
                                    name="numberOfPayment" value={numberOfPayment} onChange={this.handleChange}></input>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Cantidad pagada</label>
                            <div className="control">
                                <input className="input" type="number" placeholder="Cantidad pagada"
                                    name="amountPaid" value={amountPaid} onChange={this.handleChange}></input>
                            </div>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button disabled={isSavingData} type="submit" className="button is-info">Guardar</button>
                            </div>
                            <div className="control">
                                <Link disabled={isSavingData} to="/inventario" className="button is-light">Cancelar</Link>
                            </div>
                        </div>
                        {isSavingData && <p>Guardando pago...</p>}
                    </form>
                </div>
            </div>
        )
    }
}

const AddPaymentForm = withRouter(withFirebase(AddPaymentFormBase));

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(AddPayment);

