'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  ClipboardCheck,
  Plus,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Download,
  TrendingUp,
} from 'lucide-react';
import { AuditService } from '@/modules/en13813/services/audit.service';
import { AuditReportGeneratorService } from '@/modules/en13813/services/audit-report-generator.service';
import { useCurrentTenant } from '@/hooks/use-current-tenant';
import type { Audit, AuditFinding } from '@/modules/en13813/types/audit.types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const auditService = new AuditService();
const reportGenerator = new AuditReportGeneratorService();

export default function AuditPage() {
  const { currentTenant, loading: tenantLoading } = useCurrentTenant();
  const [audits, setAudits] = useState<Audit[]>([]);
  const [upcomingAudits, setUpcomingAudits] = useState<Audit[]>([]);
  const [overdueFindings, setOverdueFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalAudits: 0,
    completedAudits: 0,
    plannedAudits: 0,
    openFindings: 0,
    complianceScore: 0
  });

  useEffect(() => {
    console.log('🔍 AuditPage - currentTenant:', currentTenant);
    console.log('🔍 AuditPage - tenantLoading:', tenantLoading);

    // For demo mode, use demo tenant ID
    const tenantId = currentTenant?.id || 'demo-tenant-id';

    if (!tenantLoading && tenantId) {
      loadData(tenantId);
    } else if (!tenantLoading && !tenantId) {
      setLoading(false);
      setError('Kein Mandant gefunden');
    }
  }, [currentTenant?.id, tenantLoading]);

  const loadData = async (tenantId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Loading audit data for tenant:', tenantId);

      const [allAudits, upcoming, overdue] = await Promise.all([
        auditService.getAudits(tenantId),
        auditService.getUpcomingAudits(tenantId, 30),
        auditService.getOverdueFindings(tenantId)
      ]);

      setAudits(allAudits);
      setUpcomingAudits(upcoming);
      setOverdueFindings(overdue);

      // Calculate statistics
      const completed = allAudits.filter(a => a.status === 'completed');
      const totalNonconformities = completed.reduce(
        (sum, a) => sum + (a.nonconformities_count || 0),
        0
      );
      const totalItems = completed.length * 30; // Assuming ~30 checklist items per audit
      const complianceScore = totalItems > 0
        ? Math.round(((totalItems - totalNonconformities) / totalItems) * 100)
        : 100;

      setStats({
        totalAudits: allAudits.length,
        completedAudits: completed.length,
        plannedAudits: allAudits.filter(a => a.status === 'planned').length,
        openFindings: overdue.length,
        complianceScore
      });

      console.log('✅ Audit data loaded successfully:', {
        audits: allAudits.length,
        upcoming: upcoming.length,
        overdue: overdue.length
      });
    } catch (error) {
      console.error('❌ Error loading audit data:', error);
      setError('Fehler beim Laden der Audit-Daten');
      // Set empty data on error
      setAudits([]);
      setUpcomingAudits([]);
      setOverdueFindings([]);
      setStats({
        totalAudits: 0,
        completedAudits: 0,
        plannedAudits: 0,
        openFindings: 0,
        complianceScore: 100
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Audit['status']) => {
    const colors = {
      planned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    return colors[status];
  };

  const getTypeLabel = (type: Audit['audit_type']) => {
    const labels = {
      internal: 'Intern',
      external: 'Extern',
      certification: 'Zertifizierung'
    };
    return labels[type];
  };

  const getSeverityColor = (severity?: string) => {
    const colors = {
      critical: 'text-red-600',
      major: 'text-orange-600',
      minor: 'text-yellow-600'
    };
    return severity ? colors[severity as keyof typeof colors] : '';
  };

  const handleDownloadReport = async (audit: Audit) => {
    try {
      await reportGenerator.downloadAuditReport(audit.id, audit.audit_number);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  if (loading || tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Lade Audit-Daten...</p>
        </div>
      </div>
    );
  }

  if (error && !audits.length) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Die Audit-Funktionalität wird initialisiert. Bitte versuchen Sie es später erneut.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Management</h1>
          <p className="text-muted-foreground mt-2">
            EN 13813 konforme Audits und Qualitätskontrolle
          </p>
        </div>
        <Link href="/en13813/audit/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Neues Audit
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamt Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAudits}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Abgeschlossen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.completedAudits}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Geplant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.plannedAudits}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Offene Findings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.openFindings}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Compliance Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{stats.complianceScore}%</div>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {(upcomingAudits.length > 0 || overdueFindings.length > 0) && (
        <div className="space-y-4">
          {upcomingAudits.length > 0 && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Calendar className="h-5 w-5" />
                  Anstehende Audits (nächste 30 Tage)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {upcomingAudits.map((audit) => (
                    <div
                      key={audit.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{audit.audit_number}</Badge>
                        <span className="font-medium">{audit.audit_scope}</span>
                        <Badge variant="secondary">
                          {getTypeLabel(audit.audit_type)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(audit.audit_date), 'dd.MM.yyyy', { locale: de })}
                        </span>
                        <Link href={`/en13813/audit/${audit.id}`}>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {overdueFindings.length > 0 && (
            <Card className="border-orange-200 bg-orange-50/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <AlertTriangle className="h-5 w-5" />
                  Überfällige Maßnahmen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {overdueFindings.slice(0, 5).map((finding) => (
                    <div
                      key={finding.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive">{finding.finding_number}</Badge>
                        <span className="font-medium">{finding.description}</span>
                        {finding.severity && (
                          <span className={cn('text-sm font-medium', getSeverityColor(finding.severity))}>
                            {finding.severity.toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Fällig: {format(new Date(finding.target_date!), 'dd.MM.yyyy', { locale: de })}</span>
                      </div>
                    </div>
                  ))}
                  {overdueFindings.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      ... und {overdueFindings.length - 5} weitere
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Audits Table */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Alle Audits</TabsTrigger>
          <TabsTrigger value="planned">Geplant</TabsTrigger>
          <TabsTrigger value="in_progress">In Bearbeitung</TabsTrigger>
          <TabsTrigger value="completed">Abgeschlossen</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit-Übersicht</CardTitle>
              <CardDescription>
                Alle durchgeführten und geplanten Audits nach EN 13813
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Audit-Nr.</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Auditor</TableHead>
                    <TableHead>Umfang</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Findings</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell className="font-medium">
                        {audit.audit_number}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getTypeLabel(audit.audit_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(audit.audit_date), 'dd.MM.yyyy', { locale: de })}
                      </TableCell>
                      <TableCell>{audit.auditor_name}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {audit.audit_scope}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(audit.status)}>
                          {audit.status === 'planned' && 'Geplant'}
                          {audit.status === 'in_progress' && 'In Bearbeitung'}
                          {audit.status === 'completed' && 'Abgeschlossen'}
                          {audit.status === 'closed' && 'Geschlossen'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {audit.status === 'completed' && (
                          <div className="flex items-center gap-2">
                            {audit.nonconformities_count! > 0 && (
                              <span className="flex items-center gap-1">
                                <XCircle className="h-4 w-4 text-red-500" />
                                {audit.nonconformities_count}
                              </span>
                            )}
                            {audit.observations_count! > 0 && (
                              <span className="flex items-center gap-1">
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                                {audit.observations_count}
                              </span>
                            )}
                            {audit.nonconformities_count === 0 && audit.observations_count === 0 && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Link href={`/en13813/audit/${audit.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          {audit.status === 'completed' && (
                            <Button size="sm" variant="outline" onClick={() => handleDownloadReport(audit)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planned">
          <AuditTable
            audits={audits.filter(a => a.status === 'planned')}
            getTypeLabel={getTypeLabel}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="in_progress">
          <AuditTable
            audits={audits.filter(a => a.status === 'in_progress')}
            getTypeLabel={getTypeLabel}
            getStatusColor={getStatusColor}
          />
        </TabsContent>

        <TabsContent value="completed">
          <AuditTable
            audits={audits.filter(a => a.status === 'completed')}
            getTypeLabel={getTypeLabel}
            getStatusColor={getStatusColor}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AuditTable({
  audits,
  getTypeLabel,
  getStatusColor
}: {
  audits: Audit[];
  getTypeLabel: (type: Audit['audit_type']) => string;
  getStatusColor: (status: Audit['status']) => string;
}) {
  if (audits.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <ClipboardCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Keine Audits in dieser Kategorie</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Audit-Nr.</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Auditor</TableHead>
              <TableHead>Umfang</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="font-medium">
                  {audit.audit_number}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {getTypeLabel(audit.audit_type)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(audit.audit_date), 'dd.MM.yyyy', { locale: de })}
                </TableCell>
                <TableCell>{audit.auditor_name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {audit.audit_scope}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(audit.status)}>
                    {audit.status === 'planned' && 'Geplant'}
                    {audit.status === 'in_progress' && 'In Bearbeitung'}
                    {audit.status === 'completed' && 'Abgeschlossen'}
                    {audit.status === 'closed' && 'Geschlossen'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link href={`/en13813/audit/${audit.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}