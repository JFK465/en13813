'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Eye,
  Plus,
  Save,
  FileText,
  Download,
  Play,
  CheckSquare,
  ClipboardList,
} from 'lucide-react';
import { AuditService } from '@/modules/en13813/services/audit.service';
import { AuditReportGeneratorService } from '@/modules/en13813/services/audit-report-generator.service';
import type {
  Audit,
  AuditChecklistItem,
  AuditFinding,
  AuditCategory
} from '@/modules/en13813/types/audit.types';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const auditService = new AuditService();
const reportGenerator = new AuditReportGeneratorService();

const categoryLabels: Record<AuditCategory, string> = {
  fpc_general: 'FPC Allgemein (§6.3.1)',
  process_control: 'Prozesssteuerung (§6.3.2)',
  incoming_materials: 'Eingangsstoffe (§6.3.2.1)',
  production_process: 'Produktionsprozess (§6.3.2.2)',
  screed_material_tests: 'Estrichmaterial-Prüfungen (§6.3.3.1)',
  alternative_tests: 'Alternative Prüfverfahren (§6.3.3.2)',
  test_equipment: 'Prüfmittel (§6.3.3.3)',
  traceability: 'Rückverfolgbarkeit (§6.3.4)',
  labelling: 'Kennzeichnung (§6.3.5)',
  records: 'Aufzeichnungen (§6.3.6)',
  itt_properties: 'ITT/Produkteigenschaften',
  conformity_assessment: 'Konformitätsbewertung (Clause 9)',
  designation_marking: 'Bezeichnung & Kennzeichnung (Clause 7-8)',
  avcp_ce: 'CE/AVCP (Annex ZA)'
};

