import { type Data } from '~generated/data'
import {
  type ReactNode,
  type PropsWithChildren,
  type ComponentType,
  type ReactElement,
  type JSX,
} from 'react'
import { type JSONDataTypes } from '@adonisjs/core/types/transformers'

export type InertiaProps<T extends JSONDataTypes = {}> = PropsWithChildren<Data.SharedProps & T>

export type PageModule = {
  default: ComponentType<any> & {
    layout?: (page: ReactElement<Data.SharedProps>) => ReactNode
    shell?: ComponentType<{
      children: ReactNode
      sidebar?: () => JSX.Element
      addon?: () => JSX.Element
    }>
    sidebar?: () => JSX.Element
    addon?: () => JSX.Element
  }
}

export type WithChildNodes = {
  children: ReactNode
}

export type WithOptionalChildNodes = {
  children?: ReactNode
}
