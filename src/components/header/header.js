import React, { Component } from 'react';

class Header extends Component {

    render() {
        return (
            <div>
                <nav className="navbar is-fixed-top" role="navigation" aria-label="main navigation">
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
                                <a href="/" className="button is-light">Inventario</a>
                            </div>
                            <div className="navbar-item">
                                <a href="/" className="button is-light">Registro de ventas</a>
                            </div>
                        </div>
                        <div className="navbar-end">
                            <div className="navbar-item">
                                <div className="buttons">
                                    <a href="/" className="button is-primary">
                                        Cerrar sesión
                                    </a>
                                    <a href="/" className="button is-primary">
                                        Editar cuenta
                                    </a>
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
