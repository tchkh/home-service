import { Prompt } from 'next/font/google'

const prompt = Prompt({
  subsets: ['latin', 'thai'],
  weight: ['300', '400', '500', '600'],
})

export default function Home() {
  return <h1>Good luck home service project</h1>
}
