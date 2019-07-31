import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link } from "react-router-dom";
import { withAuthorization } from '../session';

const INITIAL_STATE = {
    passwordOne: '',
    passwordTwo: '',
    error: null,
    showMessage: false
}

const EditAccount = () => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Cambiar contraseña
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <ChangePasswordForm />
    </div>
);

class ChangePasswordFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    handleSubmit(event) {
        const { passwordOne } = this.state;
        event.preventDefault();
        this.props.firebase.updatePassword(passwordOne).then(() => {
            this.setState({ showMessage: true });
        })
            .catch(error => {
                this.setState({ error });
            });
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        const { error } = this.state;

        const isInvalid = this.state.passwordOne !== this.state.passwordTwo || this.state.passwordOne === '';

        return (
            <div>
                <div className="columns is-mobile">
                    <div className="column is-half is-offset-one-quarter">
                        <form onSubmit={this.handleSubmit}>
                            <div className="field">
                                <label className="label">Nueva contraseña</label>
                                <div className="control">
                                    <input
                                    className="input"
                                        name="passwordOne"
                                        value={this.state.passwordOne}
                                        onChange={this.handleChange}
                                        type="password"
                                        placeholder="Nueva contraseña"
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Confirmar nueva contraseña</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        name="passwordTwo"
                                        value={this.state.passwordTwo}
                                        onChange={this.handleChange}
                                        type="password"
                                        placeholder="Confirmar nueva contraseña"
                                    />
                                </div>
                            </div>
                            <div className="control">
                                <button disabled={isInvalid} type="submit" className="button is-info">Cambiar contraseña</button>
                            </div>
                            {error && <p>{error.message}</p>}
                        </form>
                    </div>
                </div>
                {this.state.showMessage ?
                    <div className="columns is-mobile">
                        <div className="column is-half is-offset-one-quarter">
                            <article className="message">
                                <div className="message-header">
                                    <p>Éxito</p>
                                </div>
                                <div className="message-body">
                                    <p>Se cambió la contraseña correctamente</p>
                                    <br></br>
                                    <div className="has-text-centered">
                                        <Link to="/" className="button is-info">
                                            Volver
                                    </Link>
                                    </div>
                                </div>
                            </article>
                        </div>
                    </div> : null}
            </div>
        );
    }
}


const ChangePasswordForm = withFirebase(ChangePasswordFormBase);

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(EditAccount);

