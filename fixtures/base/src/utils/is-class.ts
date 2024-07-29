import { Type } from '@nestjs/common'

export function isClass(v: unknown): v is Type {
  return typeof v === 'function' && v.toString().startsWith('class')
}
