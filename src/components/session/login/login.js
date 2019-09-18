import React, { Component } from 'react';
import { withFirebase } from '../../../providers/firebase';
import { Link, withRouter } from "react-router-dom";

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null,
    isLoggingIn: false
}

const LoginPage = () => (
    <div>
        <section className="hero is-small is-primary">
            <div className="hero-body">
                <div className="container has-text-centered">
                    <h1 className="title">
                        Iniciar sesión
                    </h1>
                </div>
            </div>
        </section>
        <br></br>
        <LoginForm />
    </div>
);

class LoginFormBase extends Component {
    constructor(props) {
        super(props);
        this.state = { ...INITIAL_STATE };
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    async handleSubmit(event) {
        const { email, password } = this.state;
        event.preventDefault();
        await this.setState({ isLoggingIn: true });
        try {
            await this.props.firebase.login(email, password);
        } catch (error) {
            this.setState({ error: this.translateErrorMessage(error), isLoggingIn: false });
        }
        this.setState({ ...INITIAL_STATE });
        this.props.history.push("/");
    }

    translateErrorMessage(error) {
        switch (error.code) {
            case "auth/user-not-found":
                return "No existe un usuario registrado con este correo electrónico.";
            case "auth/wrong-password":
                return "Contraseña incorrecta.";
            default:
                return "Error al iniciar sesión.";
        }
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        const { email, password, error, isLoggingIn } = this.state;
        const isInvalid = password === '' || email === '';
        return (
            <div className="columns is-mobile">
                <div className="column is-half is-offset-one-quarter">
                    <form onSubmit={this.handleSubmit}>
                        <div className="field">
                            <label className="label">Correo electrónico</label>
                            <div className="control">
                                <input
                                    className="input"
                                    name="email"
                                    value={email}
                                    onChange={this.handleChange}
                                    type="text"
                                    placeholder="Correo electrónico"
                                />
                            </div>
                        </div>
                        <div className="field">
                            <label className="label">Contraseña</label>
                            <div className="control">
                                <input
                                    className="input"
                                    name="password"
                                    value={password}
                                    onChange={this.handleChange}
                                    type="password"
                                    placeholder="Contraseña"
                                />
                            </div>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button disabled={isInvalid || isLoggingIn} type="submit" className="button is-info">Iniciar sesión</button>
                            </div>
                            <div className="control">
                                <Link disabled={isLoggingIn} to="/olvide-mi-contrasenia" className="button is-light">Olvidé mi contraseña</Link>
                            </div>
                        </div>
                        {isLoggingIn && <p>Iniciando sesión...</p>}
                        {error && <p>{error}</p>}
                    </form>
                </div>
            </div>
        );
    }
}

const LoginForm = withRouter(withFirebase(LoginFormBase));

export default LoginPage;
