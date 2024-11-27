'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  AlertCircle, Lightbulb, Trash2, HelpCircle, Calculator, 
  PlusCircle, ListChecks, History, PieChart as PieChartIcon,
  Zap, DollarSign, Calendar, Settings, Home 
} from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import AddDevice from './AddDevice'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface Device {
  id: number;
  type: string;
  brand: string;
  model: string;
  watts: number;
  hoursPerDay: number;
  daysPerWeek: number;
  label?: string;
  category?: string;
  description?: string;
  specifications?: Record<string, string>;
}

interface HistoricalDataItem {
  createdAt: string;
  totalConsumption: number;
  devices: { name: string }[];
}

interface ChartDataItem {
  date: string;
  consumption: number;
}

export default function ElectricityCalculator() {
  const [devices, setDevices] = useState<Device[]>([])
  const [totalConsumption, setTotalConsumption] = useState(0)
  const [electricityRate, setElectricityRate] = useState(5) // Precio promedio en pesos por kWh
  const [historicalData, setHistoricalData] = useState<HistoricalDataItem[]>([])
  const [chartData, setChartData] = useState<ChartDataItem[]>([])
  const [showTutorial, setShowTutorial] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deviceToDelete, setDeviceToDelete] = useState<number | null>(null)

  useEffect(() => {
    fetchHistoricalData()
    const savedDarkMode = localStorage.getItem('darkMode') === 'true'
    setDarkMode(savedDarkMode)
    document.documentElement.classList.toggle('dark', savedDarkMode)
  }, [])

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch('/api/historical-data')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: HistoricalDataItem[] = await response.json()
      setHistoricalData(data)
      
      const chartData = data.map(item => ({
        date: new Date(item.createdAt).toLocaleDateString(),
        consumption: item.totalConsumption
      }))
      setChartData(chartData)
      setError(null)
    } catch (error) {
      console.error('Error fetching historical data:', error)
      setError('Error al cargar los datos históricos. Por favor, intente de nuevo más tarde.')
    }
  }

  const addDevice = (deviceData: Omit<Device, 'id'>) => {
    try {
      const newDevice: Device = {
        ...deviceData,
        id: Date.now(),
        hoursPerDay: deviceData.hoursPerDay || 1,
        daysPerWeek: deviceData.daysPerWeek || 7,
      }
      console.log('Adding device:', newDevice) // Para debugging
      setDevices(prev => [...prev, newDevice])
    } catch (error) {
      console.error('Error in addDevice:', error)
      setError('Error al agregar el dispositivo')
    }
  }


  const updateDevice = (id: number, field: keyof Device, value: number) => {
    const updatedDevices = devices.map(device => 
      device.id === id ? { ...device, [field]: value } : device
    )
    setDevices(updatedDevices)
  }

  const removeDevice = (id: number) => {
    const updatedDevices = devices.filter(device => device.id !== id)
    setDevices(updatedDevices)
  }

  const calculateConsumption = async () => {
    try {
      if (devices.length === 0) {
        setError('No hay dispositivos para calcular')
        return
      }

      // Preparar los datos de los dispositivos
      const deviceData = devices.map(device => ({
        type: device.type,
        brand: device.brand,
        model: device.model,
        watts: Number(device.watts),
        hoursPerDay: Number(device.hoursPerDay) || 1,
        daysPerWeek: Number(device.daysPerWeek) || 7,
        label: device.label || `${device.brand} ${device.model}`,
        name: `${device.brand} ${device.model}` // Agregar el campo name
      }))

      // Calcular el consumo total
      const total = deviceData.reduce((acc, device) => {
        const dailyConsumption = (device.watts * device.hoursPerDay * device.daysPerWeek) / 7000 // kWh per day
        return acc + dailyConsumption
      }, 0)

      // Validar el total
      if (isNaN(total) || total <= 0) {
        throw new Error('Error al calcular el consumo total')
      }

      // Imprimir los datos para debugging
      console.log('Sending data:', {
        devices: deviceData,
        totalConsumption: total
      })

      // Enviar los datos a la API
      const response = await fetch('/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          devices: deviceData,
          totalConsumption: total
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('API Error:', result)
        throw new Error(result.error || 'Error al guardar el cálculo')
      }

      if (result.success) {
        setTotalConsumption(total)
        await fetchHistoricalData()
        setError(null)
      } else {
        throw new Error(result.error || 'Error desconocido')
      }
    } catch (error) {
      console.error('Error calculating consumption:', error)
      setError(error instanceof Error ? error.message : 'Error al calcular el consumo')
    }
  }

  const getTotalCost = () => {
    return (totalConsumption * electricityRate * 30).toFixed(2) // Monthly cost
  }

  const getEnergyEfficiencyTips = () => {
    const tips = [
      "Reemplaza las bombillas tradicionales por LED.",
      "Desconecta los aparatos que no estés usando.",
      "Utiliza electrodomésticos con certificación energética A+++.",
      "Aprovecha la luz natural siempre que sea posible.",
      "Ajusta la temperatura del aire acondicionado y calefacción.",
      "Usa temporizadores para apagar dispositivos automáticamente.",
      "Considera instalar paneles solares para reducir el consumo de la red.",
      "Lava la ropa con agua fría cuando sea posible.",
      "Usa cortinas térmicas para mantener la temperatura interior.",
      "Realiza mantenimiento regular de tus electrodomésticos.",
    ]
    return tips[Math.floor(Math.random() * tips.length)]
  }

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode
    setDarkMode(newDarkMode)
    document.documentElement.classList.toggle('dark', newDarkMode)
    localStorage.setItem('darkMode', newDarkMode.toString())
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#8dd1e1', '#a4de6c', '#d0ed57']

  const TABS = [
    {
      id: 'add',
      label: 'Agregar',
      icon: PlusCircle,
      description: 'Agregar nuevos dispositivos'
    },
    {
      id: 'manage',
      label: 'Gestionar',
      icon: ListChecks,
      description: 'Gestionar dispositivos existentes'
    },
    {
      id: 'history',
      label: 'Historial',
      icon: History,
      description: 'Ver historial de consumo'
    },
    {
      id: 'analytics',
      label: 'Análisis',
      icon: PieChartIcon,
      description: 'Análisis y gráficos'
    }
  ]

  const handleDeleteDevice = async (id: number) => {
    try {
      const response = await fetch(`/api/devices/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Error al eliminar el dispositivo')
      }

      // Actualizar la lista de dispositivos
      setDevices(devices.filter(device => device.id !== id))
      setDeviceToDelete(null)
      
      // Opcional: Mostrar mensaje de éxito
      setError(null)
    } catch (error) {
      console.error('Error deleting device:', error)
      setError(error instanceof Error ? error.message : 'Error al eliminar el dispositivo')
    }
  }

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Calculadora de Consumo Eléctrico</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2 bg-secondary/50 p-2 rounded-lg">
              <Label htmlFor="dark-mode" className="text-sm">Modo oscuro</Label>
              <Switch id="dark-mode" checked={darkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Dashboard */}
        <div className="grid gap-6 mb-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Consumo Total</p>
                    <h3 className="text-2xl font-bold">{totalConsumption.toFixed(2)} kWh</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-full">
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Costo Mensual</p>
                    <h3 className="text-2xl font-bold">${getTotalCost()}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-full">
                    <Settings className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dispositivos</p>
                    <h3 className="text-2xl font-bold">{devices.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-500/10 rounded-full">
                    <Calendar className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cálculos</p>
                    <h3 className="text-2xl font-bold">{historicalData.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="add" className="space-y-6">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
            {TABS.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="add">
            <Card>
              <CardHeader>
                <CardTitle>Agregar Dispositivo</CardTitle>
                <CardDescription>Busca y agrega dispositivos a tu cálculo</CardDescription>
              </CardHeader>
              <CardContent>
                <AddDevice onDeviceAdd={addDevice} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Gestionar Dispositivos</CardTitle>
                <CardDescription>
                  Dispositivos agregados: {devices.length}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="electricity-rate">Tarifa eléctrica ($/kWh)</Label>
                    <Input
                      id="electricity-rate"
                      type="number"
                      value={electricityRate}
                      onChange={(e) => setElectricityRate(parseFloat(e.target.value))}
                      className="w-32"
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon">
                          <HelpCircle className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        La tarifa eléctrica es el costo por kilovatio-hora (kWh) de electricidad.
                      </PopoverContent>
                    </Popover>
                  </div>

                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-4">
                      {devices.map((device) => (
                        <Card key={device.id}>
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div>
                                <Label>Dispositivo</Label>
                                <p className="text-lg font-medium">{device.brand} {device.model}</p>
                                <p className="text-sm text-muted-foreground">{device.type} - {device.watts}W</p>
                              </div>
                              <div>
                                <Label htmlFor={`hours-${device.id}`}>Horas por día</Label>
                                <Input
                                  id={`hours-${device.id}`}
                                  type="number"
                                  value={device.hoursPerDay}
                                  onChange={(e) => updateDevice(device.id, 'hoursPerDay', parseFloat(e.target.value))}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`days-${device.id}`}>Días por semana</Label>
                                <Input
                                  id={`days-${device.id}`}
                                  type="number"
                                  min="1"
                                  max="7"
                                  value={device.daysPerWeek}
                                  onChange={(e) => updateDevice(device.id, 'daysPerWeek', parseInt(e.target.value))}
                                />
                              </div>
                              <div className="flex items-end justify-between">
                                <Button 
                                  variant="destructive" 
                                  size="icon"
                                  onClick={() => setDeviceToDelete(device.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>

                  <div className="flex justify-end space-x-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setDevices([])}
                      disabled={devices.length === 0}
                    >
                      Limpiar todo
                    </Button>
                    <Button 
                      onClick={calculateConsumption}
                      disabled={devices.length === 0}
                    >
                      Calcular consumo
                    </Button>
                  </div>

                  {totalConsumption > 0 && (
                    <Card className="border-2 border-primary/20">
                      <CardHeader>
                        <CardTitle>Resultados del Cálculo</CardTitle>
                      </CardHeader>
                      <CardContent className="grid gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-secondary/20 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Consumo Diario</p>
                            <p className="text-2xl font-bold">{totalConsumption.toFixed(2)} kWh</p>
                          </div>
                          <div className="bg-secondary/20 p-4 rounded-lg">
                            <p className="text-sm font-medium mb-2">Costo Mensual Estimado</p>
                            <p className="text-2xl font-bold">${getTotalCost()} pesos</p>
                          </div>
                        </div>
                        
                        <Alert className="bg-primary/5">
                          <Lightbulb className="h-4 w-4" />
                          <AlertTitle>Consejo de Eficiencia</AlertTitle>
                          <AlertDescription>{getEnergyEfficiencyTips()}</AlertDescription>
                        </Alert>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Consumo</CardTitle>
                <CardDescription>
                  Registro histórico de cálculos realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[500px]">
                  <div className="space-y-4">
                    {historicalData.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>Fecha</Label>
                              <p className="text-lg font-medium">
                                {format(new Date(item.createdAt), 'PPP', { locale: es })}
                              </p>
                            </div>
                            <div>
                              <Label>Consumo</Label>
                              <p className="text-lg font-medium">
                                {item.totalConsumption.toFixed(2)} kWh/día
                              </p>
                            </div>
                            <div>
                              <Label>Costo Mensual</Label>
                              <p className="text-lg font-medium">
                                ${(item.totalConsumption * electricityRate * 30).toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Label>Dispositivos</Label>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.devices.map((device, i) => (
                                <Badge key={i} variant="secondary">
                                  {device.name}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Consumo a lo largo del tiempo</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="consumption" 
                        stroke="#8884d8" 
                        name="Consumo (kWh)"
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribución del consumo actual</CardTitle>
                </CardHeader>
                <CardContent className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={devices}
                        dataKey="watts"
                        nameKey="type"
                        cx="50%"
                        cy="50%"
                        outerRadius={150}
                        fill="#8884d8"
                        label
                      >
                        {devices.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Tip del día */}
        {totalConsumption > 0 && (
          <Card className="mt-6 border-2 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Consejo del día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg">{getEnergyEfficiencyTips()}</p>
            </CardContent>
          </Card>
        )}
      </main>

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
    </div>
  )
}