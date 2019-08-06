import React, { Component } from 'react';
import { withAuthorization } from '../session';

class EditCustomer extends Component {

    render() {
        return (
            <div>
                <h1 className="title">Editar cliente</h1>
            </div>
        );
    }
}

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(EditCustomer);
