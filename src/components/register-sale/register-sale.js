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
    regularPriceInBolivianos: 0,
    regularPriceInSoles: 0,
    regularPriceInBolivianosTotal: 0,
    regularPriceInSolesTotal: 0,
    amountSoldAtOfferPrice: 0,
    offerPriceInBolivianos: 0,
    offerPriceInSoles: 0,
    offerPriceInBolivianosTotal: 0,
    offerPriceInSolesTotal: 0,
    totalToPayInBolivianos: 0,
    totalToPayInSoles: 0,

    hasOffer: false,
    models: [],
    selectedModel: null,
    selectedColor: null,
    isLoading: true,
    isSavingData: false
}

const RegisterSale = ({ match }) => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Registrar venta/entrega
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <RegisterSaleForm customerId={match.params.customerId} />
    </div>
);

class RegisterSaleFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.getModels = this.getModels.bind(this);
        this.changeModel = this.changeModel.bind(this);
        this.changeColor = this.changeColor.bind(this);
        this.recalculateTotal = this.recalculateTotal.bind(this);
        this.modifyAmounts = this.modifyAmounts.bind(this);
        this.modifyRegularPrices = this.modifyRegularPrices.bind(this);
        this.modifyOfferPrices = this.modifyOfferPrices.bind(this);
    }

    async componentDidMount() {
        await this.getModels();
    }

    async getModels() {
        let response = await axios.get('https://us-central1-sistema-tienda-c6c67.cloudfunctions.net/getModelsWithColors');
        this.setState({ models: response.data, isLoading: false });
    }

    createSaleObject(state) {
        let sale = JSON.parse(JSON.stringify(state));
        sale.customerId = this.props.customerId;
        delete sale.hasOffer;
        delete sale.models;
        delete sale.selectedModel;
        delete sale.selectedColor;
        delete sale.isLoading;
        delete sale.isSavingData;
        sale.regularPriceInBolivianos = parseFloat(sale.regularPriceInBolivianos);
        sale.regularPriceInSoles = parseFloat(sale.regularPriceInSoles);
        sale.offerPriceInBolivianos = parseFloat(sale.offerPriceInBolivianos);
        sale.offerPriceInSoles = parseFloat(sale.offerPriceInSoles);
        sale.totalToPayInBolivianos = parseFloat(sale.totalToPayInBolivianos);
        sale.totalToPayInSoles = parseFloat(sale.totalToPayInSoles);
        return sale;
    }

    async handleSubmit(event) {
        let sale = this.createSaleObject(this.state);
        event.preventDefault();
        await this.setState({ isSavingData: true });
        await this.props.firebase.registerSale(sale);
        this.setState({ ...INITIAL_STATE });
        this.props.history.push("/clientes/cliente/" + this.props.customerId + "/registro-de-ventas");
    }

    handleChange(event) {
        let value;
        if (event.target.type === "number")
            value = parseInt(event.target.value);
        else if (event.target.type === "checkbox")
            value = event.target.checked;
        else
            value = event.target.value;
        this.setState({ [event.target.name]: value });
    }

    changeModel(event) {
        let model = this.state.models.find(element => element[event.target.name] === event.target.value);
        this.setState({ selectedModel: model, model: model.model, code: model.code, selectedColor: null, color: '' });
    }

    changeColor(event) {
        let color = this.state.selectedModel.colors.find(col => col.color === event.target.value);
        this.setState({ selectedColor: color, color: color.color });
    }

    convertToSoles(price) {
        return price * 0.49;
    }

    convertToBolivianos(price) {
        return price * 2.05;
    }

    async modifyRegularPrices(event) {
        let priceInBolivianos, priceInSoles;
        if (event.target.name === "regularPriceInBolivianos") {
            priceInBolivianos = event.target.value;
            priceInSoles = this.convertToSoles(priceInBolivianos).toFixed(2);
        }
        else {
            priceInSoles = event.target.value;
            priceInBolivianos = this.convertToBolivianos(priceInSoles).toFixed(2);
        }
        await this.setState({
            regularPriceInBolivianos: priceInBolivianos,
            regularPriceInSoles: priceInSoles
        });
        this.recalculateTotal();
    }

    async modifyOfferPrices(event) {
        let priceInBolivianos, priceInSoles;
        if (event.target.name === "offerPriceInBolivianos") {
            priceInBolivianos = event.target.value;
            priceInSoles = this.convertToSoles(priceInBolivianos).toFixed(2);
        }
        else {
            priceInSoles = event.target.value;
            priceInBolivianos = this.convertToBolivianos(priceInSoles).toFixed(2);
        }
        await this.setState({
            offerPriceInBolivianos: priceInBolivianos,
            offerPriceInSoles: priceInSoles
        });
        this.recalculateTotal();
    }

    async modifyAmounts(event) {
        let value = parseInt(event.target.value);
        await this.setState({ [event.target.name]: value });
        this.recalculateTotal();
    }

    recalculateTotal() {
        let regularPriceInBolivianosTotal = this.state.regularPriceInBolivianos * this.state.amountSoldAtRegularPrice;
        let regularPriceInSolesTotal = this.state.regularPriceInSoles * this.state.amountSoldAtRegularPrice;
        let offerPriceInBolivianosTotal = this.state.offerPriceInBolivianos * this.state.amountSoldAtOfferPrice;
        let offerPriceInSolesTotal = this.state.offerPriceInSoles * this.state.amountSoldAtOfferPrice;
        let totalToPayInBolivianos = (regularPriceInBolivianosTotal + offerPriceInBolivianosTotal).toFixed(2);
        let totalToPayInSoles = (regularPriceInSolesTotal + offerPriceInSolesTotal).toFixed(2);
        this.setState({
            regularPriceInBolivianosTotal, regularPriceInSolesTotal, offerPriceInBolivianosTotal,
            offerPriceInSolesTotal, totalToPayInBolivianos, totalToPayInSoles
        });
    }

    renderModelOptions() {
        let modelOptions = this.state.models.map((item, index) => {
            return (
                <option key={index} value={item.model}>{item.model}</option>
            )
        });
        return modelOptions;
    }

    renderCodeOptions() {
        let codeOptions = this.state.models.map((item, index) => {
            return (
                <option key={index} value={item.code}>{item.code}</option>
            )
        })
        return codeOptions;
    }

    renderAvailableColorsForModel() {
        let colors = this.state.selectedModel.colors.map((color, index) => {
            return (
                <option key={index} value={color.color}>{color.color}</option>
            )
        })
        return colors;
    }

    render() {
        const { date, model, code, color, amountGiven, amountOnStock, amountSoldAtRegularPrice,
            regularPriceInBolivianos, regularPriceInSoles, regularPriceInBolivianosTotal,
            regularPriceInSolesTotal, amountSoldAtOfferPrice, offerPriceInBolivianos, offerPriceInSoles,
            offerPriceInBolivianosTotal, offerPriceInSolesTotal, totalToPayInBolivianos,
            totalToPayInSoles, hasOffer, isLoading, isSavingData } = this.state;

        const isInvalid = model === '' || code === '' || color === '';

        if (isLoading) {
            return (
                <div>
                    <progress className="progress is-small is-info" max="100">15%</progress>
                </div>
            );
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
                                <div className="select">
                                    <select name="model" value={model} onChange={this.changeModel}>
                                        {!this.state.selectedModel && <option value="">-</option>}
                                        {this.renderModelOptions()}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Código</label>
                            <div className="control">
                                <div className="select">
                                    <select name="code" value={code} onChange={this.changeModel}>
                                        {!this.state.selectedModel && <option value="">-</option>}
                                        {this.renderCodeOptions()}
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Color</label>
                            <div className="control">
                                <div className="select">
                                    <select name="color" value={color} onChange={this.changeColor}>
                                        {!this.state.selectedColor && <option value="">-</option>}
                                        {this.state.selectedModel && this.renderAvailableColorsForModel()}
                                    </select>
                                </div>
                            </div>
                        </div>
                        {this.state.selectedColor && <p>Cantidad disponible de ese color {this.state.selectedColor.amount}</p>}
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
                                    onChange={this.modifyAmounts}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Precio regular</label>
                            <div className="field-body">
                                <div className="field">
                                    <p className="control is-expanded has-icons-left">
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Total"
                                            name="regularPriceInBolivianos"
                                            value={regularPriceInBolivianos}
                                            onChange={this.modifyRegularPrices}
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
                                            name="regularPriceInSoles"
                                            value={regularPriceInSoles}
                                            onChange={this.modifyRegularPrices}
                                        />
                                        <span className="icon is-small is-left">
                                            S/
                                        </span>

                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Total a pagar (precio regular)</label>
                            <div className="field-body">
                                <div className="field">
                                    <p className="control is-expanded has-icons-left">
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Total"
                                            name="regularPriceInBolivianosTotal"
                                            value={regularPriceInBolivianosTotal}
                                            disabled
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
                                            name="regularPriceInSolesTotal"
                                            value={regularPriceInSolesTotal}
                                            disabled
                                        />
                                        <span className="icon is-small is-left">
                                            S/
                                        </span>

                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="field">
                            <div className="control">
                                <label className="checkbox">
                                    <input
                                        type="checkbox"
                                        name="hasOffer"
                                        checked={hasOffer}
                                        onChange={this.handleChange}
                                    />
                                    También vendió con oferta
                                </label>
                            </div>
                        </div>
                        {hasOffer && <div className="field">
                            <label className="label">Vendió (precio con oferta)</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Vendió"
                                    name="amountSoldAtOfferPrice"
                                    value={amountSoldAtOfferPrice}
                                    onChange={this.modifyAmounts}
                                />
                            </div>
                        </div>}
                        {hasOffer && <div className="field">
                            <label className="label">Precio de oferta</label>
                            <div className="field-body">
                                <div className="field">
                                    <p className="control is-expanded has-icons-left">
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Total"
                                            name="offerPriceInBolivianos"
                                            value={offerPriceInBolivianos}
                                            onChange={this.modifyOfferPrices}
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
                                            name="offerPriceInSoles"
                                            value={offerPriceInSoles}
                                            onChange={this.modifyOfferPrices}
                                        />
                                        <span className="icon is-small is-left">
                                            S/
                                        </span>

                                    </p>
                                </div>
                            </div>
                        </div>}
                        {hasOffer && <div className="field-body">
                            <div className="field">
                                <p className="control is-expanded has-icons-left">
                                    <input
                                        className="input"
                                        type="number"
                                        placeholder="Total"
                                        name="offerPriceInBolivianosTotal"
                                        value={offerPriceInBolivianosTotal}
                                        disabled
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
                                        name="offerPriceInSolesTotal"
                                        value={offerPriceInSolesTotal}
                                        disabled
                                    />
                                    <span className="icon is-small is-left">
                                        S/
                                        </span>

                                </p>
                            </div>
                        </div>}
                        <div className="field">
                            <label className="label">Total a pagar global</label>
                            <div className="field-body">
                                <div className="field">
                                    <p className="control is-expanded has-icons-left">
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Total"
                                            name="totalToPayInBolivianos"
                                            value={totalToPayInBolivianos}
                                            disabled
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
                                            name="totalToPayInSoles"
                                            value={totalToPayInSoles}
                                            disabled
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
                                <button disabled={isSavingData || isInvalid} type="submit" className="button is-info">Guardar</button>
                            </div>
                            <div className="control">
                                <Link disabled={isSavingData} to="/inventario" className="button is-light">Cancelar</Link>
                            </div>
                        </div>
                        {isSavingData && <p>Registrando venta...</p>}
                    </form>
                </div>
            </div>
        )
    }
}

const RegisterSaleForm = withRouter(withFirebase(RegisterSaleFormBase));

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(RegisterSale);