export default function AuditDetailPage() {
  const params = useParams();
  const router = useRouter();
  const auditId = params.id as string;

  const [audit, setAudit] = useState<Audit | null>(null);
  const [checklist, setChecklist] = useState<AuditChecklistItem[]>([]);
  const [findings, setFindings] = useState<AuditFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('checklist');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newFinding, setNewFinding] = useState({
    description: '',
    finding_type: 'nonconformity' as const,
    severity: 'minor' as const,
    affected_process: '',
    corrective_action_description: '',
    responsible_person: '',
    target_date: ''
  });

  useEffect(() => {
    loadAuditData();
  }, [auditId]);

  const loadAuditData = async () => {
    try {
      setLoading(true);
      const [auditData, checklistData, findingsData] = await Promise.all([
        auditService.getAudit(auditId),
        auditService.getAuditChecklist(auditId),
        auditService.getAuditFindings(auditId)
      ]);

      setAudit(auditData);
      setChecklist(checklistData);
      setFindings(findingsData);
    } catch (error) {
      console.error('Error loading audit:', error);
      toast.error('Fehler beim Laden des Audits');
    } finally {
      setLoading(false);
    }
  };

  const handleChecklistUpdate = async (item: AuditChecklistItem, updates: Partial<AuditChecklistItem>) => {
    try {
      setSaving(true);
      const updated = await auditService.updateChecklistItem(item.id, updates);
      setChecklist(prev => prev.map(i => i.id === item.id ? { ...i, ...updates } : i));
      toast.success('Checklist-Eintrag aktualisiert');
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating checklist:', error);
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setSaving(false);
    }
  };

  const handleStartAudit = async () => {
    if (!audit) return;

    try {
      setSaving(true);
      const updated = await auditService.updateAuditStatus(audit.id, 'in_progress');
      setAudit(updated);
      toast.success('Audit gestartet');
    } catch (error) {
      console.error('Error starting audit:', error);
      toast.error('Fehler beim Starten des Audits');
    } finally {
      setSaving(false);
    }
  };

  const handleCompleteAudit = async () => {
    if (!audit) return;

    const summary = `Audit abgeschlossen am ${format(new Date(), 'dd.MM.yyyy')}.
    ${checklist.filter(i => i.status === 'nonconform').length} Abweichungen festgestellt.`;

    try {
      setSaving(true);
      const updated = await auditService.updateAuditStatus(audit.id, 'completed', summary);
      setAudit(updated);
      toast.success('Audit erfolgreich abgeschlossen');
    } catch (error) {
      console.error('Error completing audit:', error);
      toast.error('Fehler beim Abschließen des Audits');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateFinding = async () => {
    try {
      setSaving(true);
      const finding = await auditService.createFinding({
        audit_id: auditId,
        ...newFinding,
        finding_number: '',
        status: 'open',
        corrective_action_required: true
      });
      setFindings(prev => [...prev, finding]);
      setNewFinding({
        description: '',
        finding_type: 'nonconformity',
        severity: 'minor',
        affected_process: '',
        corrective_action_description: '',
        responsible_person: '',
        target_date: ''
      });
      toast.success('Finding erfasst');
    } catch (error) {
      console.error('Error creating finding:', error);
      toast.error('Fehler beim Erfassen des Findings');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!audit) return;

    try {
      setSaving(true);
      await reportGenerator.downloadAuditReport(audit.id, audit.audit_number);
      toast.success('Report erfolgreich heruntergeladen');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Fehler beim Herunterladen des Reports');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: AuditChecklistItem['status']) => {
    switch (status) {
      case 'conform':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'nonconform':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'observation':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'not_applicable':
        return <Eye className="h-4 w-4 text-gray-400" />;
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

  if (loading || !audit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Lade Audit-Daten...</p>
        </div>
      </div>
    );
  }

  const checklistByCategory = checklist.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<AuditCategory, AuditChecklistItem[]>);

  const statistics = {
    totalItems: checklist.length,
    conformItems: checklist.filter(i => i.status === 'conform').length,
    nonconformItems: checklist.filter(i => i.status === 'nonconform').length,
    observationItems: checklist.filter(i => i.status === 'observation').length,
    notApplicableItems: checklist.filter(i => i.status === 'not_applicable').length,
    complianceScore: checklist.length > 0
      ? Math.round((checklist.filter(i => i.status === 'conform').length / checklist.length) * 100)
      : 0
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/en13813/audit')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{audit.audit_number}</h1>
            <p className="text-muted-foreground">
              {format(new Date(audit.audit_date), 'PPP', { locale: de })}
            </p>
          </div>
          <Badge className={getStatusColor(audit.status)}>
            {audit.status === 'planned' && 'Geplant'}
            {audit.status === 'in_progress' && 'In Bearbeitung'}
            {audit.status === 'completed' && 'Abgeschlossen'}
            {audit.status === 'closed' && 'Geschlossen'}
          </Badge>
        </div>
        <div className="flex gap-2">
          {audit.status === 'planned' && (
            <Button onClick={handleStartAudit} disabled={saving}>
              <Play className="mr-2 h-4 w-4" />
              Audit starten
            </Button>
          )}
          {audit.status === 'in_progress' && (
            <Button onClick={handleCompleteAudit} disabled={saving}>
              <CheckSquare className="mr-2 h-4 w-4" />
              Audit abschließen
            </Button>
          )}
          {audit.status === 'completed' && (
            <Button variant="outline" onClick={handleDownloadReport} disabled={saving}>
              <Download className="mr-2 h-4 w-4" />
              Report herunterladen
            </Button>
          )}
        </div>
      </div>

      {/* Audit Info */}
      <Card>
        <CardHeader>
          <CardTitle>Audit-Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Auditor</p>
              <p className="mt-1">{audit.auditor_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Typ</p>
              <p className="mt-1">
                {audit.audit_type === 'internal' && 'Internes Audit'}
                {audit.audit_type === 'external' && 'Externes Audit'}
                {audit.audit_type === 'certification' && 'Zertifizierungsaudit'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Umfang</p>
              <p className="mt-1">{audit.audit_scope}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {audit.status !== 'planned' && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.complianceScore}%</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Konform</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.conformItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Abweichungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{statistics.nonconformItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Beobachtungen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{statistics.observationItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{findings.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checklist">
            <ClipboardList className="mr-2 h-4 w-4" />
            Checkliste
          </TabsTrigger>
          <TabsTrigger value="findings">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Findings ({findings.length})
          </TabsTrigger>
          <TabsTrigger value="summary">
            <FileText className="mr-2 h-4 w-4" />
            Zusammenfassung
          </TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-6">
          {Object.entries(checklistByCategory).map(([category, items]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {categoryLabels[category as AuditCategory]}
                </CardTitle>
                <CardDescription>
                  {items.filter(i => i.status === 'conform').length} von {items.length} konform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Abschnitt</TableHead>
                      <TableHead>Anforderung</TableHead>
                      <TableHead className="w-[150px]">Status</TableHead>
                      <TableHead>Nachweis/Finding</TableHead>
                      <TableHead className="w-[100px]">Aktion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-sm">
                          {item.section}
                        </TableCell>
                        <TableCell>{item.requirement}</TableCell>
                        <TableCell>
                          {editingItem === item.id ? (
                            <Select
                              value={item.status}
                              onValueChange={(value) => handleChecklistUpdate(item, { status: value as any })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="conform">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Konform
                                  </div>
                                </SelectItem>
                                <SelectItem value="nonconform">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    Abweichung
                                  </div>
                                </SelectItem>
                                <SelectItem value="observation">
                                  <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                    Beobachtung
                                  </div>
                                </SelectItem>
                                <SelectItem value="not_applicable">
                                  <div className="flex items-center gap-2">
                                    <Eye className="h-4 w-4 text-gray-400" />
                                    N/A
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              {getStatusIcon(item.status)}
                              <span className="text-sm">
                                {item.status === 'conform' && 'Konform'}
                                {item.status === 'nonconform' && 'Abweichung'}
                                {item.status === 'observation' && 'Beobachtung'}
                                {item.status === 'not_applicable' && 'N/A'}
                              </span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingItem === item.id ? (
                            <div className="space-y-2">
                              <Input
                                placeholder="Nachweis"
                                value={item.evidence || ''}
                                onChange={(e) => handleChecklistUpdate(item, { evidence: e.target.value })}
                              />
                              <Textarea
                                placeholder="Finding/Bemerkung"
                                value={item.finding || ''}
                                onChange={(e) => handleChecklistUpdate(item, { finding: e.target.value })}
                                className="min-h-[60px]"
                              />
                            </div>
                          ) : (
                            <div className="text-sm">
                              {item.evidence && (
                                <p className="text-muted-foreground">{item.evidence}</p>
                              )}
                              {item.finding && (
                                <p className="mt-1">{item.finding}</p>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {audit.status === 'in_progress' && (
                            editingItem === item.id ? (
                              <Button
                                size="sm"
                                onClick={() => setEditingItem(null)}
                                disabled={saving}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingItem(item.id)}
                              >
                                Bearbeiten
                              </Button>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="findings" className="space-y-6">
          {audit.status === 'in_progress' && (
            <Card>
              <CardHeader>
                <CardTitle>Neues Finding erfassen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Typ</label>
                    <Select
                      value={newFinding.finding_type}
                      onValueChange={(value: any) => setNewFinding(prev => ({ ...prev, finding_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nonconformity">Abweichung</SelectItem>
                        <SelectItem value="observation">Beobachtung</SelectItem>
                        <SelectItem value="opportunity">Verbesserungspotential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Schweregrad</label>
                    <Select
                      value={newFinding.severity}
                      onValueChange={(value: any) => setNewFinding(prev => ({ ...prev, severity: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Kritisch</SelectItem>
                        <SelectItem value="major">Schwerwiegend</SelectItem>
                        <SelectItem value="minor">Geringfügig</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Beschreibung</label>
                  <Textarea
                    placeholder="Detaillierte Beschreibung des Findings..."
                    value={newFinding.description}
                    onChange={(e) => setNewFinding(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Betroffener Prozess</label>
                    <Input
                      placeholder="z.B. Rohstoffkontrolle"
                      value={newFinding.affected_process}
                      onChange={(e) => setNewFinding(prev => ({ ...prev, affected_process: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Verantwortliche Person</label>
                    <Input
                      placeholder="Name der verantwortlichen Person"
                      value={newFinding.responsible_person}
                      onChange={(e) => setNewFinding(prev => ({ ...prev, responsible_person: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Korrekturmaßnahme</label>
                  <Textarea
                    placeholder="Beschreibung der geplanten Korrekturmaßnahme..."
                    value={newFinding.corrective_action_description}
                    onChange={(e) => setNewFinding(prev => ({ ...prev, corrective_action_description: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Zieldatum</label>
                  <Input
                    type="date"
                    value={newFinding.target_date}
                    onChange={(e) => setNewFinding(prev => ({ ...prev, target_date: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreateFinding} disabled={!newFinding.description || saving}>
                  <Plus className="mr-2 h-4 w-4" />
                  Finding hinzufügen
                </Button>
              </CardContent>
            </Card>
          )}

          {findings.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Erfasste Findings</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nr.</TableHead>
                      <TableHead>Typ</TableHead>
                      <TableHead>Schweregrad</TableHead>
                      <TableHead>Beschreibung</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Zieldatum</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {findings.map((finding) => (
                      <TableRow key={finding.id}>
                        <TableCell className="font-medium">
                          {finding.finding_number}
                        </TableCell>
                        <TableCell>
                          {finding.finding_type === 'nonconformity' && 'Abweichung'}
                          {finding.finding_type === 'observation' && 'Beobachtung'}
                          {finding.finding_type === 'opportunity' && 'Verbesserung'}
                        </TableCell>
                        <TableCell>
                          {finding.severity && (
                            <Badge
                              className={cn(
                                finding.severity === 'critical' && 'bg-red-100 text-red-800',
                                finding.severity === 'major' && 'bg-orange-100 text-orange-800',
                                finding.severity === 'minor' && 'bg-yellow-100 text-yellow-800'
                              )}
                            >
                              {finding.severity === 'critical' && 'Kritisch'}
                              {finding.severity === 'major' && 'Schwerwiegend'}
                              {finding.severity === 'minor' && 'Geringfügig'}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="max-w-md">
                          <p className="truncate">{finding.description}</p>
                          {finding.corrective_action_description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Maßnahme: {finding.corrective_action_description}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              finding.status === 'open' && 'bg-blue-100 text-blue-800',
                              finding.status === 'in_progress' && 'bg-yellow-100 text-yellow-800',
                              finding.status === 'closed' && 'bg-green-100 text-green-800',
                              finding.status === 'overdue' && 'bg-red-100 text-red-800'
                            )}
                          >
                            {finding.status === 'open' && 'Offen'}
                            {finding.status === 'in_progress' && 'In Bearbeitung'}
                            {finding.status === 'closed' && 'Geschlossen'}
                            {finding.status === 'overdue' && 'Überfällig'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {finding.target_date && (
                            <span className="text-sm">
                              {format(new Date(finding.target_date), 'dd.MM.yyyy')}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Keine Findings erfasst</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="summary">
          {audit.status === 'completed' ? (
            <Card>
              <CardHeader>
                <CardTitle>Audit-Zusammenfassung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Ergebnis</h3>
                  <p>{audit.findings_summary}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Statistik</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Geprüfte Punkte</p>
                      <p className="text-2xl font-bold">{statistics.totalItems}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Abweichungen</p>
                      <p className="text-2xl font-bold text-red-600">
                        {audit.nonconformities_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Beobachtungen</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {audit.observations_count || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Verbesserungen</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {audit.opportunities_count || 0}
                      </p>
                    </div>
                  </div>
                </div>
                {audit.corrective_actions_required && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h3 className="font-semibold text-orange-900 mb-2">
                      Korrekturmaßnahmen erforderlich
                    </h3>
                    <p className="text-sm text-orange-800">
                      Aufgrund der festgestellten Abweichungen sind Korrekturmaßnahmen erforderlich.
                      Bitte stellen Sie sicher, dass alle Findings bearbeitet und geschlossen werden.
                    </p>
                  </div>
                )}
                {audit.next_audit_date && (
                  <div>
                    <h3 className="font-semibold mb-2">Nächstes Audit</h3>
                    <p>
                      Geplant für: {format(new Date(audit.next_audit_date), 'PPP', { locale: de })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Die Zusammenfassung ist erst nach Abschluss des Audits verfügbar
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}