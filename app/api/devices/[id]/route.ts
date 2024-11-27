import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    
    // Eliminar solo el dispositivo específico por ID
    const device = await prisma.device.delete({
      where: { id }
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        message: 'Device deleted successfully',
        device
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error deleting device:', error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Error deleting device',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  }
} 