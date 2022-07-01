import React, { Component } from 'react';
import './app.css';
import * as api from '@opentelemetry/api';
export default class App extends Component {
  state = { username: null };

  componentDidMount() {
    const metaElement = Array.from(document.getElementsByTagName('meta')).find(
      e => e.getAttribute('name') === 'traceparent'
    );
    const traceparent = (metaElement && metaElement.content) || '';
    api.context.with(api.propagation.extract(api.ROOT_CONTEXT, { traceparent }), () => {
      fetch('/api/getUsername')
      .then(res => res.json())
      .then(user => this.setState({ username: user.username }));
    });
  }

  render() {
    const { username } = this.state;
    return (
      <div>
        {username ? <h1>{`Hello ${username}`}</h1> : <h1>Loading.. please wait!</h1>}
        <h2>这是基于opentelemetry及天机阁的分析页面加载性能及接口耗时的demo</h2>
      </div>
    );
  }
}
