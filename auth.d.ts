import type { SessionUser } from '#shared/types'

declare module '#auth-utils' {
  interface User extends SessionUser {}
}

export {}
