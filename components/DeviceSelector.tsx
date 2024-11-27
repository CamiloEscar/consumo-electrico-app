import { useState } from 'react'
import { deviceDefaults } from '@/lib/deviceDefaults'
import { Button } from './ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Clock } from 'lucide-react'
import { Badge } from './ui/badge'
import { Card } from './ui/card'

interface DeviceSelectorProps {
  onDeviceSelect: (device: {
    type: string;
    brand: string;
    model: string;
    watts: number;
    hoursPerDay: number;
    daysPerWeek: number;
  }) => void;
}

export function DeviceSelector({ onDeviceSelect }: DeviceSelectorProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedBrand, setSelectedBrand] = useState<string>('')
  const [selectedModel, setSelectedModel] = useState<string>('')
  const [hoursPerDay, setHoursPerDay] = useState(1)
  const [daysPerWeek, setDaysPerWeek] = useState(7)

  const deviceInfo = selectedType ? deviceDefaults[selectedType] : null

  const handleDeviceSubmit = () => {
    if (!deviceInfo || !selectedBrand || !selectedModel) return

    const brandInfo = deviceInfo.commonBrands.find(b => b.brand === selectedBrand)
    const modelInfo = brandInfo?.models.find(m => m.name === selectedModel)

    if (!modelInfo) return

    onDeviceSelect({
      type: selectedType,
      brand: selectedBrand,
      model: selectedModel,
      watts: modelInfo.watts,
      hoursPerDay,
      daysPerWeek
    })

    // Limpiar selección después de agregar
    setSelectedType('')
    setSelectedBrand('')
    setSelectedModel('')
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <Select onValueChange={setSelectedType} value={selectedType}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar tipo de dispositivo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(deviceDefaults).map(([key, device]) => (
              <SelectItem key={key} value={key}>
                <div className="flex items-center justify-between w-full">
                  <span>{device.label}</span>
                  <Badge variant="secondary">{device.category}</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {deviceInfo && (
          <>
            <Card className="p-4 bg-muted/50">
              <div className="text-sm space-y-2">
                <p><strong>Consumo promedio:</strong> {deviceInfo.averageWatts}W</p>
                <p><strong>Categoría:</strong> {deviceInfo.category}</p>
              </div>
            </Card>

            <Select onValueChange={setSelectedBrand} value={selectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar marca" />
              </SelectTrigger>
              <SelectContent>
                {deviceInfo.commonBrands.map(brand => (
                  <SelectItem key={brand.brand} value={brand.brand}>
                    {brand.brand}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedBrand && (
              <Select onValueChange={setSelectedModel} value={selectedModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar modelo" />
                </SelectTrigger>
                <SelectContent>
                  {deviceInfo.commonBrands
                    .find(b => b.brand === selectedBrand)
                    ?.models.map(model => (
                      <SelectItem key={model.name} value={model.name}>
                        <div className="flex items-center justify-between w-full">
                          <span>{model.name}</span>
                          <Badge>{model.watts}W</Badge>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}

            <Button 
              onClick={handleDeviceSubmit}
              disabled={!selectedModel}
              className="w-full"
            >
              Agregar dispositivo
            </Button>
          </>
        )}
      </div>
    </div>
  )
}