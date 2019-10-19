import React from 'react';
import { Link } from "react-router-dom";
import LogoutButton from '../../session/logout/logout';
import { AuthUserContext } from '../../../providers/session';

class Header extends React.Component {

    constructor(props) {
        super(props);
        this.state = { navbarClass: 'navbar-menu' };
        this.toggleNavbarClass = this.toggleNavbarClass.bind(this);
        this.closeBurger = this.closeBurger.bind(this);
    }

    async toggleNavbarClass() {
        let currentNavbarClass = this.state.navbarClass;
        let newNavbarClass = currentNavbarClass === "navbar-menu" ? "navbar-menu is-active" : "navbar-menu";
        await this.setState({ navbarClass: newNavbarClass });
    }

    closeBurger() {
        this.setState({ navbarClass: 'navbar-menu' });
    }

    render() {
        const { navbarClass } = this.state;
        return (
            <div>
                <nav className="navbar is-fixed-top is-link" role="navigation" aria-label="main navigation">
                    <div className="navbar-brand">
                        <img src="https://firebasestorage.googleapis.com/v0/b/sistema-tienda-c6c67.appspot.com/o/logo.jpg?alt=media&token=57b005fa-116b-4f64-b30b-92c49b9b13a9" alt="xd" width="112" height="28"></img>
                        <a role="button" onClick={this.toggleNavbarClass} className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="myNavbar">
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                            <span aria-hidden="true"></span>
                        </a>
                    </div>
                    <AuthUserContext.Consumer>
                        {authUser => authUser ? <div id="myNavbar" className={navbarClass}>
                            <div className="navbar-start">
                                <div className="navbar-item">
                                    <Link onClick={this.closeBurger} to="/inventario" className="button is-link">Inventario</Link>
                                </div>
                                <div className="navbar-item">
                                    <Link onClick={this.closeBurger} to="/clientes" className="button is-link">Ventas y clientes</Link>
                                </div>
                                <div className="navbar-item">
                                    <Link onClick={this.closeBurger} to="/ventas-individuales" className="button is-link">Ventas individuales</Link>
                                </div>
                                <div className="navbar-item">
                                    <Link onClick={this.closeBurger} to="/" className="button is-link">Ver guía</Link>
                                </div>
                            </div>
                            <div className="navbar-end">
                                <div className="navbar-item">
                                    <div className="buttons">
                                        <Link onClick={this.closeBurger} to="/editar-cuenta" className="button is-primary is-outlined">
                                            Editar cuenta
                                    </Link>
                                        <LogoutButton />
                                    </div>
                                </div>
                            </div>
                        </div> : <div></div>}
                    </AuthUserContext.Consumer>
                </nav>
                <br></br>
                <br></br>
            </div>
        );
    }
}

export default Header;
