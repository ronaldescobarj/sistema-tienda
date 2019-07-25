import React, { Component } from 'react';
import { Link } from "react-router-dom";

class Header extends Component {

    render() {
        return (
            <div>
                <nav className="navbar is-fixed-top is-link" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <img src="https://bulma.io/images/bulma-logo.png" alt="xd" width="112" height="28"></img>
                        <a href="/" role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>
                    <div id="navbarBasicExample" className="navbar-menu">
                        <div className="navbar-start">
                            <div className="navbar-item">
                                <Link to="/inventario" className="button is-light is-outlined">Inventario</Link>
                            </div>
                            <div className="navbar-item">
                                <Link to="/registro-ventas" className="button is-light is-outlined">Registro de ventas</Link>
                            </div>
                        </div>
                        <div className="navbar-end">
                            <div className="navbar-item">
                                <div className="buttons">
                                    <Link to="/edit-account" className="button is-primary is-inverted is-outlined">
                                        Editar cuenta
                                    </Link>
                                    <button className="button is-danger is-inverted">
                                        Cerrar sesión
                                    </button>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                <br></br>
                <br></br>
            </div>
        );
    }
}

export default Header;
