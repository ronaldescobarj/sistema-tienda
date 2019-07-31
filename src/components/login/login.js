import React, { Component } from 'react';
import { withFirebase } from '../firebase';
import { Link, withRouter } from "react-router-dom";

const INITIAL_STATE = {
    email: '',
    password: '',
    error: null
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

    handleSubmit(event) {
        const { email, password } = this.state;
        event.preventDefault();
        this.props.firebase.login(email, password).then(() => {
            this.setState({ ...INITIAL_STATE });
            this.props.history.push("/");
        })
            .catch(error => {
                this.setState({ error });
            });
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        const { email, password, error } = this.state;
        const isInvalid = password === '' || email === '';
        return (
            <div className="columns is-mobile">
                <div className="column is-half is-offset-one-quarter">
                    <form onSubmit={this.handleSubmit}>
                        <div className="field">
                            <label className="label">Nombre</label>
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
                            <label className="label">Código</label>
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

const LoginForm = withRouter(withFirebase(LoginFormBase));

export default LoginPage;
