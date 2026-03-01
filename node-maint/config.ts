interface Config {
  port: number
  remotes: Record<string, any>
  serviceUri?: string
  isAuthorizationEnabled: boolean
  tokenKey: string
}

export const config: any = {
  port: parseInt(process.env.REACT_APP_PORT || '3010', 10),
  remotes: {},
  serviceUri: process.env.REACT_APP_SERVICE_URI,
  isAuthorizationEnabled: process.env.ENABLE_AUTHORIZATION === 'true',
  tokenKey: process.env.REACT_APP_TOKEN_KEY || 'Token',
}

// console.log('Config', config)
// console.log('Environment variables', process.env)

export default config
