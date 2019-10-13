import React, { Component } from 'react';
import { withFirebase } from '../../../providers/firebase';
import { Link, withRouter } from "react-router-dom";
import { withAuthorization } from '../../../providers/session';

const INITIAL_STATE = {
    name: '',
    code: '',
    color: '',
    amount: 0,
    isLoading: true,
    isSavingChanges: false,
    error: null
}

const EditItem = ({ match }) => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Editar item
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <EditItemForm itemId={match.params.itemId} />
    </div>
);

class EditItemFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    async componentDidMount() {
        let document = await this.props.firebase.getItemById(this.props.itemId);
        if (document.exists) {
            let item = document.data();
            this.setState({
                name: item.name,
                code: item.code,
                color: item.color,
                amount: item.amount,
                isLoading: false
            });
        }
        else {
            this.setState({
                isLoading: false,
                error: "El elemento no existe o hubo algun error al obtenerlo"
            });
        }
    }

    async handleSubmit(event) {
        let item = {
            name: this.state.name,
            code: this.state.code,
            color: this.state.color,
            amount: this.state.amount
        };
        event.preventDefault();
        await this.setState({ isSavingChanges: true });
        await this.props.firebase.updateItem(item, this.props.itemId);
        this.setState({ ...INITIAL_STATE });
        this.props.history.push("/inventario");
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
        const { name, code, color, amount, isLoading, isSavingChanges, error } = this.state;
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
                        <div className="field">
                            <label className="label">Código</label>
                            <div className="control">
                                <input className="input" type="text" placeholder="Código"
                                    name="code" value={code} onChange={this.handleChange}></input>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Color</label>
                            <div className="control">
                                <input className="input" type="text" placeholder="Color"
                                    name="color" value={color} onChange={this.handleChange}></input>
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Cantidad</label>
                            <div className="control">
                                <input className="input" type="number" min="0" placeholder="Cantidad"
                                    name="amount" value={amount} onChange={this.handleChange}></input>
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

const EditItemForm = withRouter(withFirebase(EditItemFormBase));

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(EditItem);