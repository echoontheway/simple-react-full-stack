import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import tracer from './tracer';

tracer.init('full-stack-example-app-client', 'default');

ReactDOM.render(<App />, document.getElementById('root'));
