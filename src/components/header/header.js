import React from 'react';
import { Link } from "react-router-dom";
import LogoutButton from '../logout/logout';
import { AuthUserContext } from '../session';

const Header = () => (
    <div>
        <nav className="navbar is-fixed-top is-link" role="navigation" aria-label="main navigation">
            <div className="navbar-brand">
                <img src="https://firebasestorage.googleapis.com/v0/b/sistema-tienda-c6c67.appspot.com/o/logo.jpg?alt=media&token=57b005fa-116b-4f64-b30b-92c49b9b13a9" alt="xd" width="112" height="28"></img>
                <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="myNavbar">
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                    <span aria-hidden="true"></span>
                </a>
            </div>
            <AuthUserContext.Consumer>
                {authUser => authUser ? <div id="myNavbar" className="navbar-menu">
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
                                <Link to="/editar-cuenta" className="button is-primary is-inverted is-outlined">
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

// class Header extends Component {

//     render() {
//         return (
//             <div>
//                 <nav className="navbar is-fixed-top is-link" role="navigation" aria-label="main navigation">
//                     <div className="navbar-brand">
//                         <img src="https://firebasestorage.googleapis.com/v0/b/sistema-tienda-c6c67.appspot.com/o/logo.jpg?alt=media&token=57b005fa-116b-4f64-b30b-92c49b9b13a9" alt="xd" width="112" height="28"></img>
//                         <a role="button" className="navbar-burger burger" aria-label="menu" aria-expanded="false" data-target="myNavbar">
//                             <span aria-hidden="true"></span>
//                             <span aria-hidden="true"></span>
//                             <span aria-hidden="true"></span>
//                         </a>
//                     </div>
//                     <div id="myNavbar" className="navbar-menu">
//                         <div className="navbar-start">
//                             <div className="navbar-item">
//                                 <Link to="/inventario" className="button is-light is-outlined">Inventario</Link>
//                             </div>
//                             <div className="navbar-item">
//                                 <Link to="/registro-ventas" className="button is-light is-outlined">Registro de ventas</Link>
//                             </div>
//                         </div>
//                         <div className="navbar-end">
//                             <div className="navbar-item">
//                                 <div className="buttons">
//                                     <Link to="/edit-account" className="button is-primary is-inverted is-outlined">
//                                         Editar cuenta
//                                     </Link>
//                                     <LogoutButton />
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </nav>
//                 <br></br>
//                 <br></br>
//             </div>
//         );
//     }
// }

export default Header;
