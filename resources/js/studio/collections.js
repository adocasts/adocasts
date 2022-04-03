import Autocomplete from '@tarekraafat/autocomplete.js'
import axios from 'axios'
import 'babel-polyfill'

function collectionManager({ parentId, collections = [], posts = [] }) {
  const limit = 15
  return {
    parentId,
    collections,
    posts,
    collectionPostAddId: null,
    options: [],
    loading: false,

    init() {
      this.$nextTick(() => {
        this.initAutocomplete('#autocomplete_main')

        this.collections.map(c => {
          this.initAutocomplete(`#autocomplete_collection_${c.id}`, c)
        })
      })
    },

    async addCollection() {
      const { data } = await axios.post('/api/studio/collections/stub', { parentId })
      this.collections.push(data.collection)
      this.$nextTick(() => {
        this.initAutocomplete(`#autocomplete_collection_${data.collection.id}`, data.collection)
      })
    },

    async deleteCollection(collection) {
      await axios.delete(`/studio/collections/${collection.id}`)
      this.collections = this.collections.filter(c => c.id != collection.id)
    },

    addPost() {

    },

    removePost(post, subcollection) {
      if (subcollection) {
        subcollection.posts = subcollection.posts.filter(p => p.id !== post.id)
      } else {
        this.posts = this.posts.filter(p => p.id !== post.id)
      }
    },

    getIgnoreIds(collection) {
      if (collection) {
        const c = this.collections.find(c => c.id === collection.id)
        return c.posts.map(p => p.id)
      }

      return this.posts.map(p => p.id)
    },

    initAutocomplete(selector, collection) {
      // The autoComplete.js Engine instance creator
      const autoCompleteJS = new Autocomplete({
        selector,
        data: {
          src: async (query) => {
            try {
              this.loading = true
              const ignoreIds = this.getIgnoreIds(collection).join(',')
              const { data } = await axios.get(`/api/studio/posts/search?term=${query}&ignore=${ignoreIds}&limit=${limit}`)
              this.loading = false
              this.options = data.posts
              return data.posts
            } catch (error) {
              this.loading = false
              return error;
            }
          },
          keys: ["title"],
          // cache: true
        },
        placeHolder: "Search posts ...",
        resultsList: {
          class: 'w-full absolute bottom-100 left-0 shadow-xl rounded-lg bg-white z-10 p-3 text-sm',
          element: (list, data) => {
            const info = document.createElement("p");
            info.className = "text-xs border-b border-gray-300 pb-1 px-2 mb-3"
            if (data.results.length > 0) {
              info.innerHTML = `Displaying <strong>${data.results.length}</strong> out of <strong>${data.matches.length}</strong> results`;
            } else {
              info.innerHTML = `Found <strong>${data.matches.length}</strong> matching results for <strong>"${data.query}"</strong>`;
            }
            list.prepend(info);
          },
          noResults: true,
          maxResults: limit,
          tabSelect: true
        },
        resultItem: {
          element: (item, data) => {
            item.className = "flex justify-between hover:bg-gray-50 py-1 px-2 mb-1 rounded-lg transition"
            item.innerHTML = `
            <span style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">
              ${data.match}
            </span>
            <span class="flex items-center text-xs uppercase text-gray-700">
              ${data.key}
            </span>`;
          },
          highlight: true
        }
      });

      autoCompleteJS.input.addEventListener("selection", (event) => {
        const feedback = event.detail;
        autoCompleteJS.input.blur();

        // Render selected choice to selection div
        if (!collection) {
          this.posts.push(feedback.selection.value)
        } else {
          const c = this.collections.find(c => c.id === collection.id)
          c.posts.push(feedback.selection.value)
          this.collections = this.collections.map(col => col.id === c.id ? c : col)
        }

        autoCompleteJS.input.value = ''
      });
    }
  }
}

window.collectionManager = collectionManager
