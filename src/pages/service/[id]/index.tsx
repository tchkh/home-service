import ServiceBookingPage from '@/components/ServiceBookingPage'
import { useRouter } from 'next/router'

const Index = () => {
  const router = useRouter()
  const { id } = router.query

  return <ServiceBookingPage id={id as string} />
}

export default Index
