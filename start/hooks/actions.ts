import { hooks } from "@adonisjs/core/app"

export default hooks.init((_, __, indexGenerator) => {
  indexGenerator.add('actions', {
    source: './app/actions',
    importAlias: '#actions',
    as: 'barrelFile',
    exportName: 'actions',
    removeSuffix: 'action',
    output: './.adonisjs/server/actions.ts',
  })
})