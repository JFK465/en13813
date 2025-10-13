import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, FileWarning, Shield } from 'lucide-react'

interface ComplianceDisclaimerProps {
  variant?: 'default' | 'critical' | 'warning'
  documentType?: 'dop' | 'test-report' | 'batch' | 'recipe' | 'calibration' | 'audit'
  className?: string
}

export function ComplianceDisclaimer({
  variant = 'default',
  documentType,
  className = ''
}: ComplianceDisclaimerProps) {
  const getIcon = () => {
    switch (variant) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'warning':
        return <FileWarning className="h-5 w-5 text-yellow-600" />
      default:
        return <Shield className="h-5 w-5 text-blue-600" />
    }
  }

  const getDocumentSpecificText = () => {
    switch (documentType) {
      case 'dop':
        return 'Diese Leistungserklärung (DoP) muss vor offizieller Verwendung von fachkundigem Personal geprüft und freigegeben werden. Sie sind verantwortlich für die Richtigkeit aller Angaben und die Einhaltung der EN 13813.'
      case 'test-report':
        return 'Dieser Prüfbericht muss von qualifiziertem Personal validiert werden. Stellen Sie sicher, dass alle Messwerte korrekt erfasst wurden und die Bewertung den Normanforderungen entspricht.'
      case 'batch':
        return 'Die Chargeninformationen dienen der Dokumentation. Sie sind verantwortlich für die tatsächliche Produktionskontrolle und Einhaltung der werkseigenen Produktionskontrolle (FPC).'
      case 'recipe':
        return 'Diese Rezeptur muss fachlich validiert werden. EstrichManager unterstützt Sie bei der Dokumentation, ersetzt aber nicht die Erstprüfung (ITT) und fachliche Freigabe.'
      case 'calibration':
        return 'Die Kalibrierungsdaten müssen durch befugtes Personal überprüft werden. Sie sind verantwortlich für die Einhaltung der Kalibrierungsintervalle.'
      case 'audit':
        return 'Dieser Audit-Bericht dient der internen Dokumentation. Die finale Bewertung und Maßnahmenableitung obliegt der fachlich verantwortlichen Person.'
      default:
        return 'Dieses Dokument muss vor Verwendung von fachkundigem Personal geprüft werden. EstrichManager ist ein Hilfswerkzeug und ersetzt nicht die fachliche Beurteilung.'
    }
  }

  const getVariantStyles = () => {
    switch (variant) {
      case 'critical':
        return 'border-red-200 bg-red-50'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50'
      default:
        return 'border-blue-200 bg-blue-50'
    }
  }

  const getTextStyles = () => {
    switch (variant) {
      case 'critical':
        return 'text-red-900'
      case 'warning':
        return 'text-yellow-900'
      default:
        return 'text-blue-900'
    }
  }

  return (
    <Alert className={`${getVariantStyles()} ${className}`}>
      {getIcon()}
      <AlertDescription className={`ml-2 ${getTextStyles()}`}>
        <div className="space-y-2">
          <p className="font-semibold text-sm">
            {variant === 'critical' ? '⚠️ Wichtiger Compliance-Hinweis' : 'ℹ️ Compliance-Hinweis'}
          </p>
          <p className="text-xs leading-relaxed">
            {getDocumentSpecificText()}
          </p>
          {variant === 'critical' && (
            <p className="text-xs font-semibold mt-2">
              Beta-Software: Alle generierten Dokumente erfordern eine manuelle fachliche Prüfung vor offizieller Verwendung.
            </p>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}

interface ComplianceCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  documentType?: string
}

export function ComplianceCheckbox({
  checked,
  onCheckedChange,
  documentType = 'Dokument'
}: ComplianceCheckboxProps) {
  return (
    <div className="flex items-start gap-3 p-4 border border-yellow-200 bg-yellow-50 rounded-md">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        id="compliance-checkbox"
      />
      <label htmlFor="compliance-checkbox" className="text-sm text-yellow-900 cursor-pointer">
        <p className="font-semibold">Ich bestätige die fachliche Prüfung</p>
        <p className="text-xs mt-1">
          Ich habe dieses {documentType} geprüft und bestätige, dass alle Angaben korrekt sind und
          den Anforderungen der EN 13813 entsprechen. Mir ist bewusst, dass ich für die Richtigkeit
          und Compliance-Konformität verantwortlich bin.
        </p>
      </label>
    </div>
  )
}
