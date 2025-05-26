import ServiceBookingPage from '@/components/ServiceBookingPage'
import { useRouter } from 'next/router'

const Index = () => {
  const router = useRouter()
  const { id } = router.query
  console.log(typeof id)

  return <ServiceBookingPage id={Number(id)} />
}

export default Index
