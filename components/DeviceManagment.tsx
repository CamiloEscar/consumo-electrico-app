import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Save, Database } from "lucide-react";
import { deviceDefaults, DeviceDefault } from '@/lib/deviceDefaults';

interface DeviceManagementProps {
  onDeviceAdd: (device: {
    type: string;
    brand: string;
    model: string;
    watts: number;
  }) => void;
}

const DeviceManagement = ({ onDeviceAdd }: DeviceManagementProps) => {
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [newDevice, setNewDevice] = useState({
    type: '',
    brand: '',
    model: '',
    watts: '',
    category: ''
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const deviceCategories = [
    { value: 'kitchen', label: 'Cocina' },
    { value: 'entertainment', label: 'Entretenimiento' },
    { value: 'office', label: 'Oficina' },
    { value: 'appliances', label: 'Electrodomésticos' },
    { value: 'lighting', label: 'Iluminación' },
    { value: 'climate', label: 'Climatización' }
  ];

  const handleSubmit = async () => {
    if (!newDevice.type || !newDevice.brand || !newDevice.model || !newDevice.watts || !newDevice.category) {
      setError('Por favor complete todos los campos');
      return;
    }

    try {
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDevice),
      });

      if (!response.ok) {
        throw new Error('Error al guardar el dispositivo');
      }

      const deviceData = {
        type: newDevice.type,
        brand: newDevice.brand,
        model: newDevice.model,
        watts: parseInt(newDevice.watts),
      };

      onDeviceAdd(deviceData);
      setSuccess('Dispositivo guardado exitosamente');
      setNewDevice({
        type: '',
        brand: '',
        model: '',
        watts: '',
        category: ''
      });
      setIsAddingDevice(false);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError('Error al guardar el dispositivo: ' + errorMessage);
    }
  };

  const getDevicesByCategory = (category: string) => {
    return Object.entries(deviceDefaults)
      .filter(([_, device]) => device.category === category)
      .map(([key, device]) => ({
        key,
        ...device
      }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Gestión de Dispositivos</span>
          <Dialog open={isAddingDevice} onOpenChange={setIsAddingDevice}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Dispositivo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Dispositivo</DialogTitle>
                <DialogDescription>
                  Complete los detalles del nuevo dispositivo. Los campos marcados con * son obligatorios.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={newDevice.category}
                    onValueChange={(value) => setNewDevice({ ...newDevice, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceCategories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {newDevice.category && (
                  <div className="grid gap-2">
                    <Label htmlFor="type">Tipo de Dispositivo *</Label>
                    <Select
                      value={newDevice.type}
                      onValueChange={(value) => {
                        const deviceInfo = deviceDefaults[value];
                        setNewDevice({ 
                          ...newDevice, 
                          type: value,
                          brand: '', // Reset brand when type changes
                          model: '', // Reset model when type changes
                          watts: '' // Reset watts when type changes
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {getDevicesByCategory(newDevice.category).map((device) => (
                          <SelectItem key={device.key} value={device.key}>
                            {device.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newDevice.type && (
                  <div className="grid gap-2">
                    <Label htmlFor="brand">Marca *</Label>
                    <Select
                      value={newDevice.brand}
                      onValueChange={(value) => setNewDevice({ ...newDevice, brand: value, model: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceDefaults[newDevice.type].commonBrands.map((brand) => (
                          <SelectItem key={brand.brand} value={brand.brand}>
                            {brand.brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newDevice.brand && (
                  <div className="grid gap-2">
                    <Label htmlFor="model">Modelo *</Label>
                    <Select
                      value={newDevice.model}
                      onValueChange={(value) => {
                        const brandInfo = deviceDefaults[newDevice.type].commonBrands
                          .find(b => b.brand === newDevice.brand);
                        const modelInfo = brandInfo?.models.find(m => m.name === value);
                        setNewDevice({ 
                          ...newDevice, 
                          model: value,
                          watts: modelInfo ? modelInfo.watts.toString() : ''
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un modelo" />
                      </SelectTrigger>
                      <SelectContent>
                        {deviceDefaults[newDevice.type].commonBrands
                          .find(b => b.brand === newDevice.brand)
                          ?.models.map((model) => (
                            <SelectItem key={model.name} value={model.name}>
                              {model.name} - {model.watts}W
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {newDevice.model && (
                  <div className="grid gap-2">
                    <Label htmlFor="watts">Potencia (W)</Label>
                    <Input
                      id="watts"
                      type="number"
                      value={newDevice.watts}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddingDevice(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSubmit} disabled={!newDevice.model}>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Dispositivo
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Visualice, agregue y gestione los dispositivos disponibles en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">
              <Database className="h-4 w-4 mr-2" />
              Explorar Dispositivos
            </TabsTrigger>
            <TabsTrigger value="stats">
              Estadísticas
            </TabsTrigger>
          </TabsList>
          <TabsContent value="browse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deviceCategories.map((category) => (
                <Card key={category.value}>
                  <CardHeader>
                    <CardTitle>{category.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {getDevicesByCategory(category.value).map((device) => (
                        <div key={device.key} className="p-2 bg-secondary/20 rounded-lg">
                          <p className="font-medium">{device.label}</p>
                          <p className="text-sm text-muted-foreground">
                            Consumo promedio: {device.averageWatts}W
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="stats">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Aquí se mostrarían estadísticas sobre los dispositivos registrados
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DeviceManagement;