import '../css/app.css'
import 'babel-polyfill'
import axios from 'axios'

window.axios = axios

// axios.interceptors.response.use(function (response) {
//   // Any status code that lie within the range of 2xx cause this function to trigger
//   // Do something with response data
//   return response;
// }, function (error) {
//   // Any status codes that falls outside the range of 2xx cause this function to trigger
//   // Do something with response error
//   if (error.status === 419) {
//     console.log({ error })
//   }
//
//   return Promise.reject(error);
// });

window.appWatchlist = function(route, payload, isInWatchlist) {
  return {
    payload,
    isInWatchlist,

    async toggle() {
      const { data } = await axios.post(route, this.payload)
      this.isInWatchlist = !data.wasDeleted
    }
  }
}

window.appCompleted = function(route, payload, isCompleted = false) {
  return {
    payload,
    isCompleted,

    async toggle() {
      const { data } = await axios.post(route, this.payload)
      this.isCompleted = data.progression.isCompleted
    },

    changeCompleted(event) {
      this.isCompleted = event.detail.isCompleted
    }
  }
}
