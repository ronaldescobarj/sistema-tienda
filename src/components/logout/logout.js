import React from 'react';

import { withFirebase } from '../firebase';

const LogoutButton = ({ firebase }) => (
    <button type="button" className="button is-danger is-outlined" onClick={firebase.logout}>
        Cerrar sesion
  </button>
);

export default withFirebase(LogoutButton);