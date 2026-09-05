/// <reference types="vite/client" />
/// <reference types="utools-api-types" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, unknown>
  export default component
}

interface Window {
  services?: Record<string, unknown>
}
