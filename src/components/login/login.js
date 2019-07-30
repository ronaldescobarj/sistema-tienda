import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Redirect } from "react-router-dom";
import { Link } from "react-router-dom";

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

        this.state = {
            email: '',
            password: '',
            error: null,
            redirect: false
        };
        this.onSubmit = this.onSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.redirectToMainPage = this.redirectToMainPage.bind(this);
    }

    onSubmit(event) {
        const { email, password } = this.state;
        event.preventDefault();
        this.props.firebase.login(email, password).then(() => {
            this.setState({ email: '', password: '', error: null });
            this.redirectToMainPage();
        })
            .catch(error => {
                this.setState({ error });
            });
    }

    redirectToMainPage() {
        this.setState({ redirect: true })
    }

    onChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        const { error, redirect } = this.state;

        if (redirect) {
            return <Redirect to='/' />;
        }

        const isInvalid = this.state.password === '' || this.state.email === '';
        return (
            <div className="columns is-mobile">
                <div className="column is-half is-offset-one-quarter">
                    <form onSubmit={this.onSubmit}>
                        <div className="field">
                            <label className="label">Nombre</label>
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
                        <div className="field">
                            <label className="label">Código</label>
                            <div className="control">
                                <input
                                    className="input"
                                    name="password"
                                    value={this.state.password}
                                    onChange={this.onChange}
                                    type="password"
                                    placeholder="Contraseña"
                                />
                            </div>
                        </div>
                        <div className="field is-grouped">
                            <div className="control">
                                <button disabled={isInvalid} type="submit" className="button is-info">Iniciar sesión</button>
                            </div>
                            <div className="control">
                                <Link to="/olvide-mi-contrasenia" className="button is-light">Olvidé mi contraseña</Link>
                            </div>
                        </div>
                        {error && <p>{error.message}</p>}
                    </form>
                </div>
            </div>
        );
    }
}

const LoginForm = withFirebase(LoginFormBase);

export default LoginPage;
