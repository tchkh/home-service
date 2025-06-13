import React from 'react'
import { Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

type CartItem = {
  id: number
  service_id: number
  service_title: string
  title: string
  price: number
  unit: string
  quantity: number
}

interface ServiceItemProps {
  item: CartItem
  onQuantityChange: (id: number, quantity: number) => void
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  item,
  onQuantityChange,
}) => {
  const handleIncrement = () => {
    onQuantityChange(item.id, item.quantity + 1)
  }

  const handleDecrement = () => {
    if (item.quantity > 0) {
      onQuantityChange(item.id, item.quantity - 1)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b border-gray-200 gap-2 sm:gap-0">
      <div className="w-full sm:w-auto flex flex-col items-start">
        <h3 className="text-base font-semibold text-gray-800 mb-1">
          {item.title}
        </h3>
        <p className="text-sm text-gray-500">
          ฿{item.price.toFixed(2)} / {item.unit}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-2 sm:mt-0">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10 border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
          onClick={handleDecrement}
          disabled={item.quantity === 0}
        >
          <Minus className="w-5 h-5" />
        </Button>
        <span className="text-lg font-medium w-8 text-center">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-10 h-10 border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
          onClick={handleIncrement}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}

export default ServiceItem
