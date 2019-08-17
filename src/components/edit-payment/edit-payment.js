import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../session';

const INITIAL_STATE = {
    date: '',
    numberOfPayment: 0,
    amountPaid: 0,
    isLoading: true,
    isSavingChanges: false,
    error: null
}

const EditPayment = ({ match }) => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Editar pago
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <EditPaymentForm customerId={match.params.customerId} paymentId={match.params.paymentId} />
    </div>
);

class EditPaymentFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    async componentDidMount() {
        let doc = await this.props.firebase.getPaymentById(this.props.paymentId);
        if (doc.exists) {
            let payment = doc.data();
            this.setState({
                date: payment.date,
                numberOfPayment: payment.numberOfPayment,
                amountPaid: payment.amountPaid,
                isLoading: false
            });
        }
        else {
            this.setState({
                isLoading: false,
                error: "El pago no existe o hubo algun error al obtenerlo"
            });
        }
    }

    async handleSubmit(event) {
        let payment = {
            date: this.state.date,
            numberOfPayment: this.state.numberOfPayment,
            amountPaid: this.state.amountPaid,
            customerId: this.props.customerId
        };
        event.preventDefault();
        await this.setState({ isSavingChanges: true })
        try {
            await this.props.firebase.updatePayment(payment, this.props.paymentId);
        } catch (err) {
            console.log(err);
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
        const { date, numberOfPayment, amountPaid, isLoading, isSavingChanges, error } = this.state;
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
                                <button disabled={isSavingChanges} type="submit" className="button is-info">Guardar</button>
                            </div>
                            <div className="control">
                                <Link disabled={isSavingChanges} to="/inventario" className="button is-light">Cancelar</Link>
                            </div>
                        </div>
                        {isSavingChanges && <p>Guardando cambios...</p>}
                    </form>
                </div>
            </div>
        )
    }
}

const EditPaymentForm = withRouter(withFirebase(EditPaymentFormBase));

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(EditPayment);