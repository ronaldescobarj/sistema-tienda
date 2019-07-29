import React from 'react';
import { compose } from 'recompose';
import AuthUserContext from './context';
import { withFirebase } from '../firebase';
import { Redirect } from "react-router-dom";

const withAuthorization = condition => Component => {
    class WithAuthorization extends React.Component {

        constructor(props) {
            super(props);
            this.state = { redirect: false };
        }
        componentDidMount() {
            this.listener = this.props.firebase.auth.onAuthStateChanged(
                authUser => {
                    if (!condition(authUser)) {
                        // this.props.history.push(ROUTES.SIGN_IN);
                        this.setState({ redirect: true });
                    }
                },
            );
        }

        componentWillUnmount() {
            this.listener();
        }

        render() {
            const { redirect } = this.state;

            if (redirect) {
                return <Redirect to='/iniciar-sesion' />;
            }

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
        withFirebase,
    )(WithAuthorization);
};

export default withAuthorization;