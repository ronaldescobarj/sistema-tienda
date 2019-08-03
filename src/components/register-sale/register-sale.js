import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../session';

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
    models: [],
    selectedModel: null,
    selectedColor: null
}

const RegisterSale = () => (
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
        <RegisterSaleForm />
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
    }

    componentDidMount() {
        this.getModels();
    }

    getModels() {
        this.props.firebase.getItems().then((response) => {
            let models = new Map();
            let modelKey, modelValue;
            response.forEach(doc => {
                modelKey = JSON.stringify({ model: doc.data().name, code: doc.data().code });
                if (models.has(modelKey)) {
                    modelValue = models.get(modelKey);
                    modelValue.push({ color: doc.data().color, amount: doc.data().amount });
                }
                else {
                    modelValue = [{ color: doc.data().color, amount: doc.data().amount }];
                }
                models.set(modelKey, modelValue);
            });
            let modelsArray = [];
            let newModel;
            for (let model of [...models]) {
                newModel = JSON.parse(model[0]);
                newModel.colors = model[1];
                modelsArray.push(newModel);
            }
            this.setState({ models: modelsArray });
        })
    }

    handleSubmit(event) {
        let item = this.state;
        event.preventDefault();
        this.props.firebase.addItem(item).then((response) => {
            this.setState({ ...INITIAL_STATE });
            this.props.history.push("/registro-de-ventas");
        })
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
        this.setState({ selectedModel: model, model: model.model, code: model.code });
    }

    changeColor(event) {
        let color = this.state.selectedModel.colors.find(col => col.color == event.target.value);
        this.setState({ selectedColor: color, color: color.color });
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
        const { date, model, code, color, amountGiven,
            amountOnStock, amountSoldAtRegularPrice, regularPrice, totalToPayOnRegularPrice, hasOffer,
            amountSoldAtOfferPrice, offerPrice, totalToPayOnOfferPrice, totalToPay } = this.state;
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
                                        <option value="-">-</option>
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
                                        <option value="-">-</option>
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
                                        <option value="-">-</option>
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
                        <div class="field">
                            <div class="control">
                                <label class="checkbox">
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
                                    onChange={this.recalculateTotal}
                                />
                            </div>
                        </div>}
                        {hasOffer && <div className="field">
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
                        </div>}
                        {hasOffer && <div className="field">
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
                        </div>}
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
                                <button type="submit" className="button is-info">Guardar</button>
                            </div>
                            <div className="control">
                                <Link to="/inventario" className="button is-light">Cancelar</Link>
                            </div>
                        </div>
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