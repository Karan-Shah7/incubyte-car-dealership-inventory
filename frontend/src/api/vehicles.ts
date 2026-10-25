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
  create: (input: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>, token: string) => apiRequest<{ vehicle: Vehicle }>('/vehicles', { method: 'POST', body: JSON.stringify(input) }, token),
  update: (id: string, input: Pick<Vehicle, 'make' | 'model' | 'category' | 'price'>, token: string) => apiRequest<{ vehicle: Vehicle }>(`/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(input) }, token),
  delete: (id: string, token: string) => apiRequest<{ message: string }>(`/vehicles/${id}`, { method: 'DELETE' }, token),
  restock: (id: string, amount: number, token: string) => apiRequest<{ message: string; vehicle: Vehicle }>(`/vehicles/${id}/restock`, { method: 'POST', body: JSON.stringify({ amount }) }, token),
}
