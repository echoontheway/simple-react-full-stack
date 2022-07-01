'use strict';

const opentelemetry = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { ConsoleSpanExporter, SimpleSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector');



module.exports = (serviceName, tenantId) => {
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,  // 你的应用名称
      'tps.tenant.id': tenantId, // 你的租户名称
    }),
  });

  // ConsoleSpanExporter 支持在控制台打印上报的span信息, 线上环境可关闭掉
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));

  provider.addSpanProcessor(new SimpleSpanProcessor(new CollectorTraceExporter({
    url: 'https://tpstelemetry.tencent.com/v1/trace',  // 上报到grafana
    headers:{
      'X-Tps-TenantID': tenantId,  // 你的租户名称
    }
  })));

  // 注册provider以使用OpenTelemetry API
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation(),
    ],
  });

  return opentelemetry.trace.getTracer('http-example');
};
