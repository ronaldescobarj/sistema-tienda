import React, { Component } from 'react';
import { withAuthorization } from '../session';

class MainDashboard extends Component {

    render() {
        return (
            <div>
                <h1 className="title">Interfaz principal</h1>
            </div>
        );
    }
}

const condition = (authUser) => {
    return authUser != null;
}

export default withAuthorization(condition)(MainDashboard);
