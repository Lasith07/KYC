
import KycForm from '@/views/KycForm.vue'
import KycUpload from '@/views/KycUpload.vue'
import KycConfirmation from '@/views/KycConfirmation.vue' // <-- Import the component


const routes = [
    {
      path: '/',
      name: 'KycForm',
      component: KycForm
    },
    {
      path: '/kyc-upload',
      name: 'KycUpload',
      component: KycUpload
    },
    {
      path: '/kyc-confirmation',
      name: 'KycConfirmation',
      component: KycConfirmation,
      props: true // <-- Enable props
    },
  
    {
      path: '/about',
      name: 'About',
      component: () => import('@/views/AboutView.vue'),
    },
  ]
  export default routes