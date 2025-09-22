import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import MarkingDeliveryNoteService from '@/modules/en13813/services/marking-delivery-note.service'
import type { Recipe, Batch } from '@/modules/en13813/types'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'generateMarkingLabel': {
        const { recipeId, batchId, quantity, includeCE } = data

        // Fetch recipe
        const { data: recipe, error: recipeError } = await supabase
          .from('en13813_recipes')
          .select('*')
          .eq('id', recipeId)
          .single()

        if (recipeError || !recipe) {
          return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
        }

        // Fetch batch
        const { data: batch, error: batchError } = await supabase
          .from('en13813_batches')
          .select('*')
          .eq('id', batchId)
          .single()

        if (batchError || !batch) {
          return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }

        // Generate marking label
        const markingLabel = MarkingDeliveryNoteService.generateMarkingLabel({
          recipe: recipe as Recipe,
          batch: batch as Batch,
          quantity,
          includeCE
        })

        return NextResponse.json({
          success: true,
          data: markingLabel
        })
      }

      case 'generateDeliveryNote': {
        const {
          recipeId,
          batchId,
          deliveryData,
          quantity
        } = data

        // Fetch recipe and batch
        const [recipeResult, batchResult] = await Promise.all([
          supabase.from('en13813_recipes').select('*').eq('id', recipeId).single(),
          supabase.from('en13813_batches').select('*').eq('id', batchId).single()
        ])

        if (recipeResult.error || !recipeResult.data) {
          return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
        }

        if (batchResult.error || !batchResult.data) {
          return NextResponse.json({ error: 'Batch not found' }, { status: 404 })
        }

        // Generate delivery note
        const deliveryNote = MarkingDeliveryNoteService.generateDeliveryNote({
          ...deliveryData,
          recipe: recipeResult.data as Recipe,
          batch: batchResult.data as Batch,
          quantity,
          ceMarkingRequired: true
        })

        // Store delivery note in database
        const { data: savedNote, error: saveError } = await supabase
          .from('en13813_delivery_notes')
          .insert({
            delivery_note_number: deliveryData.deliveryNoteNumber,
            recipe_id: recipeId,
            batch_id: batchId,
            customer_name: deliveryData.customerName,
            customer_address: deliveryData.customerAddress,
            project_name: deliveryData.projectName,
            quantity_value: quantity.value,
            quantity_unit: quantity.unit,
            vehicle_number: deliveryData.vehicleNumber,
            driver_name: deliveryData.driverName,
            remarks: deliveryData.remarks,
            delivery_date: deliveryData.deliveryDate || new Date(),
            created_by: user.id,
            tenant_id: user.id // Or use actual tenant_id if multi-tenant
          })
          .select()
          .single()

        if (saveError) {
          console.error('Error saving delivery note:', saveError)
        }

        return NextResponse.json({
          success: true,
          data: {
            deliveryNote,
            savedId: savedNote?.id
          }
        })
      }

      case 'validateCompliance': {
        const { recipeId } = data

        // Fetch recipe
        const { data: recipe, error } = await supabase
          .from('en13813_recipes')
          .select('*')
          .eq('id', recipeId)
          .single()

        if (error || !recipe) {
          return NextResponse.json({ error: 'Recipe not found' }, { status: 404 })
        }

        // Validate marking compliance
        const validationResult = MarkingDeliveryNoteService.validateMarkingCompliance(recipe as Recipe)

        return NextResponse.json({
          success: true,
          data: validationResult
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Marking API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    switch (action) {
      case 'listDeliveryNotes': {
        const { data: deliveryNotes, error } = await supabase
          .from('en13813_delivery_notes')
          .select(`
            *,
            recipe:en13813_recipes(*),
            batch:en13813_batches(*)
          `)
          .order('created_at', { ascending: false })
          .limit(50)

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          data: deliveryNotes
        })
      }

      case 'getDeliveryNote': {
        const id = searchParams.get('id')

        const { data: deliveryNote, error } = await supabase
          .from('en13813_delivery_notes')
          .select(`
            *,
            recipe:en13813_recipes(*),
            batch:en13813_batches(*)
          `)
          .eq('id', id)
          .single()

        if (error || !deliveryNote) {
          return NextResponse.json({ error: 'Delivery note not found' }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          data: deliveryNote
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Marking API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}