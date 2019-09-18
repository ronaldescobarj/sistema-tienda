import React from 'react';
import { compose } from 'recompose';
import AuthUserContext from './context';
import { withFirebase } from '../firebase';
import { withRouter } from "react-router-dom";

const withAuthorization = condition => Component => {
    class WithAuthorization extends React.Component {

        componentDidMount() {
            this.listener = this.props.firebase.auth.onAuthStateChanged(authUser => {
                if (!condition(authUser))
                    this.props.history.push("/iniciar-sesion");
            });
        }

        componentWillUnmount() {
            this.listener();
        }

        render() {
            return (
                <AuthUserContext.Consumer>
                    {authUser =>
                        condition(authUser) ? <Component {...this.props} /> : null
                    }
                </AuthUserContext.Consumer>
            );
        }
    }

    return compose(
        withRouter,
        withFirebase,
    )(WithAuthorization);
};

export default withAuthorization;