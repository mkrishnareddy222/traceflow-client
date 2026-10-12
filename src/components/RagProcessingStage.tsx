import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ProcessingStep, UploadedFile, WorkspaceTab } from '../types/chat';
import { HeaderBar } from './HeaderBar';

interface RagProcessingStageProps {
  files: UploadedFile[];
  processingStep: ProcessingStep;
  currentFileName: string | null;
  uploadError: string | null;
  uploadAttempts: number;
  failedUploadCount: number;
  successfulUploadCount: number;
  totalUploadDuration: number;
  provider: string;
  theme: 'light' | 'dark';
  isMobile: boolean;
  onToggleMenu: () => void;
  onNewChat: () => void;
  onTabChange: (tab: WorkspaceTab) => void;
}

const pipelineSteps = ['Uploaded', 'Parsed', 'Chunked', 'Embedded', 'Indexed'];

const formatDuration = (seconds: number) => {
  if (!seconds) return '—';
  return seconds < 60 ? `${Math.round(seconds)}s` : `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
};

const formatUploadTime = (timestamp?: string) => {
  if (!timestamp) return 'Completed';
  return `Completed at ${new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
};

export const RagProcessingStage: React.FC<RagProcessingStageProps> = ({
  files,
  processingStep,
  currentFileName,
  uploadError,
  uploadAttempts,
  failedUploadCount,
  successfulUploadCount,
  totalUploadDuration,
  provider,
  theme,
  isMobile,
  onToggleMenu,
  onNewChat,
  onTabChange,
}) => {
  const isDark = theme === 'dark';
  const colors = {
    background: isDark ? '#090a0c' : '#ffffff',
    panel: isDark ? '#101215' : '#f9fafb',
    border: isDark ? '#24272c' : '#e4e4e7',
    text: isDark ? '#f4f4f5' : '#18181b',
    muted: isDark ? '#858991' : '#71717a',
    faint: isDark ? '#50545c' : '#9ca3af',
  };
  const processing = processingStep !== 'IDLE';
  const latestFile = files.length > 0 ? files[files.length - 1] : undefined;
  const displayedName = processing ? currentFileName : latestFile?.name;
  const completed = !processing && !!latestFile;
  const successRate = uploadAttempts > 0
    ? `${Math.round((successfulUploadCount / uploadAttempts) * 1000) / 10}%`
    : '—';
  const averageDuration = successfulUploadCount > 0
    ? formatDuration(totalUploadDuration / successfulUploadCount)
    : '—';
  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <HeaderBar
        provider={provider}
        isMobile={isMobile}
        onToggleMenu={onToggleMenu}
        onNewChat={onNewChat}
        theme={theme}
        activeTab="processing"
        onTabChange={onTabChange}
      />
      <ScrollView
        contentContainerStyle={[styles.content, isMobile && styles.contentMobile]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.headingRow, isMobile && styles.headingRowMobile]}>
          <View style={styles.heading}>
            <Text style={styles.eyebrow}>INGESTION PIPELINE</Text>
            <Text style={[styles.title, { color: colors.text }]}>Processing activity</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Follow documents through parsing, chunking, embedding, and indexing.
            </Text>
          </View>
          <View style={[styles.statusPill, { borderColor: colors.border }]}>
            {processing && <ActivityIndicator size="small" color="#10b981" style={styles.statusSpinner} />}
            {!processing && <View style={[styles.statusDot, { backgroundColor: uploadError ? '#ef4444' : '#10b981' }]} />}
            <Text style={[styles.statusText, { color: uploadError ? '#ef4444' : '#10b981' }]}>
              {processing ? 'IN PROGRESS' : uploadError ? 'FAILED' : completed ? 'COMPLETE' : 'READY'}
            </Text>
          </View>
        </View>

        <View style={[styles.infoBanner, { backgroundColor: isDark ? '#091410' : '#f0fdf8', borderColor: isDark ? '#123b2c' : '#c7f3e2' }]}>
          <View style={styles.infoIcon}><Text style={styles.infoIconText}>i</Text></View>
          <View style={styles.infoCopy}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>Why processing is required</Text>
            <Text style={[styles.infoDescription, { color: colors.muted }]}>
              Uploaded files are parsed, split into searchable chunks, converted to embeddings, and stored in the vector index.
              {processing ? ' The server is processing the selected document.' : ' Completed jobs are shown below.'}
            </Text>
          </View>
        </View>

        <View style={[styles.metrics, isMobile && styles.metricsMobile]}>
          <Metric label="QUEUE" value={processing ? '1' : '0'} caption={processing ? 'Job in progress' : 'Jobs waiting'} colors={colors} />
          <Metric label="SUCCESS RATE" value={successRate} caption={`${successfulUploadCount} successful uploads`} colors={colors} />
          <Metric label="AVG. DURATION" value={averageDuration} caption="Per successful upload" colors={colors} />
          <Metric label="FAILED JOBS" value={String(failedUploadCount)} caption="Requires attention" colors={colors} />
        </View>

        {uploadError && (
          <View accessibilityRole="alert" style={[styles.errorBanner, { borderColor: '#ef4444' }]}>
            <Text style={styles.errorTitle}>The latest upload failed</Text>
            <Text style={[styles.errorDescription, { color: colors.muted }]}>{uploadError}</Text>
          </View>
        )}

        {displayedName ? (
          <View style={[styles.jobCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <View style={styles.jobHeading}>
              <View style={[styles.fileIcon, { backgroundColor: isDark ? '#10251e' : '#e7f9f1' }]}>
                <Text style={styles.fileIconText}>▤</Text>
              </View>
              <View style={styles.fileDetails}>
                <Text numberOfLines={1} style={[styles.fileName, { color: colors.text }]}>{displayedName}</Text>
                <Text style={[styles.fileDescription, { color: colors.muted }]}>
                  {processing
                    ? 'Upload received · Processing on server'
                    : `${latestFile?.size ?? 'Uploaded'} · ${latestFile?.chunkCount ?? '—'} chunks · ${formatUploadTime(latestFile?.uploadedAt)}`}
                </Text>
              </View>
              <Text style={styles.progressLabel}>{completed ? '100%' : processing ? 'PROCESSING' : ''}</Text>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, completed && styles.progressFillComplete]} />
            </View>

            <View style={styles.pipeline}>
              {pipelineSteps.map((step, index) => {
                const stepComplete = completed;
                const activeIndex = processing ? (processingStep === 'TRANSMITTING' ? 0 : 1) : -1;
                const stepActive = processing && index === activeIndex;
                return (
                  <View key={step} style={styles.pipelineStep}>
                    <View style={[
                      styles.stepCircle,
                      stepComplete && styles.stepCircleComplete,
                      stepActive && styles.stepCircleActive,
                      !stepComplete && !stepActive && { borderColor: colors.border },
                    ]}>
                      <Text style={[styles.stepIcon, !stepComplete && !stepActive && { color: colors.faint }]}>
                        {stepComplete ? '✓' : stepActive ? '•' : String(index + 1)}
                      </Text>
                    </View>
                    <Text style={[styles.stepName, { color: stepComplete || stepActive ? colors.text : colors.muted }]}>{step}</Text>
                    <Text style={[styles.stepStatus, { color: stepComplete ? '#10b981' : colors.faint }]}>
                      {stepComplete ? 'Complete' : stepActive ? 'In progress' : 'Pending'}
                    </Text>
                  </View>
                );
              })}
            </View>

            {!processing && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => onTabChange('chat')}
                style={[styles.chatButton, { borderColor: isDark ? '#14543e' : '#a7e8ce' }]}
              >
                <Text style={styles.chatButtonText}>Test in grounded chat  ›</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No indexing activity yet</Text>
            <Text style={[styles.emptyDescription, { color: colors.muted }]}>
              Upload a document from Knowledge to see its processing status here.
            </Text>
          </View>
        )}

        <View style={[styles.history, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <View style={[styles.historyHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.historyTitle, { color: colors.text }]}>Job history</Text>
            <Text style={[styles.historyPeriod, { color: colors.muted }]}>This session</Text>
          </View>
          {files.length > 0 ? [...files].reverse().map((file) => (
            <View key={file.id} style={[styles.historyRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.historyFileIcon, { backgroundColor: isDark ? '#10251e' : '#e7f9f1' }]}>
                <Text style={styles.fileIconText}>▤</Text>
              </View>
              <View style={styles.fileDetails}>
                <Text numberOfLines={1} style={[styles.fileName, { color: colors.text }]}>{file.name}</Text>
                <Text style={[styles.fileDescription, { color: colors.muted }]}>
                  {file.chunkCount !== undefined ? `${file.chunkCount} chunks` : 'Chunk count not provided by API'}
                  {` · ${provider} embedding`}
                </Text>
              </View>
              <Text style={styles.completeStatus}>✓ Indexed</Text>
              <Text style={[styles.historyTime, { color: colors.muted }]}>
                {file.uploadedAt
                  ? new Date(file.uploadedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                  : '—'}
              </Text>
            </View>
          )) : (
            <View style={styles.historyEmpty}>
              <Text style={[styles.fileDescription, { color: colors.muted }]}>Completed and failed upload jobs will appear here.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

interface MetricProps {
  label: string;
  value: string;
  caption: string;
  colors: { panel: string; border: string; text: string; muted: string };
}

const Metric: React.FC<MetricProps> = ({ label, value, caption, colors }) => (
  <View style={[styles.metric, { backgroundColor: colors.panel, borderColor: colors.border }]}>
    <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
    <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.metricCaption, { color: colors.muted }]}>{caption}</Text>
  </View>
);

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%' },
  content: { width: '100%', maxWidth: 1050, alignSelf: 'center', paddingHorizontal: 32, paddingTop: 42, paddingBottom: 40 },
  contentMobile: { paddingHorizontal: 18, paddingTop: 26 },
  headingRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 },
  headingRowMobile: { alignItems: 'flex-start', flexDirection: 'column', gap: 12 },
  heading: { flex: 1, minWidth: 0 },
  eyebrow: { color: '#10b981', fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 9 },
  title: { fontSize: 23, fontWeight: '700', letterSpacing: -0.6 },
  subtitle: { fontSize: 10, marginTop: 7 },
  statusPill: { minHeight: 29, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, borderWidth: 1, borderRadius: 7 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusSpinner: { marginRight: 6 },
  statusText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },
  infoBanner: { flexDirection: 'row', alignItems: 'center', padding: 13, borderWidth: 1, borderRadius: 10, marginBottom: 12 },
  infoIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(16,185,129,0.12)', marginRight: 10 },
  infoIconText: { color: '#10b981', fontSize: 13, fontWeight: '700' },
  infoCopy: { flex: 1 },
  infoTitle: { fontSize: 9, fontWeight: '700', marginBottom: 4 },
  infoDescription: { fontSize: 8, lineHeight: 13 },
  metrics: { flexDirection: 'row', marginBottom: 12 },
  metricsMobile: { flexWrap: 'wrap', gap: 8 },
  metric: { flex: 1, minWidth: 120, minHeight: 66, justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 9, borderWidth: 1, marginRight: -1 },
  metricLabel: { fontSize: 7, letterSpacing: 0.35 },
  metricValue: { fontSize: 14, fontWeight: '700', marginTop: 5 },
  metricCaption: { fontSize: 7, marginTop: 3 },
  errorBanner: { padding: 12, borderWidth: 1, borderRadius: 9, marginBottom: 12 },
  errorTitle: { color: '#ef4444', fontSize: 9, fontWeight: '700', marginBottom: 5 },
  errorDescription: { fontSize: 8, lineHeight: 13 },
  jobCard: { minHeight: 270, padding: 17, borderWidth: 1, borderRadius: 11, marginBottom: 12 },
  jobHeading: { flexDirection: 'row', alignItems: 'center' },
  fileIcon: { width: 34, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  fileIconText: { color: '#10b981', fontSize: 14 },
  fileDetails: { flex: 1, minWidth: 0 },
  fileName: { fontSize: 10, fontWeight: '700' },
  fileDescription: { fontSize: 8, marginTop: 4 },
  progressLabel: { color: '#10b981', fontSize: 10, fontWeight: '700', marginLeft: 10 },
  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: 18 },
  progressFill: { width: 0, height: '100%', backgroundColor: '#10b981' },
  progressFillComplete: { width: '100%' },
  pipeline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginHorizontal: -4 },
  pipelineStep: { flex: 1, alignItems: 'center', minWidth: 0 },
  stepCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', marginBottom: 7 },
  stepCircleComplete: { borderColor: '#10b981', backgroundColor: '#10b981' },
  stepCircleActive: { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)' },
  stepIcon: { color: '#071b14', fontSize: 12, fontWeight: '700' },
  stepName: { fontSize: 8, fontWeight: '600' },
  stepStatus: { fontSize: 7, marginTop: 3 },
  chatButton: { minHeight: 32, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 13, borderWidth: 1, borderRadius: 8, marginTop: 23 },
  chatButtonText: { color: '#10b981', fontSize: 8, fontWeight: '600' },
  emptyCard: { minHeight: 180, alignItems: 'center', justifyContent: 'center', padding: 22, borderWidth: 1, borderRadius: 11, marginBottom: 12 },
  emptyTitle: { fontSize: 11, fontWeight: '700' },
  emptyDescription: { fontSize: 9, textAlign: 'center', marginTop: 6 },
  history: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  historyHeader: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, borderBottomWidth: 1 },
  historyTitle: { fontSize: 10, fontWeight: '700' },
  historyPeriod: { fontSize: 7 },
  historyRow: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 1 },
  historyFileIcon: { width: 28, height: 28, borderRadius: 7, alignItems: 'center', justifyContent: 'center', marginRight: 9 },
  completeStatus: { color: '#10b981', fontSize: 7, fontWeight: '700', marginHorizontal: 10 },
  historyTime: { fontSize: 7 },
  historyEmpty: { padding: 14 },
});
