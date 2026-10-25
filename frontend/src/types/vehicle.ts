export interface Vehicle {
  id: string
  make: string
  model: string
  category: string
  price: number
  quantity: number
  createdAt: string
  updatedAt: string
}

export interface VehicleFilters {
  make: string
  model: string
  category: string
  minPrice: string
  maxPrice: string
}
