import { useEffect, useState } from 'react'
import { NormDesignationService } from '@/modules/en13813/services/norm-designation.service'

interface UseNormDesignationProps {
  binderType?: string
  compressiveClass?: string
  flexuralClass?: string
  wearResistanceClass?: string
  surfaceHardnessClass?: string
  bondStrengthClass?: string
  impactResistanceClass?: string
  fireClass?: string
}

export function useNormDesignation(props: UseNormDesignationProps) {
  const [designation, setDesignation] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    try {
      if (!props.binderType) {
        setDesignation('')
        setDescription('')
        setErrors([])
        return
      }

      const newDesignation = NormDesignationService.generateDesignation({
        binderType: props.binderType as any,
        compressiveClass: props.compressiveClass,
        flexuralClass: props.flexuralClass,
        wearResistanceClass: props.wearResistanceClass,
        surfaceHardnessClass: props.surfaceHardnessClass,
        bondStrengthClass: props.bondStrengthClass,
        impactResistanceClass: props.impactResistanceClass,
      })

      setDesignation(newDesignation)
      setDescription(NormDesignationService.getDescription(newDesignation))
      
      const validation = NormDesignationService.validateDesignation(newDesignation)
      setErrors(validation.errors)
    } catch (error: any) {
      setErrors([error.message])
      setDesignation('')
      setDescription('')
    }
  }, [
    props.binderType,
    props.compressiveClass,
    props.flexuralClass,
    props.wearResistanceClass,
    props.surfaceHardnessClass,
    props.bondStrengthClass,
    props.impactResistanceClass,
  ])

  return {
    designation,
    description,
    errors,
    isValid: errors.length === 0 && designation !== ''
  }
}