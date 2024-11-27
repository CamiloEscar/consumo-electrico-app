'use client'

import AddDevice from './AddDevice'

interface AddDeviceContainerProps {
  onDeviceAdd: (device: {
    type: string;
    brand: string;
    model: string;
    watts: number;
    hoursPerDay: number;
    daysPerWeek: number;
  }) => void;
}

export default function AddDeviceContainer({ onDeviceAdd }: AddDeviceContainerProps) {
  return <AddDevice onDeviceAdd={onDeviceAdd} />
} 