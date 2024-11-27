import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Tv, Refrigerator, WashingMachine, Computer, Fan, Lamp, 
  Coffee, Microwave, Printer, Smartphone, Router, Gamepad, 
  Scissors, Bluetooth, AirVent, Plug, Lightbulb, Monitor,
  Info
} from 'lucide-react'
import { deviceDefaults } from '@/lib/deviceDefaults'
import { DeviceSelector } from './DeviceSelector'

interface Device {
  id: string;
  type: string;
  brand: string;
  model: string;
  watts: number;
  x: number;
  y: number;
}

interface Room {
  name: string;
  devices: Device[];
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  description: string;
}

const initialRooms: Room[] = [
  { 
    name: 'Sala', 
    x: 0, y: 0, width: 40, height: 30,
    color: 'bg-blue-100 dark:bg-blue-950/50',
    description: 'Sala de estar principal',
    devices: [
      { id: '1', type: 'tv', brand: 'Samsung', model: 'QLED Q80T', watts: 150, x: 10, y: 10 },
      { id: '2', type: 'lamp', brand: 'Philips', model: 'Hue', watts: 9, x: 30, y: 20 },
      { id: '3', type: 'fan', brand: 'Dyson', model: 'Pure Cool', watts: 40, x: 20, y: 25 },
      { id: '4', type: 'router', brand: 'TP-Link', model: 'Archer AX50', watts: 12, x: 35, y: 5 },
    ]
  },
  { 
    name: 'Cocina', 
    x: 40, y: 0, width: 30, height: 30,
    color: 'bg-green-100 dark:bg-green-950/50',
    description: 'Cocina principal',
    devices: [
      { id: '5', type: 'refrigerator', brand: 'LG', model: 'InstaView', watts: 100, x: 45, y: 5 },
      { id: '6', type: 'coffee', brand: 'Nespresso', model: 'Vertuo', watts: 1350, x: 60, y: 10 },
      { id: '7', type: 'microwave', brand: 'Panasonic', model: 'NN-SN686S', watts: 1200, x: 55, y: 20 },
    ]
  },
  { 
    name: 'Dormitorio', 
    x: 0, y: 30, width: 40, height: 30,
    color: 'bg-purple-100 dark:bg-purple-950/50',
    description: 'Dormitorio principal',
    devices: [
      { id: '13', type: 'tv', brand: 'LG', model: 'OLED C1', watts: 100, x: 10, y: 40 },
      { id: '14', type: 'fan', brand: 'Honeywell', model: 'QuietSet', watts: 36, x: 30, y: 45 },
      { id: '15', type: 'smartphone', brand: 'Apple', model: 'iPhone 12', watts: 20, x: 20, y: 50 },
    ]
  },
  { 
    name: 'Oficina', 
    x: 40, y: 30, width: 30, height: 30,
    color: 'bg-yellow-100 dark:bg-yellow-950/50',
    description: 'Oficina principal',
    devices: [
      { id: '10', type: 'computer', brand: 'Dell', model: 'XPS 8940', watts: 460, x: 45, y: 40 },
      { id: '11', type: 'lamp', brand: 'BenQ', model: 'ScreenBar', watts: 5, x: 60, y: 45 },
      { id: '12', type: 'printer', brand: 'HP', model: 'OfficeJet Pro 9015', watts: 30, x: 55, y: 50 },
    ]
  },
  {
    name: 'Baño',
    x: 70, y: 0, width: 30, height: 30,
    color: 'bg-cyan-100 dark:bg-cyan-950/50',
    description: 'Baño principal',
    devices: [
      { id: '18', type: 'hairDryer', brand: 'Dyson', model: 'Supersonic', watts: 1600, x: 75, y: 10 },
      { id: '19', type: 'lightbulb', brand: 'Philips', model: 'LED 60W Equivalent', watts: 9, x: 85, y: 20 },
    ]
  },
  {
    name: 'Lavandería',
    x: 70, y: 30, width: 30, height: 30,
    color: 'bg-pink-100 dark:bg-pink-950/50',
    description: 'Lavandería principal',
    devices: [
      { id: '8', type: 'washingMachine', brand: 'Maytag', model: 'MHW5630HW', watts: 500, x: 75, y: 40 },
      { id: '9', type: 'hairDryer', brand: 'Conair', model: '1875 Watt', watts: 1875, x: 85, y: 50 },
    ]
  },
]

const deviceIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  tv: Tv,
  refrigerator: Refrigerator,
  washingMachine: WashingMachine,
  computer: Computer,
  fan: Fan,
  lamp: Lamp,
  coffee: Coffee,
  microwave: Microwave,
  printer: Printer,
  smartphone: Smartphone,
  router: Router,
  gamepad: Gamepad,
  hairDryer: Scissors,
  bluetooth: Bluetooth,
  airVent: AirVent,
  plug: Plug,
  lightbulb: Lightbulb,
  monitor: Monitor,
}

interface HousePlanProps {
  selectedDevices: Device[];
  onDeviceClick?: (device: Device) => void;
}

export default function HousePlan({ selectedDevices, onDeviceClick }: HousePlanProps) {
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      <Tabs defaultValue="map" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Vista del Plano</TabsTrigger>
          <TabsTrigger value="list">Lista de Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="map">
          <div className="relative w-full h-[600px] bg-gray-50 dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="absolute inset-0" 
                 style={{
                   backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
                   backgroundSize: '20px 20px'
                 }}>
            </div>
            
            {initialRooms.map((room) => (
              <div
                key={room.name}
                className={`absolute ${room.color} border-2 ${
                  selectedRoom === room.name 
                    ? 'border-primary shadow-lg' 
                    : 'border-gray-400 dark:border-gray-600'
                } rounded-md cursor-pointer transition-all duration-200 hover:shadow-md`}
                style={{
                  left: `${room.x}%`,
                  top: `${room.y}%`,
                  width: `${room.width}%`,
                  height: `${room.height}%`,
                }}
                onClick={() => setSelectedRoom(room.name === selectedRoom ? null : room.name)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white/50 dark:bg-black/50 px-2 py-1 rounded">
                      {room.name}
                    </span>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                      {room.devices.length} dispositivos
                    </p>
                  </div>
                </div>

                {room.devices.map((device) => {
                  const DeviceIcon = deviceIcons[device.type] || Plug
                  const deviceInfo = deviceDefaults[device.type]
                  const isSelected = selectedDevices?.some(d => 
                    d.type === device.type && 
                    d.brand === device.brand && 
                    d.model === device.model
                  )

                  return (
                    <TooltipProvider key={device.id}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`absolute p-1.5 ${
                              isSelected
                                ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' 
                                : 'bg-white dark:bg-gray-800 hover:bg-primary/10'
                            } shadow-sm transition-all duration-200`}
                            style={{
                              left: `${device.x - room.x}%`,
                              top: `${device.y - room.y}%`,
                              transform: 'translate(-50%, -50%)'
                            }}
                            onClick={(e) => onDeviceClick?.(device)}
                          >
                            <DeviceIcon className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right" className="p-3 space-y-1">
                          <div className="flex items-center gap-2">
                            <DeviceIcon className="h-4 w-4" />
                            <p className="font-bold">{device.brand} {device.model}</p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {deviceInfo?.label || device.type}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Consumo: {device.watts}W
                          </p>
                          {deviceInfo && (
                            <div className="pt-2 border-t border-border">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Consumo promedio: {deviceInfo.averageWatts}W
                              </p>
                              <Badge variant="secondary" className="mt-1">
                                {deviceInfo.category}
                              </Badge>
                            </div>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )
                })}
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <ScrollArea className="h-[500px] pr-4">
            {initialRooms.map((room) => (
              <Card key={room.name} className="mb-4">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{room.name}</span>
                    <Badge variant="outline">{room.devices.length} dispositivos</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {room.devices.map((device) => {
                      const DeviceIcon = deviceIcons[device.type] || Plug
                      const deviceInfo = deviceDefaults[device.type]
                      const isSelected = selectedDevices?.some(d => 
                        d.type === device.type && 
                        d.brand === device.brand && 
                        d.model === device.model
                      )

                      return (
                        <Button
                          key={device.id}
                          variant={isSelected ? "default" : "outline"}
                          className="justify-start h-auto py-2"
                          onClick={() => onDeviceClick?.(device)}
                        >
                          <div className="flex items-center gap-2">
                            <DeviceIcon className="h-4 w-4" />
                            <div className="text-left">
                              <p className="font-medium">{device.brand} {device.model}</p>
                              <p className="text-xs text-muted-foreground">
                                {deviceInfo?.label || device.type} - {device.watts}W
                              </p>
                            </div>
                          </div>
                        </Button>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {selectedRoom && (
        <Alert>
          <AlertDescription>
            Haz clic en los dispositivos de {selectedRoom} para agregarlos a tu cálculo
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}