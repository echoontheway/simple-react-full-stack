const tracer = require('./tracer')('full-stack-example-app-server', 'default');
const api = require('@opentelemetry/api');
const path = require('path');
const express = require('express');
const os = require('os');

const app = express();

app.set('views', path.join(__dirname, '../../views'));
app.set('view engine', 'ejs');
app.use(express.static('dist'));

app.get('/', (req, res) => {
    let carrier = {};
    api.propagation.inject(api.context.active(), carrier); // 获取traceparent
    const { traceparent } = carrier;
    const traceId = traceparent.split('-')[1];
    const queryUrl = `http://default.tpstelemetry.oa.com/explore?orgId=1&left=%5B%22now-1h%22,%22now%22,%22trace-index%22,%7B%22query%22:%22${traceId}%22,%22alias%22:%22%22,%22metrics%22:%5B%7B%22id%22:%221%22,%22type%22:%22logs%22,%22settings%22:%7B%22limit%22:%22500%22%7D%7D%5D,%22bucketAggs%22:%5B%5D,%22timeField%22:%22timestamp%22%7D%5D`
    res.render('index', {
        traceparent,
        traceId,
        queryUrl
    });
});

app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));

app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
