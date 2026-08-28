declare module '*.cjs' {
  export function createApp(): Promise<import('express').Express>;
}
