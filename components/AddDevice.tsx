'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from 'lucide-react'
import { deviceDefaults } from '@/lib/deviceDefaults'
import { NewDeviceForm } from './NewDeviceForm'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, Settings2, Power, Clock } from 'lucide-react'

interface AddDeviceProps {
  onDeviceAdd: (device: {
    type: string;
    brand: string;
    model: string;
    watts: number;
    hoursPerDay: number;
    daysPerWeek: number;
  }) => void;
}

const AddDevice = ({ onDeviceAdd }: AddDeviceProps) => {
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedDevice, setSelectedDevice] = useState<{
    type: string;
    brand: string;
    model: string;
    watts: number;
  } | null>(null)
  const [categories, setCategories] = useState([
    { value: 'all', label: 'Todas las categorías' },
    { value: 'kitchen', label: 'Cocina' },
    { value: 'entertainment', label: 'Entretenimiento' },
    { value: 'office', label: 'Oficina' },
    { value: 'climate', label: 'Climatización' },
    { value: 'lighting', label: 'Iluminación' },
    { value: 'cleaning', label: 'Limpieza' },
  ])
  const [customDevices, setCustomDevices] = useState<Array<{
    key: string;
    label: string;
    category: string;
    averageWatts: number;
    commonBrands: Array<{
      brand: string;
      models: Array<{ name: string; watts: number; }>
    }>
  }>>([])
  const [deviceToDelete, setDeviceToDelete] = useState<number | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minWatts: '',
    maxWatts: '',
    brand: '',
    schedule: ''
  })

  const scheduleOptions = [
    { value: 'all', label: 'Todos los horarios' },
    { value: 'morning', label: 'Mañana (6:00 - 12:00)' },
    { value: 'afternoon', label: 'Tarde (12:00 - 18:00)' },
    { value: 'evening', label: 'Noche (18:00 - 24:00)' },
  ]

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    fetchCustomDevices()
  }, [])

  const fetchCustomDevices = async () => {
    try {
      const response = await fetch('/api/devices')
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.devices) {
          const formattedDevices = data.devices.reduce((acc: any[], device: any) => {
            const existingDevice = acc.find(d => d.key === device.type)
            if (existingDevice) {
              const existingBrand = existingDevice.commonBrands.find((b: any) => b.brand === device.brand)
              if (existingBrand) {
                existingBrand.models.push({
                  name: device.model,
                  watts: device.watts
                })
              } else {
                existingDevice.commonBrands.push({
                  brand: device.brand,
                  models: [{
                    name: device.model,
                    watts: device.watts
                  }]
                })
              }
            } else {
              acc.push({
                key: device.type,
                label: device.label || device.type,
                category: device.category || 'other',
                averageWatts: device.watts,
                commonBrands: [{
                  brand: device.brand,
                  models: [{
                    name: device.model,
                    watts: device.watts
                  }]
                }]
              })
            }
            return acc
          }, [])
          setCustomDevices(formattedDevices)
        }
      }
    } catch (error) {
      console.error('Error fetching custom devices:', error)
    }
  }

  if (!isClient) {
    return <div className="min-h-[200px] flex items-center justify-center">Cargando...</div>
  }

  const filteredDevices = [
    ...Object.entries(deviceDefaults).map(([key, device]) => ({
      key: `default_${key}`,
      ...device,
      isDefault: true
    })),
    ...customDevices.map(device => ({
      key: `custom_${device.key}`,
      ...device,
      isDefault: false
    }))
  ].filter(device => {
    const searchLower = filters.search.toLowerCase()
    const matchesSearch = 
      device.label.toLowerCase().includes(searchLower) ||
      device.key.toLowerCase().includes(searchLower) ||
      device.commonBrands.some(brand => 
        brand.brand.toLowerCase().includes(searchLower) ||
        brand.models.some(model => 
          model.name.toLowerCase().includes(searchLower) ||
          model.watts.toString().includes(searchLower)
        )
      )

    const matchesCategory = !filters.category || filters.category === 'all' || device.category === filters.category
    
    const matchesWatts = device.commonBrands.some(brand =>
      brand.models.some(model => {
        const watts = model.watts
        const minWatts = filters.minWatts ? parseInt(filters.minWatts) : 0
        const maxWatts = filters.maxWatts ? parseInt(filters.maxWatts) : Infinity
        return watts >= minWatts && watts <= maxWatts
      })
    )

    const matchesBrand = !filters.brand || device.commonBrands.some(brand =>
      brand.brand.toLowerCase().includes(filters.brand.toLowerCase())
    )

    const matchesSchedule = !filters.schedule || filters.schedule === 'all' || 
      deviceDefaults[device.key.replace(/^(default_|custom_)/, '')]?.commonSchedules?.some(schedule =>
        schedule.label.toLowerCase().includes(filters.schedule.toLowerCase())
      )

    return matchesSearch && matchesCategory && matchesWatts && matchesBrand && matchesSchedule
  })

  const handleDeviceSelect = (deviceType: string, brand: string, model: string, watts: number) => {
    const type = deviceType.replace(/^(default_|custom_)/, '')
    setSelectedDevice({ type, brand, model, watts })
  }

  const handleAddSelectedDevice = () => {
    if (!selectedDevice) return

    onDeviceAdd({
      type: selectedDevice.type,
      brand: selectedDevice.brand,
      model: selectedDevice.model,
      watts: selectedDevice.watts,
      hoursPerDay: 1,
      daysPerWeek: 7
    })

    setSelectedDevice(null)
  }

  const handleNewDeviceAdd = async (deviceData: any) => {
    try {
      onDeviceAdd({
        type: deviceData.type,
        brand: deviceData.brand,
        model: deviceData.model,
        watts: Number(deviceData.watts),
        hoursPerDay: deviceData.hoursPerDay || 1,
        daysPerWeek: deviceData.daysPerWeek || 7,
      })
      
      await fetchCustomDevices()
    } catch (error) {
      console.error('Error adding device:', error)
    }
  }

  const handleCategoryAdd = (newCategory: { value: string; label: string }) => {
    setCategories([...categories, newCategory])
  }

  const handleDeleteDevice = async (deviceId: string) => {
    try {
      const response = await fetch(`/api/devices/${deviceId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar el dispositivo')
      }

      await fetchCustomDevices()
      setDeviceToDelete(null)
      setSelectedDevice(null)
    } catch (error) {
      console.error('Error deleting device:', error)
    }
  }

  return (
    <Tabs defaultValue="catalog" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="catalog">Catálogo</TabsTrigger>
        <TabsTrigger value="new">Nuevo Dispositivo</TabsTrigger>
      </TabsList>

      <TabsContent value="catalog">
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Búsqueda</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Categoría</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters({ ...filters, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las categorías</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Marca</Label>
                  <Input
                    placeholder="Filtrar por marca"
                    value={filters.brand}
                    onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Consumo (W)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.minWatts}
                      onChange={(e) => setFilters({ ...filters, minWatts: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.maxWatts}
                      onChange={(e) => setFilters({ ...filters, maxWatts: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Horario</Label>
                  <Select
                    value={filters.schedule}
                    onValueChange={(value) => setFilters({ ...filters, schedule: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los horarios" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => setFilters({
                      search: '',
                      category: '',
                      minWatts: '',
                      maxWatts: '',
                      brand: '',
                      schedule: ''
                    })}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Dispositivos Disponibles</CardTitle>
                <CardDescription>
                  {filteredDevices.length} dispositivos encontrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {filteredDevices.map(device => (
                      <Card 
                        key={device.key} 
                        className="hover:shadow-md transition-all duration-200"
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <Power className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <CardTitle className="text-lg">{device.label}</CardTitle>
                                <CardDescription>{device.category}</CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <Settings2 className="h-3 w-3" />
                                {device.averageWatts}W
                              </Badge>
                              {!device.isDefault && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => setDeviceToDelete(device.key)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {device.commonBrands.map(brand => (
                              <div key={brand.brand} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm text-muted-foreground">
                                    {brand.brand}
                                  </h4>
                                  {device.key.startsWith('custom_') && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0"
                                      onClick={() => setDeviceToDelete(parseInt(device.key.replace('custom_', '')))}
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  )}
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                  {brand.models.map(model => (
                                    <Button
                                      key={model.name}
                                      variant={selectedDevice?.model === model.name ? "default" : "outline"}
                                      className="justify-between h-auto py-2 px-4"
                                      onClick={() => handleDeviceSelect(device.key, brand.brand, model.name, model.watts)}
                                    >
                                      <div className="flex items-center gap-2">
                                        <span>{model.name}</span>
                                        {deviceDefaults[device.key.replace(/^(default_|custom_)/, '')]?.commonSchedules && (
                                          <Badge variant="outline" className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            {deviceDefaults[device.key.replace(/^(default_|custom_)/, '')]?.commonSchedules?.[0].label}
                                          </Badge>
                                        )}
                                      </div>
                                      <Badge>{model.watts}W</Badge>
                                    </Button>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Dispositivo Seleccionado</CardTitle>
                <CardDescription>
                  Detalles del dispositivo a agregar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedDevice ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Dispositivo</Label>
                      <p className="text-lg font-medium">
                        {deviceDefaults[selectedDevice.type]?.label || selectedDevice.type}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Marca y Modelo</Label>
                      <p className="text-lg font-medium">
                        {selectedDevice.brand} - {selectedDevice.model}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Consumo</Label>
                      <p className="text-lg font-medium">{selectedDevice.watts}W</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        className="flex-1"
                        onClick={handleAddSelectedDevice}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Dispositivo
                      </Button>
                      {selectedDevice.type.startsWith('custom_') && (
                        <Button 
                          variant="destructive"
                          onClick={() => setDeviceToDelete(parseInt(selectedDevice.type.replace('custom_', '')))}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Selecciona un dispositivo de la lista para agregarlo
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="new">
        <NewDeviceForm 
          onDeviceAdd={handleNewDeviceAdd} 
          categories={categories}
          onCategoryAdd={handleCategoryAdd}
        />
      </TabsContent>

      <AlertDialog open={deviceToDelete !== null} onOpenChange={() => setDeviceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el dispositivo de la base de datos.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deviceToDelete && handleDeleteDevice(deviceToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  )
}

export default AddDevice 