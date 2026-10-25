import type { Vehicle, VehicleFilters } from '../types/vehicle'
import { apiRequest } from './client'

export const vehiclesApi = {
  list: (token: string) => apiRequest<{ vehicles: Vehicle[] }>('/vehicles', {}, token),
  search: (filters: VehicleFilters, token: string) => {
    const query = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value.trim()) query.set(key, value.trim())
    })
    return apiRequest<{ vehicles: Vehicle[] }>(`/vehicles/search?${query.toString()}`, {}, token)
  },
  purchase: (id: string, token: string) => apiRequest<{ message: string; vehicle: Vehicle }>(`/vehicles/${id}/purchase`, { method: 'POST' }, token),
}
