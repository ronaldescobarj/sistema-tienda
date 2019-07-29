import React, { Component } from 'react';
import { withAuthorization } from '../session';

class EditAccount extends Component {

    render() {
        return (
            <div>
                <h1 className="title">Editar cuenta</h1>
            </div>
        );
    }
}

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(EditAccount);
