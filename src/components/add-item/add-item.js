import React, { Component } from 'react';
import { withFirebase } from '../firebase';

const AddItem = () => (
    <div>
        <AddItemForm />
    </div>
);

class AddItemFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            code: '',
            color: '',
            amount: 0
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        this.props.firebase.addItem(this.state).then((response) => {
            console.log(response);
        })
    }

    onChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    };


    render() {
        return (
            <form onSubmit={this.onSubmit}>
                <div className="field">
                    <label className="label">Nombre</label>
                    <div className="control">
                        <input className="input" type="text" placeholder="Nombre"
                        name="name" value={this.state.name} onChange={this.onChange}></input>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Código</label>
                    <div className="control">
                        <input className="input" type="text" placeholder="Código"
                            name="code" value={this.state.code} onChange={this.onChange}></input>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Color</label>
                    <div className="control">
                        <input className="input" type="text" placeholder="Color"
                            name="color" value={this.state.color} onChange={this.onChange}></input>
                    </div>
                </div>
                <div className="field">
                    <label className="label">Cantidad</label>
                    <div className="control">
                        <input className="input" type="number" placeholder="Cantidad"
                            name="amount" value={this.state.amount} onChange={this.onChange}></input>
                    </div>
                </div>
                <div className="field is-grouped">
                    <div className="control">
                        <button type="submit" className="button is-link">Submit</button>
                    </div>
                    <div className="control">
                        <button type="submit" className="button is-text">Cancel</button>
                    </div>
                </div>
            </form>
        )
    }
}

const AddItemForm = withFirebase(AddItemFormBase);

export default AddItem;
