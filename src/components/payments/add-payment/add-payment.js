import React, { Component } from 'react';
import { withFirebase } from '../../../providers/firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../../../providers/session';

const INITIAL_STATE = {
    date: '',
    numberOfPayment: 0,
    amountPaidInBolivianos: 0,
    amountPaidInSoles: 0,
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
        this.modifyPaymentAmounts = this.modifyPaymentAmounts.bind(this);
    }

    async handleSubmit(event) {
        let payment = {
            date: this.state.date,
            numberOfPayment: this.state.numberOfPayment,
            amountPaidInBolivianos: this.state.amountPaidInBolivianos,
            amountPaidInSoles: this.state.amountPaidInSoles,
            customerId: this.props.customerId
        };
        event.preventDefault();
        await this.setState({ isSavingData: true });
        await this.props.firebase.addPayment(payment);
        this.setState({ ...INITIAL_STATE });
        this.props.history.push("/clientes/cliente/" + this.props.customerId + "/registro-de-ventas");
    }

    handleChange(event) {
        let value;
        if (event.target.type === "number")
            value = parseInt(event.target.value);
        else
            value = event.target.value;
        this.setState({ [event.target.name]: value });
    };

    convertToSoles(price) {
        return price * 0.49;
    }

    convertToBolivianos(price) {
        return price * 2.05;
    }

    modifyPaymentAmounts(event) {
        let amountPaidInBolivianos, amountPaidInSoles;
        if (event.target.name === "amountPaidInBolivianos") {
            amountPaidInBolivianos = event.target.value;
            amountPaidInSoles = this.convertToSoles(amountPaidInBolivianos).toFixed(2);
        }
        else {
            amountPaidInSoles = event.target.value;
            amountPaidInBolivianos = this.convertToBolivianos(amountPaidInSoles).toFixed(2);
        }
        this.setState({ amountPaidInBolivianos, amountPaidInSoles });
    }

    render() {
        const { date, numberOfPayment, amountPaidInBolivianos, amountPaidInSoles, isSavingData } = this.state;
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
                            <label className="label">Monto pagado</label>
                            <div className="field-body">
                                <div className="field">
                                    <p className="control is-expanded has-icons-left">
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Monto pagado"
                                            name="amountPaidInBolivianos"
                                            value={amountPaidInBolivianos}
                                            onChange={this.modifyPaymentAmounts}
                                        />
                                        <span className="icon is-small is-left">
                                            Bs
                                        </span>
                                    </p>
                                </div>
                                <div className="field">
                                    <p className="control is-expanded has-icons-left">
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Total"
                                            name="amountPaidInSoles"
                                            value={amountPaidInSoles}
                                            onChange={this.modifyPaymentAmounts}
                                        />
                                        <span className="icon is-small is-left">
                                            S/
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button disabled={isSavingData} type="submit" className="button is-info">Guardar</button>
                            </div>
                            <div className="control">
                                <Link disabled={isSavingData} to={"/clientes/cliente/" + this.props.customerId + "/registro-de-ventas"} className="button is-light">Cancelar</Link>
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

