import tippy from 'tippy.js'
import { commandList } from './list'

export const getSuggestions = ({ isBasic = true }) => ({
  items: ({ query }) => {
    return [
      ...commandList
    ].filter(item => {
      const isTitleMatch = item.title.toLowerCase().startsWith(query.toLowerCase())
      const isNameMatch = item.name.toLowerCase().startsWith(query.toLowerCase())
      const isBasicMatch = isBasic ? item.basic !== false : true
      return isBasicMatch && (isTitleMatch || isNameMatch)
    })
  },

  render: () => {
    let state
    let popup
    let commandState

    const context = document.getElementById('context')

    const mount = (name, data) => {
      const event = new CustomEvent('mounted', { detail: { name, data } })
      context.dispatchEvent(event)
    }

    const call = (namespace, name, args) => {
      const event = new CustomEvent('call', { detail: { namespace, name, args } })
      context.dispatchEvent(event)
    }

    return {
      onStart: props => {
        state = props

        commandState = {
          selectedIndex: 0,
          items: state.items,
          onClick(index) {
            const item = this.items[index]

            if (item) {
              state.command(item)
            }
          },
          onKeyDown({ event }) {
            if (event.key === 'ArrowUp') {
              call('tiptapCommand', 'upHandler')
              return true
            }

            if (event.key === 'ArrowDown') {
              call('tiptapCommand', 'downHandler')
              return true
            }

            if (event.key === 'Enter') {
              call('tiptapCommand', 'enterHandler')
              return true
            }

            return false
          },
          upHandler() {
            this.selectedIndex = ((this.selectedIndex + this.items.length) - 1) % this.items.length
          },
          downHandler() {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length
          },
          enterHandler() {
            this.onClick(this.selectedIndex)
          },
        }

        const component = `
          <div class="items flex flex-col bg-white border border-gray-300 rounded-lg p-2">
            <template x-for="(item, index) in state.tiptapCommand.items" :key="index">
              <button class="item w-full pl-3 pr-12 rounded-lg text-left" :class="{ 'bg-gray-300': state.tiptapCommand.selectedIndex === index }" @click="state.tiptapCommand.onClick(index)" class="block py-1">
                <div class="title" class="text-left" x-text="item.title"></div>
              </button>
            </template>
            <div x-show="!state.tiptapCommand.items.length" class="text-gray-700">
              No results found
            </div>
          </div>
        `

        popup = tippy('body', {
          allowHTML: true,
          getReferenceClientRect: state.clientRect,
          appendTo: () => context,
          content: component,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        })

        mount('tiptapCommand', commandState)
      },

      onUpdate(props) {
        state = props

        commandState.selectedIndex = 0
        commandState.items = props.items

        mount('tiptapCommand', { ...commandState, ...props })

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup[0].hide()

          return true
        }

        return commandState.onKeyDown(props)
      },

      onExit() {
        popup[0].destroy()
      },
    }
  },
})
