import { useNormDesignation } from '@/hooks/useNormDesignation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, AlertCircle, Info } from 'lucide-react'

interface NormDesignationDisplayProps {
  binderType?: string
  compressiveClass?: string
  flexuralClass?: string
  wearResistanceClass?: string
  surfaceHardnessClass?: string
  bondStrengthClass?: string
  impactResistanceClass?: string
}

export function NormDesignationDisplay(props: NormDesignationDisplayProps) {
  const { designation, description, errors, isValid } = useNormDesignation(props)

  if (!props.binderType) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-blue-900">EN 13813 Normbezeichnung</p>
          {isValid ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Gültig
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              <AlertCircle className="w-3 h-3 mr-1" />
              Unvollständig
            </Badge>
          )}
        </div>
        
        {designation ? (
          <>
            <p className="text-2xl font-mono font-bold text-blue-900">{designation}</p>
            <p className="text-sm text-blue-700 mt-2">{description}</p>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Wählen Sie mindestens eine Festigkeitsklasse aus
          </p>
        )}
      </div>

      {errors.length > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <p className="font-medium text-yellow-900 mb-1">Validierungshinweise:</p>
            <ul className="list-disc list-inside text-sm text-yellow-800 space-y-1">
              {errors.map((error, idx) => (
                <li key={idx}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Format:</strong> Bindemittel-Festigkeitsklassen-Zusatzeigenschaften<br />
          <strong>Beispiel:</strong> CT-C25-F4 = Zementestrich mit 25 N/mm² Druckfestigkeit und 4 N/mm² Biegezugfestigkeit
        </AlertDescription>
      </Alert>
    </div>
  )
}