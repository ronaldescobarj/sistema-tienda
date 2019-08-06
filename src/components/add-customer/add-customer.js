import React, { Component } from 'react';
import { withAuthorization } from '../session';

class AddCustomer extends Component {

    render() {
        return (
            <div>
                <h1 className="title">Registrar cliente</h1>
            </div>
        );
    }
}

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(AddCustomer);
