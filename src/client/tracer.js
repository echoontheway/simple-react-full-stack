/**
 * 基于opentelemetry及天机阁的页面加载性能及接口耗时监控demo
 */

import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { CollectorTraceExporter } from '@opentelemetry/exporter-collector';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { Resource } from '@opentelemetry/resources';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';


const init = function(serviceName, tenantId){
  const provider = new WebTracerProvider({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName,  // 你的应用名称
      'tps.tenant.id': tenantId, // 你的租户名称
    }),
  });
  
  // ConsoleSpanExporter 支持在控制台打印上报的span信息, 线上环境可关闭掉
  provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
  
  /**
   * 1. CollectorTraceExporter 上报到指定远程服务
   * 2. (1) SimpleSpanProcessor 实时上报 (2) BatchSpanProcessor 批量上报
   */
  provider.addSpanProcessor(new SimpleSpanProcessor(new CollectorTraceExporter({
    url: 'https://tpstelemetry.tencent.com/v1/trace',  // 上报到grafana
    headers:{
      'X-Tps-TenantID': tenantId,  // 你的租户名称
    }
  })));
  
  // 注册provider以使用OpenTelemetry API
  provider.register(); 
  
  /**
   * 自动跟踪
   * 注册FetchInstrumentation/DocumentLoadInstrumentation插桩
   */
  registerInstrumentations({
    instrumentations: [
      new DocumentLoadInstrumentation(),
      new FetchInstrumentation({
        ignoreUrls: [/localhost:3000\/sockjs-node/],
        propagateTraceHeaderCorsUrls: [
          'http://localhost:3000/api/getUsername',  // 需要注入traceparent头的cgi, 以与服务端串联
        ],
      }),
    ],
  });
}



export default { init };




