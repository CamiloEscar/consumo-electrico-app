import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"

interface NewDeviceProps {
  onDeviceAdd: (device: {
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
  }) => void;
  categories: Array<{ value: string; label: string }>;
  onCategoryAdd: (category: { value: string; label: string }) => void;
}

export function NewDeviceForm({ onDeviceAdd, categories, onCategoryAdd }: NewDeviceProps) {
  const [formData, setFormData] = useState({
    type: '',
    label: '',
    brand: '',
    model: '',
    watts: '',
    category: '',
    description: '',
    hoursPerDay: 1,
    daysPerWeek: 7,
    specifications: {} as Record<string, string>
  })
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([])
  const [error, setError] = useState('')
  const [newCategory, setNewCategory] = useState({ value: '', label: '' })
  const [showNewCategoryDialog, setShowNewCategoryDialog] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = () => {
    if (!formData.type || !formData.label || !formData.brand || !formData.model || !formData.watts || !formData.category) {
      setError('Por favor complete todos los campos obligatorios')
      return
    }

    try {
      const deviceData = {
        type: formData.type,
        brand: formData.brand,
        model: formData.model,
        watts: Number(formData.watts),
        hoursPerDay: formData.hoursPerDay,
        daysPerWeek: formData.daysPerWeek,
        label: formData.label,
        category: formData.category,
        description: formData.description,
        specifications: specs.reduce((acc, spec) => {
          if (spec.key && spec.value) {
            acc[spec.key] = spec.value
          }
          return acc
        }, {} as Record<string, string>)
      }

      onDeviceAdd(deviceData)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      // Limpiar el formulario
      setFormData({
        type: '',
        label: '',
        brand: '',
        model: '',
        watts: '',
        category: '',
        description: '',
        hoursPerDay: 1,
        daysPerWeek: 7,
        specifications: {}
      })
      setSpecs([])
      setError('')
    } catch (error) {
      console.error('Error in handleSubmit:', error)
      setError('Error al guardar el dispositivo')
    }
  }

  const addSpecification = () => {
    setSpecs([...specs, { key: '', value: '' }])
  }

  const updateSpecification = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs]
    newSpecs[index][field] = value
    setSpecs(newSpecs)
  }

  const removeSpecification = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index))
  }

  const handleAddCategory = () => {
    if (!newCategory.value || !newCategory.label) {
      setError('Por favor complete los campos de la nueva categoría')
      return
    }

    // Validar que no exista la categoría
    if (categories.some(cat => cat.value === newCategory.value)) {
      setError('Ya existe una categoría con ese identificador')
      return
    }

    onCategoryAdd(newCategory)
    setShowNewCategoryDialog(false)
    setNewCategory({ value: '', label: '' })
    // Opcionalmente, seleccionar la nueva categoría
    setFormData({ ...formData, category: newCategory.value })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nuevo Dispositivo</CardTitle>
        <CardDescription>
          Agrega un nuevo dispositivo personalizado al catálogo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Identificador único *</Label>
              <Input
                id="type"
                placeholder="ej. samsung_tv_2024"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="label">Nombre para mostrar *</Label>
              <Input
                id="label"
                placeholder="ej. Televisor Samsung 2024"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                placeholder="ej. Samsung"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Modelo *</Label>
              <Input
                id="model"
                placeholder="ej. QN55Q80C"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="watts">Consumo (W) *</Label>
              <Input
                id="watts"
                type="number"
                placeholder="ej. 150"
                value={formData.watts}
                onChange={(e) => setFormData({ ...formData, watts: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hoursPerDay">Horas por día *</Label>
              <Input
                id="hoursPerDay"
                type="number"
                min="1"
                max="24"
                placeholder="ej. 8"
                value={formData.hoursPerDay || 1}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  hoursPerDay: parseInt(e.target.value) || 1 
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="daysPerWeek">Días por semana *</Label>
              <Input
                id="daysPerWeek"
                type="number"
                min="1"
                max="7"
                placeholder="ej. 5"
                value={formData.daysPerWeek || 7}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  daysPerWeek: parseInt(e.target.value) || 7 
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Categoría *</Label>
              <Dialog open={showNewCategoryDialog} onOpenChange={setShowNewCategoryDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Categoría
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Agregar Nueva Categoría</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="categoryValue">Identificador</Label>
                      <Input
                        id="categoryValue"
                        placeholder="ej. gaming"
                        value={newCategory.value}
                        onChange={(e) => setNewCategory({ 
                          ...newCategory, 
                          value: e.target.value.toLowerCase().replace(/\s+/g, '_') 
                        })}
                      />
                      <p className="text-sm text-muted-foreground">
                        El identificador debe ser único y sin espacios
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoryLabel">Nombre para mostrar</Label>
                      <Input
                        id="categoryLabel"
                        placeholder="ej. Gaming"
                        value={newCategory.label}
                        onChange={(e) => setNewCategory({ ...newCategory, label: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewCategoryDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddCategory}>
                      Agregar Categoría
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Describe las características principales del dispositivo"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Especificaciones adicionales</Label>
              <Button variant="outline" size="sm" onClick={addSpecification}>
                <Plus className="h-4 w-4 mr-2" />
                Agregar especificación
              </Button>
            </div>
            
            {specs.map((spec, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nombre (ej. Resolución)"
                  value={spec.key}
                  onChange={(e) => updateSpecification(index, 'key', e.target.value)}
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="Valor (ej. 4K)"
                    value={spec.value}
                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                  />
                  <Button 
                    variant="destructive" 
                    size="icon"
                    onClick={() => removeSpecification(index)}
                  >
                    ×
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4">
              <AlertDescription>
                Dispositivo guardado exitosamente
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={() => {
            setFormData({
              type: '',
              label: '',
              brand: '',
              model: '',
              watts: '',
              category: '',
              description: '',
              hoursPerDay: 1,
              daysPerWeek: 7,
              specifications: {}
            })
            setSpecs([])
          }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!formData.type || !formData.label || !formData.brand || !formData.model || !formData.watts || !formData.category}
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar Dispositivo
        </Button>
      </CardFooter>
    </Card>
  )
} 