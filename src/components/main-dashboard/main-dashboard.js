import React, { Component } from 'react';
import { withAuthorization } from '../session';

class MainDashboard extends Component {

    render() {
        return (
            <section class="hero is-fullheight-with-navbar is-info is-bold">
                <div class="hero-body">
                    <div class="container">
                        <h1 class="title">
                            Bienvenido al sistema
      </h1>
                        <h2 class="subtitle">
                            <br></br>
                            <p>Este sistema permite mantener control de todo el inventario de productos. Además de administrar las ventas por cada cliente.</p>
                            <p>Se pueden acceder a estas funcionalidades a través de la barra superior. A continuación, se explicaran esas opciones.</p>
                            <br></br>
                            <p><b>Inventario: </b>Haciendo clic en esa opción podremos ver todos los items del inventario. También podemos registrar nuevos
                            items, editar items existentes, o eliminar items.</p>
                            <br></br>
                            <p><b>Ventas y clientes: </b>Haciendo clic en esa opción podremos ver una lista de los clientes. A su vez, podremos registrar nuevos
                            clientes, editar los ya existentes, o eliminar clientes.
                            Y a través de cada cliente podremos acceder a sus ventas registradas mediante la opción "ver ventas". En esta interfaz podremos registrar
                            nuevas ventas a ese cliente, editar la información de las ventas existentes o eliminar ventas.</p>
                            <br></br>
                            <p><b>Ver tutorial: </b>Haciendo clic en esa opción podremos volver a esta ventana.</p>
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
