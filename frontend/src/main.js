import './style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

import vuetify from './plugins/vuetify'

import App from './App.vue'
import router from './router'
import store from './stores/store'

import 'animate.css';

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(vuetify)
app.use(store)
app.use(ToastPlugin);

app.mount('#app')
