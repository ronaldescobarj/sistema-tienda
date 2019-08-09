import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../session';
import axios from 'axios';

const INITIAL_STATE = {
    date: '',
    model: '',
    code: '',
    color: '',
    amountGiven: 0,
    amountOnStock: 0,
    amountSoldAtRegularPrice: 0,
    regularPrice: 0,
    totalToPayOnRegularPrice: 0,
    amountSoldAtOfferPrice: 0,
    offerPrice: 0,
    totalToPayOnOfferPrice: 0,
    totalToPay: 0,
    hasOffer: false,
    isLoading: true,
    isSavingChanges: false,
    error: null
}

const EditSale = ({ match }) => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Editar venta/entrega
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <EditSaleForm customerId={match.params.customerId} saleId={match.params.saleId} />
    </div>
);

class EditSaleFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getModels = this.getModels.bind(this);
        this.recalculateTotal = this.recalculateTotal.bind(this);
    }

    componentDidMount() {
        this.getModels();
    }

    getModels() {
        axios.get('https://us-central1-sistema-tienda-c6c67.cloudfunctions.net/getModelsWithColors')
            .then(response => {
                this.setState({ models: response.data }, () => {
                    this.getSale();
                });
            })
    }

    getSale() {
        this.props.firebase.getSaleById(this.props.saleId).then((doc) => {
            if (doc.exists) {
                let sale = doc.data();
                this.setState(sale, () => {
                    this.setState({ isLoading: false });
                });
            }
            else {
                this.setState({
                    isLoading: false,
                    error: "La venta no existe, o el cliente no existe, o hubo un error en la obtención de datos"
                });
            }
        });
    }

    handleSubmit(event) {
        let sale = {
            customerId: this.props.customerId,
            date: this.state.date,
            model: this.state.model,
            code: this.state.code,
            color: this.state.color,
            amountGiven: this.state.amountGiven,
            amountOnStock: this.state.amountOnStock,
            amountSoldAtRegularPrice: this.state.amountSoldAtRegularPrice,
            regularPrice: this.state.regularPrice,
            totalToPayOnRegularPrice: this.state.totalToPayOnRegularPrice,
            amountSoldAtOfferPrice: this.state.amountSoldAtOfferPrice,
            offerPrice: this.state.offerPrice,
            totalToPayOnOfferPrice: this.state.totalToPayOnOfferPrice,
            totalToPay: this.state.totalToPay
        };
        event.preventDefault();
        this.setState({ isSavingChanges: true }, () => {
            this.props.firebase.updateSale(sale, this.props.saleId).then((response) => {
                this.setState({ ...INITIAL_STATE });
                this.props.history.push("/clientes/cliente/" + this.props.customerId + "/registro-de-ventas");
            });
        });
    }

    handleChange(event) {
        let value;
        if (event.target.type === "number")
            value = parseInt(event.target.value);
        else
            value = event.target.value;
        this.setState({ [event.target.name]: value });
    }

    recalculateTotal(event) {
        this.setState({ [event.target.name]: parseInt(event.target.value) }, () => {
            let regularPriceTotal = this.state.regularPrice * this.state.amountSoldAtRegularPrice;
            let offerPriceTotal = this.state.offerPrice * this.state.amountSoldAtOfferPrice;
            let total = regularPriceTotal + offerPriceTotal;
            this.setState({
                totalToPayOnRegularPrice: regularPriceTotal,
                totalToPayOnOfferPrice: offerPriceTotal,
                totalToPay: total
            });
        });
    }

    render() {
        const { date, model, code, color, amountGiven,
            amountOnStock, amountSoldAtRegularPrice, regularPrice, totalToPayOnRegularPrice,
            amountSoldAtOfferPrice, offerPrice, totalToPayOnOfferPrice, totalToPay,
            isLoading, isSavingChanges, error } = this.state;
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
                                <input
                                    className="input"
                                    type="date"
                                    placeholder="Fecha"
                                    name="date"
                                    value={date}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Modelo</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    name="model"
                                    value={model}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Código</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="text"
                                    name="code"
                                    value={code}
                                    disabled
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Color</label>
                            <div className="control">
                                <div className="control">
                                    <input
                                        className="input"
                                        type="text"
                                        name="color"
                                        value={color}
                                        disabled
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Se le dió</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Se le dió"
                                    name="amountGiven"
                                    value={amountGiven}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Tiene en stock</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Tiene en stock"
                                    name="amountOnStock"
                                    value={amountOnStock}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Vendió (precio normal)</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Vendió"
                                    name="amountSoldAtRegularPrice"
                                    value={amountSoldAtRegularPrice}
                                    onChange={this.recalculateTotal}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Precio regular</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Vendió"
                                    name="regularPrice"
                                    value={regularPrice}
                                    onChange={this.recalculateTotal}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Total a pagar (precio regular)</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Total"
                                    name="totalToPayOnRegularPrice"
                                    value={totalToPayOnRegularPrice}
                                    onChange={this.recalculateTotal}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="label">Vendió (precio con oferta)</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Vendió"
                                    name="amountSoldAtOfferPrice"
                                    value={amountSoldAtOfferPrice}
                                    onChange={this.recalculateTotal}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Precio con oferta</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Precio"
                                    name="offerPrice"
                                    value={offerPrice}
                                    onChange={this.recalculateTotal}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Total a pagar (precio de oferta)</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Total"
                                    name="totalToPayOnOfferPrice"
                                    value={totalToPayOnOfferPrice}
                                    onChange={this.recalculateTotal}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Total a pagar global</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Total"
                                    name="totalToPayOnRegularPrice"
                                    value={totalToPay}
                                    onChange={this.recalculateTotal}
                                />
                            </div>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button disabled={isSavingChanges} type="submit" className="button is-info">Guardar cambios</button>
                            </div>
                            <div className="control">
                                <Link disabled={isSavingChanges} to="/inventario" className="button is-light">Cancelar</Link>
                            </div>
                        </div>
                        {isSavingChanges && <p>Guardando cambios...</p>}
                    </form>
                </div>
            </div >
        )
    }
}

const EditSaleForm = withRouter(withFirebase(EditSaleFormBase));

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(EditSale);