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
    <div className="flex justify-between items-center p-4 border-b border-gray-200">
      <div>
        <h3 className="text-md font-semibold text-gray-800">{item.title}</h3>
        <p className="text-sm text-gray-500">
          ฿{item.price.toFixed(2)} / {item.unit}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8 border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
          onClick={handleDecrement}
          disabled={item.quantity === 0}
        >
          <Minus className="w-4 h-4" />
        </Button>
        <span className="text-lg font-medium w-8 text-center">
          {item.quantity}
        </span>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-8 h-8 border-blue-500 text-blue-500 hover:bg-blue-50 cursor-pointer"
          onClick={handleIncrement}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default ServiceItem
