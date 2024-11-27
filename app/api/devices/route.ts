import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    const device = await prisma.device.create({
      data: {
        type: data.type,
        brand: data.brand,
        model: data.model,
        watts: parseInt(data.watts),
        hoursPerDay: data.hoursPerDay || 1,
        daysPerWeek: data.daysPerWeek || 7,
        label: data.label,
        category: data.category,
        description: data.description,
        specifications: data.specifications || {},
      },
    })

    return NextResponse.json({ success: true, device })
  } catch (error) {
    console.error('Error creating device:', error)
    return NextResponse.json(
      { success: false, error: 'Error creating device' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category')
    const sort = searchParams.get('sort') || 'name'
    const order = searchParams.get('order') || 'asc'
    const minWatts = parseInt(searchParams.get('minWatts') || '0')
    const maxWatts = parseInt(searchParams.get('maxWatts') || '99999')

    const devices = await prisma.device.findMany({
      where: {
        AND: [
          {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { brand: { contains: search, mode: 'insensitive' } },
              { model: { contains: search, mode: 'insensitive' } },
              { type: { contains: search, mode: 'insensitive' } },
            ]
          },
          category ? { category } : {},
          { watts: { gte: minWatts, lte: maxWatts } }
        ]
      },
      orderBy: {
        [sort]: order
      }
    })

    const categories = await prisma.category.findMany({
      orderBy: {
        label: 'asc'
      }
    })

    return new NextResponse(
      JSON.stringify({
        success: true,
        devices,
        categories
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
  } catch (error) {
    console.error('Error fetching devices:', error)
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: 'Error fetching devices',
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