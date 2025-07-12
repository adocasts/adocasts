import tippy from 'tippy.js'
import { commandList } from './list'

export const getSuggestions = ({ isBasic = true, isFreeUser = true }) => ({
  items: ({ query }) => {
    return [
      ...commandList.filter(cmd => typeof cmd.isPlusOnly !== 'boolean' || !isFreeUser)
    ].filter(item => {
      const isTitleMatch = item.title.toLowerCase().includes(query.toLowerCase())
      const isNameMatch = item.name.toLowerCase().includes(query.toLowerCase())
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
          <div class="items flex flex-col bg-base-300/50 backdrop-blur-md border border-base-100 rounded-base p-3 text-xs">
            <template x-for="(item, index) in state.tiptapCommand.items" :key="index">
              <button class="item flex items-center gap-3 w-full pl-1 py-1 pr-12 rounded-md text-left" :class="{ 'bg-base-100': state.tiptapCommand.selectedIndex === index }" @click="state.tiptapCommand.onClick(index)" class="block py-1">
                <template x-if="item.icon">
                  <div 
                    class="size-5 flex items-center justify-center bg-base-100 rounded-md" 
                    :class="{ 'bg-base-100': state.tiptapCommand.selectedIndex === index }"
                    x-html="item.icon"
                  ></div>
                </template>
                <div class="title" class="text-left" x-text="item.title"></div>
              </button>
            </template>
            <div x-show="!state.tiptapCommand.items.length" class="text-base-content/60">
              No results found
            </div>
          </div>
        `

        popup = tippy(document.getElementById('portal'), {
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

        popup.setProps({
          getReferenceClientRect: props.clientRect,
        })
      },

      onKeyDown(props) {
        if (props.event.key === 'Escape') {
          popup.hide()

          return true
        }

        return commandState.onKeyDown(props)
      },

      onExit() {
        popup.destroy()
      },
    }
  },
})
