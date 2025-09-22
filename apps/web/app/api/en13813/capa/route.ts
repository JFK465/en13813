import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import CAPAService from '@/modules/en13813/services/capa.service'
import type {
  Deviation,
  RootCauseAnalysis,
  CorrectiveAction,
  PreventiveAction,
  EffectivenessCheck
} from '@/modules/en13813/types/deviation.types'

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
    const capaService = CAPAService.getInstance()

    switch (action) {
      case 'createDeviation': {
        const deviation = await capaService.createDeviation({
          ...data,
          tenant_id: user.id,
          created_by: user.id,
          discovered_by: data.discovered_by || user.email
        })

        // Store in database
        const { error: dbError } = await supabase
          .from('en13813_deviations')
          .insert({
            id: deviation.id,
            deviation_number: deviation.deviation_number,
            title: deviation.title,
            description: deviation.description,
            type: deviation.type,
            severity: deviation.severity,
            source: deviation.source,
            discovered_date: deviation.discovered_date,
            discovered_by: deviation.discovered_by,
            status: deviation.status,
            recipe_id: deviation.recipe_id,
            batch_id: deviation.batch_id,
            test_report_id: deviation.test_report_id,
            tenant_id: user.id,
            created_by: user.id
          })

        if (dbError) {
          console.error('Error storing deviation:', dbError)
        }

        return NextResponse.json({
          success: true,
          data: deviation
        })
      }

      case 'addRootCauseAnalysis': {
        const { deviationId, analysis } = data
        await capaService.performRootCauseAnalysis(deviationId, analysis)

        // Update in database
        const { error } = await supabase
          .from('en13813_deviations')
          .update({
            root_cause_analysis: analysis,
            status: 'investigation',
            updated_at: new Date().toISOString()
          })
          .eq('id', deviationId)

        if (error) {
          console.error('Error updating deviation:', error)
        }

        return NextResponse.json({ success: true })
      }

      case 'addCorrectiveAction': {
        const { deviationId, action } = data
        const correctiveAction = await capaService.addCorrectiveAction(deviationId, {
          ...action,
          responsible_person: action.responsible_person || user.email
        })

        // Store in database
        const { error } = await supabase
          .from('en13813_corrective_actions')
          .insert({
            id: correctiveAction.id,
            deviation_id: deviationId,
            action_number: correctiveAction.action_number,
            description: correctiveAction.description,
            responsible_person: correctiveAction.responsible_person,
            department: correctiveAction.department,
            planned_start_date: correctiveAction.planned_start_date,
            planned_end_date: correctiveAction.planned_end_date,
            status: correctiveAction.status,
            created_by: user.id
          })

        if (error) {
          console.error('Error storing corrective action:', error)
        }

        return NextResponse.json({
          success: true,
          data: correctiveAction
        })
      }

      case 'scheduleEffectivenessCheck': {
        const { deviationId, check } = data
        const effectivenessCheck = await capaService.scheduleEffectivenessCheck(deviationId, check)

        // Store in database
        const { error } = await supabase
          .from('en13813_effectiveness_checks')
          .insert({
            id: effectivenessCheck.id,
            deviation_id: deviationId,
            check_number: effectivenessCheck.check_number,
            check_type: effectivenessCheck.check_type,
            check_method: effectivenessCheck.check_method,
            planned_date: effectivenessCheck.planned_date,
            success_criteria: effectivenessCheck.success_criteria,
            created_by: user.id
          })

        if (error) {
          console.error('Error storing effectiveness check:', error)
        }

        return NextResponse.json({
          success: true,
          data: effectivenessCheck
        })
      }

      case 'performEffectivenessCheck': {
        const { checkId, results } = data
        await capaService.performEffectivenessCheck(checkId, {
          ...results,
          performed_by: user.email
        })

        // Update in database
        const { error } = await supabase
          .from('en13813_effectiveness_checks')
          .update({
            performed_date: new Date().toISOString(),
            performed_by: user.email,
            results,
            effectiveness_rating: results.criteria_met ? 'effective' : 'not_effective',
            updated_at: new Date().toISOString()
          })
          .eq('id', checkId)

        if (error) {
          console.error('Error updating effectiveness check:', error)
        }

        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('CAPA API Error:', error)
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
    const capaService = CAPAService.getInstance()

    switch (action) {
      case 'listDeviations': {
        const filter = {
          status: searchParams.get('status')?.split(','),
          severity: searchParams.get('severity')?.split(','),
          type: searchParams.get('type')?.split(','),
          recipe_id: searchParams.get('recipe_id') || undefined,
          batch_id: searchParams.get('batch_id') || undefined
        }

        const deviations = await capaService.listDeviations(filter)

        return NextResponse.json({
          success: true,
          data: deviations
        })
      }

      case 'getDeviation': {
        const id = searchParams.get('id')
        if (!id) {
          return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        const deviation = await capaService.getDeviation(id)

        return NextResponse.json({
          success: true,
          data: deviation
        })
      }

      case 'getStatistics': {
        const statistics = await capaService.getCAPAStatistics()

        return NextResponse.json({
          success: true,
          data: statistics
        })
      }

      case 'getOverdueChecks': {
        const overdueChecks = await capaService.getOverdueEffectivenessChecks()

        return NextResponse.json({
          success: true,
          data: overdueChecks
        })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('CAPA API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}