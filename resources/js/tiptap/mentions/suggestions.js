import tippy from 'tippy.js'
import axios from 'axios'

export default {
  items: async ({ query }) => {
    if (query.length < 3) {
      return []
    }
    const _csrf = document.forms.csrf._csrf.value
    const { data } = await axios.post('/api/mentions/list', { _csrf, pattern: query })
    return data
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
      onStart: (props) => {
        state = props

        commandState = {
          selectedIndex: 0,
          items: state.items,
          onClick(index) {
            const item = this.items[index]

            if (item) {
              state.command({ id: item })
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
            this.selectedIndex = (this.selectedIndex + this.items.length - 1) % this.items.length
          },
          downHandler() {
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length
          },
          enterHandler() {
            this.onClick(this.selectedIndex)
          },
        }

        const component = `
          <div class="items flex flex-col bg-slate-200/90 backdrop-blur-lg border border-slate-300/50 shadow-xl rounded-md p-2">
            <template x-for="(item, index) in state.tiptapCommand.items" :key="index">
              <button class="item flex items-center gap-1.5 w-full pl-1 py-1 pr-12 rounded-lg text-left" :class="{ 'bg-slate-300': state.tiptapCommand.selectedIndex === index }" @click="state.tiptapCommand.onClick(index)" class="block py-1">
                <div class="title" class="text-left" x-text="item"></div>
              </button>
            </template>
            <div x-show="!state.tiptapCommand.query || state.tiptapCommand.query?.length < 3" class="text-slate-600">
              Type at least 3 characters
            </div>
            <div x-show="!state.tiptapCommand.items.length && state.tiptapCommand.query?.length >= 3" class="text-slate-600">
              No users found
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
}
