import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link } from "react-router-dom";

const ForgotPassword = () => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Recuperar contraseña
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <ForgotPasswordForm />
    </div>
);

class ForgotPasswordFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            error: null,
            showMessage: false
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
    }

    onSubmit(event) {
        event.preventDefault();
        const { email } = this.state;
        this.props.firebase.resetPassword(email).then(() => {
            this.setState({ showMessage: true });
        })
            .catch(error => {
                this.setState({ error });
            });

    }

    onChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    };


    render() {
        const { error } = this.state;

        const isInvalid = this.state.email === '';

        return (
            <div>
                <div className="columns is-mobile">
                    <div className="column is-half is-offset-one-quarter">
                        <form onSubmit={this.onSubmit}>
                            <div className="field">
                                <label className="label">Correo electrónico</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        name="email"
                                        value={this.state.email}
                                        onChange={this.onChange}
                                        type="text"
                                        placeholder="Correo electrónico"
                                    />
                                </div>
                            </div>
                            <div className="control">
                                <button disabled={isInvalid} type="submit" className="button is-info">Restaurar contraseña</button>
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
                                    <p>Para reestablecer contraseña</p>
                                </div>
                                <div className="message-body">
                                    <p>Ingresa a tu correo electrónico y sigue los pasos</p>
                                    <br></br>
                                    <div className="has-text-centered">
                                        <Link to="/iniciar-sesion" className="button is-info">
                                            Volver a inicio de sesión
                                    </Link>
                                    </div>
                                    
                                </div>
                            </article>
                        </div>
                    </div> : null}
            </div>
        )
    }
}

const ForgotPasswordForm = withFirebase(ForgotPasswordFormBase);

export default ForgotPassword;

