import React, { Component } from 'react';
import { withAuthorization } from '../session';

class EditSale extends Component {

    render() {
        return (
            <div>
                <h1 className="title">Editar venta</h1>
            </div>
        );
    }
}

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(EditSale);
