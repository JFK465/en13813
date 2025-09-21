import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { PDFGeneratorService } from '@/modules/en13813/services/pdf-generator.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get DoP data
    const { data: dop, error: dopError } = await supabase
      .from('en13813_dops')
      .select('*')
      .eq('id', params.id)
      .single()
    
    if (dopError || !dop) {
      return NextResponse.json({ error: 'DoP not found' }, { status: 404 })
    }

    // Get related recipe
    const { data: recipe } = await supabase
      .from('en13813_recipes')
      .select('*')
      .eq('id', dop.recipe_id)
      .single()
    
    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
    }

    // Get manufacturer data (tenant)
    const { data: tenant } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', recipe.tenant_id)
      .single()

    // Generate PDF
    const pdfService = new PDFGeneratorService()
    const pdfBytes = await pdfService.generateDoPPDF({
      dop,
      recipe,
      manufacturer: dop.manufacturer_data || {
        name: tenant?.name || 'Estrichwerke GmbH',
        address: 'Musterstraße 1',
        postalCode: '12345',
        city: 'Musterstadt',
        country: 'Deutschland',
        phone: '+49 123 456789',
        email: 'info@estrichwerke.de',
        website: 'www.estrichwerke.de'
      },
      language: 'de'
    })

    // Return PDF as response
    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="DoP_${dop.dop_number}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error: any) {
    console.error('Error generating PDF:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}