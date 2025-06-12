import { createRouter, createWebHistory } from 'vue-router'
import KycForm from '@/views/KycForm.vue'
import KycUpload from '@/views/KycUpload.vue'
import KycConfirmation from '@/views/KycConfirmation.vue' // <-- Import the component
import AboutView from '@/views/AboutView.vue'
import routes from '@/router/routes'


const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes :routes
})
export default router
