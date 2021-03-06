import React, { Component } from 'react';
import { withAuthorization } from '../../../providers/session';

class MainDashboard extends Component {

    render() {
        return (
            <section className="hero is-fullheight-with-navbar is-info is-bold">
                <div className="hero-body">
                    <div className="container">
                        <h1 className="title">
                            Bienvenido al sistema
      </h1>
                        <h2 className="subtitle">
                            <br></br>
                            <p>Este sistema permite mantener control de todo el inventario de productos. Además de administrar las ventas por cada cliente.</p>
                            <p>Se pueden acceder a estas funcionalidades a través de la barra superior. A continuación, se explicaran esas opciones.</p>
                            <br></br>
                            <p><b>Inventario: </b>Haciendo clic en esa opción podremos ver todos los items del inventario. También podemos registrar nuevos
                            items, editar items existentes, o eliminar items.</p>
                            <br></br>
                            <p><b>Ventas y clientes: </b>Haciendo clic en esa opción podremos ver una lista de los clientes. A su vez, podremos registrar nuevos
                            clientes, editar los ya existentes, o eliminar clientes.
                            Y a través de cada cliente podremos acceder a sus ventas registradas y a los pagos que estos realizaron mediante la opción "ver ventas y pagos".
                            En esta interfaz podremos registrar nuevas ventas y pagos a ese cliente, editar la información de las ventas y pagos ya existentes y eliminar ventas.</p>
                            <br></br>
                            <p><b>Ventas individuales: </b>Haciendo clic en esa opción podremos ver una lista de ventas al por menor. Desde ahí podemos registrar, editar o
                            eliminar ventas al por menor.</p>
                            <br></br>
                            <p><b>Ver guía: </b>Haciendo clic en esa opción podremos volver a esta ventana.</p>
                            <br></br>
                            <p><b>Editar cuenta: </b>A través de esta opción podremos cambiar nuestra contraseña.</p>
                            <br></br>
                            <p><b>Cerrar sesión: </b>Se cierra la sesión actual.</p>
                        </h2>
                    </div>
                </div>
            </section>
        );
    }
}

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(MainDashboard);
