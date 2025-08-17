import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  GitBranch, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  TrendingUp
} from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Überblick über Ihre Compliance-Aktivitäten
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dokumente</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">
              +12% seit letztem Monat
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aktive Workflows</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              +3 neue diese Woche
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abgeschlossene Aufgaben</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +7 heute
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offene Probleme</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              -2 seit gestern
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Kürzliche Aktivitäten</CardTitle>
            <CardDescription>
              Ihre letzten Aktionen und Workflow-Updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  action: 'Dokument genehmigt',
                  item: 'Datenschutzrichtlinie v2.1',
                  time: 'vor 2 Stunden',
                  type: 'approval'
                },
                {
                  action: 'Workflow gestartet',
                  item: 'ISO 27001 Audit Vorbereitung',
                  time: 'vor 4 Stunden',
                  type: 'workflow'
                },
                {
                  action: 'Aufgabe abgeschlossen',
                  item: 'Risikobewertung Q4',
                  time: 'vor 1 Tag',
                  type: 'task'
                },
                {
                  action: 'Dokument hochgeladen',
                  item: 'Notfallplan IT-Sicherheit',
                  time: 'vor 2 Tagen',
                  type: 'document'
                },
                {
                  action: 'Kommentar hinzugefügt',
                  item: 'DSGVO Compliance Check',
                  time: 'vor 3 Tagen',
                  type: 'comment'
                }
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {activity.type === 'approval' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {activity.type === 'workflow' && <GitBranch className="h-4 w-4 text-blue-600" />}
                      {activity.type === 'task' && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {activity.type === 'document' && <FileText className="h-4 w-4 text-gray-600" />}
                      {activity.type === 'comment' && <FileText className="h-4 w-4 text-gray-600" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">{activity.item}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Anstehende Aufgaben</CardTitle>
            <CardDescription>
              Ihre nächsten Termine und Deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                {
                  title: 'Quartals-Review',
                  due: 'Morgen',
                  priority: 'high'
                },
                {
                  title: 'Zertifikat erneuern',
                  due: 'in 3 Tagen',
                  priority: 'medium'
                },
                {
                  title: 'Schulung planen',
                  due: 'nächste Woche',
                  priority: 'low'
                },
                {
                  title: 'Audit vorbereiten',
                  due: 'in 2 Wochen',
                  priority: 'high'
                }
              ].map((task, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{task.due}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      task.priority === 'high' ? 'destructive' : 
                      task.priority === 'medium' ? 'default' : 'secondary'
                    }
                  >
                    {task.priority === 'high' ? 'Hoch' :
                     task.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Schnellaktionen</CardTitle>
          <CardDescription>
            Häufig verwendete Funktionen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <FileText className="h-8 w-8 mb-2 text-blue-600" />
              <span className="text-sm font-medium">Dokument hochladen</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <GitBranch className="h-8 w-8 mb-2 text-green-600" />
              <span className="text-sm font-medium">Workflow starten</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <TrendingUp className="h-8 w-8 mb-2 text-purple-600" />
              <span className="text-sm font-medium">Bericht erstellen</span>
            </div>
            <div className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <Calendar className="h-8 w-8 mb-2 text-orange-600" />
              <span className="text-sm font-medium">Termin planen</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}