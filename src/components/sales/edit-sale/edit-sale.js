import React, { Component } from 'react';
import { withFirebase } from '../../../providers/firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../../../providers/session';
import axios from 'axios';
import { convertToBolivianos, convertToSoles } from '../../../utils/money-convertor';

const INITIAL_STATE = {
    date: '',
    model: '',
    code: '',
    color: '',
    amountGiven: 0,
    amountBorrowed: 0,
    totalGiven: 0,
    amountOnStock: 0,
    amountSold: 0,
    priceInBolivianos: 0,
    priceInSoles: 0,
    totalToPayInBolivianos: 0,
    totalToPayInSoles: 0,
    commentary: '',

    previousAmountBorrowed: 0,
    models: [],
    selectedModel: null,
    selectedColor: null,
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
        this.changeModel = this.changeModel.bind(this);
        this.changeColor = this.changeColor.bind(this);
        this.recalculateTotal = this.recalculateTotal.bind(this);
        this.modifyAmounts = this.modifyAmounts.bind(this);
        this.modifyPrices = this.modifyPrices.bind(this);
        this.modifyGivenAmounts = this.modifyGivenAmounts.bind(this);
        this.changeGivenAmount = this.changeGivenAmount.bind(this);
    }

    async componentDidMount() {
        await this.getModels();
        await this.getSale();
    }

    async getModels() {
        let response = await axios.get('https://us-central1-sistema-tienda-c6c67.cloudfunctions.net/getModelsWithColors')
        await this.setState({ models: response.data });
    }

    async getSale() {
        let document = await this.props.firebase.getSaleById(this.props.saleId);
        if (document.exists) {
            let sale = document.data();
            await this.setState(sale);
            let selectedModel = this.getSelectedModel(sale, this.state.models);
            let selectedColor = this.getSelectedColor(sale.color, selectedModel);
            let previousAmountBorrowed = this.state.amountBorrowed;
            this.setState({ selectedModel, selectedColor, previousAmountBorrowed, isLoading: false });
        }
        else {
            this.setState({
                isLoading: false,
                error: "La venta no existe, o el cliente no existe, o hubo un error en la obtención de datos"
            });
        }
    }

    getSelectedModel(sale, models) {
        return models.find(element => element.model === sale.model || element.code === sale.code);
    }

    getSelectedColor(color, selectedModel) {
        return selectedModel.colors.find(element => element.color === color);
    }

    createSaleObject(state) {
        let sale = JSON.parse(JSON.stringify(state));
        sale.customerId = this.props.customerId;
        delete sale.previousAmountBorrowed;
        delete sale.models;
        delete sale.selectedModel;
        delete sale.selectedColor;
        delete sale.isLoading;
        delete sale.isSavingChanges;
        delete sale.error;
        sale.priceInBolivianos = parseFloat(sale.priceInBolivianos);
        sale.priceInSoles = parseFloat(sale.priceInSoles);
        sale.totalToPayInBolivianos = parseFloat(sale.totalToPayInBolivianos);
        sale.totalToPayInSoles = parseFloat(sale.totalToPayInSoles);
        return sale;
    }

    async handleSubmit(event) {
        let sale = this.createSaleObject(this.state);
        event.preventDefault();
        await this.setState({ isSavingChanges: true });
        await this.props.firebase.updateSale(sale, this.props.saleId);
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
    }

    changeModel(event) {
        let model = this.state.models.find(element => element[event.target.name] === event.target.value);
        this.setState({ selectedModel: model, model: model.model, code: model.code, selectedColor: null, color: '' });
    }

    changeColor(event) {
        let color = this.state.selectedModel.colors.find(col => col.color === event.target.value);
        this.setState({ selectedColor: color, color: color.color });
    }

    async modifyPrices(event) {
        let priceInBolivianos, priceInSoles;
        if (event.target.name === "priceInBolivianos") {
            priceInBolivianos = event.target.value;
            priceInSoles = convertToSoles(priceInBolivianos).toFixed(2);
        }
        else {
            priceInSoles = event.target.value;
            priceInBolivianos = convertToBolivianos(priceInSoles).toFixed(2);
        }
        await this.setState({ priceInBolivianos, priceInSoles });
        this.recalculateTotal();
    }

    async modifyAmounts(event) {
        let value = parseInt(event.target.value);
        await this.setState({ [event.target.name]: value });
        this.recalculateTotal();
    }

    async modifyGivenAmounts(event) {
        let parameter = event.target.name;
        let rawValue = event.target.value;
        let value = parseInt(rawValue);
        await this.setState({ [parameter]: value });
        if (rawValue !== "")
            this.changeGivenAmount(parameter);
    }

    changeGivenAmount(parameter) {
        let previousAmountBorrowed = this.state.amountBorrowed;
        let amountBorrowedDifference = this.state.amountBorrowed - this.state.previousAmountBorrowed;
        let totalGiven = this.state.amountGiven - this.state.amountBorrowed;
        let amountOnStock = this.state.amountOnStock - amountBorrowedDifference;
        if (parameter === "amountBorrowed")
            this.setState({ totalGiven, amountOnStock, previousAmountBorrowed });
        else
            this.setState({ totalGiven });
    }

    recalculateTotal() {
        let totalToPayInBolivianos = (this.state.priceInBolivianos * this.state.amountSold).toFixed(2);
        let totalToPayInSoles = (this.state.priceInSoles * this.state.amountSold).toFixed(2);
        this.setState({ totalToPayInBolivianos, totalToPayInSoles });
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
        const { date, model, code, color, amountGiven, amountBorrowed, totalGiven,
            amountOnStock, amountSold, priceInBolivianos, priceInSoles,
            totalToPayInBolivianos, totalToPayInSoles, commentary, isLoading, isSavingChanges, error } = this.state;

        const isInvalid = model === '' || code === '' || color === '';
        
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
                                <div className="select">
                                    <select name="model" value={model} onChange={this.changeModel}>
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
                                    min="0"
                                    placeholder="Se le dió"
                                    name="amountGiven"
                                    value={amountGiven}
                                    onChange={this.modifyGivenAmounts}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Cantidad prestada</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    min="0"
                                    placeholder="Cantidad prestada"
                                    name="amountBorrowed"
                                    value={amountBorrowed}
                                    onChange={this.modifyGivenAmounts}
                                    max={amountBorrowed + amountOnStock}
                                />
                            </div>
                        </div>
                        { amountOnStock === 0 &&  <p>No se puede realizar un préstamo ya que no quedan unidades en stock.</p>}
                        <div className="field">
                            <label className="label">Total</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    placeholder="Total"
                                    name="totalGiven"
                                    value={totalGiven}
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
                                    min="0"
                                    placeholder="Tiene en stock"
                                    name="amountOnStock"
                                    value={amountOnStock}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Vendió</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type="number"
                                    min="0"
                                    placeholder="Vendió"
                                    name="amountSold"
                                    value={amountSold}
                                    onChange={this.modifyAmounts}
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Precio</label>
                            <div className="field-body">
                                <div className="field">
                                    <p className="control is-expanded has-icons-left">
                                        <input
                                            className="input"
                                            type="number"
                                            placeholder="Total"
                                            name="priceInBolivianos"
                                            value={priceInBolivianos}
                                            onChange={this.modifyPrices}
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
                                            name="priceInSoles"
                                            value={priceInSoles}
                                            onChange={this.modifyPrices}
                                        />
                                        <span className="icon is-small is-left">
                                            S/
                                        </span>

                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Total a pagar</label>
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
                        <div class="field">
                            <label class="label">Comentario</label>
                            <div class="control">
                                <textarea
                                    class="textarea"
                                    placeholder="Comentario"
                                    name="commentary"
                                    value={commentary}
                                    onChange={this.handleChange}
                                ></textarea>
                            </div>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button disabled={isSavingChanges || isInvalid} type="submit" className="button is-info">Guardar cambios</button>
                            </div>
                            <div className="control">
                                <Link disabled={isSavingChanges} to={"/clientes/cliente/" + this.props.customerId + "/registro-de-ventas"} className="button is-light">Cancelar</Link>
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