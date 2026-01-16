import { createApp } from 'vue'
import App from './App.vue'
import { registerVuetify } from '@/plugins/vuetify'
import '@mdi/font/css/materialdesignicons.css'


const app = createApp(App)
registerVuetify(app)
app.mount('#app')

