import React, { Component } from 'react';
import { withAuthorization } from '../session';

class SalesRecord extends Component {

    render() {
        return (
            <div>
                <h1 className="title">Registro ventas</h1>
            </div>
        );
    }
}

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(SalesRecord);

