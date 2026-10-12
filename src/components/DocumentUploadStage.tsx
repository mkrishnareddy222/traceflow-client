import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { ChatPreferences, ProcessingStep, UploadedFile, WorkspaceTab } from '../types/chat';
import { HeaderBar } from './HeaderBar';
import { RagIndexSettings } from './RagIndexSettings';

interface UploadStageProps {
  preferences: ChatPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<ChatPreferences>>;
  ragProcessingStep: ProcessingStep;
  ragUploadError: string | null;
  indexedFiles: UploadedFile[];
  ingestFileWithProgress: (fileObj: { uri: string; name: string; type: string; blob?: Blob; size?: number }) => Promise<void>;
  provider: string;
  isMobile: boolean;
  isDark: boolean;
  onToggleMenu: () => void;
  onNewChat: () => void;
  onTabChange: (tab: WorkspaceTab) => void;
}

export const DocumentUploadStage: React.FC<UploadStageProps> = ({
  preferences,
  setPreferences,
  ragProcessingStep,
  ragUploadError,
  indexedFiles,
  ingestFileWithProgress,
  provider,
  isMobile,
  isDark,
  onToggleMenu,
  onNewChat,
  onTabChange,
}) => {
  const colors = {
    background: isDark ? '#090a0c' : '#ffffff',
    panel: isDark ? '#101215' : '#f9fafb',
    border: isDark ? '#24272c' : '#e4e4e7',
    text: isDark ? '#f4f4f5' : '#18181b',
    muted: isDark ? '#858991' : '#71717a',
    faint: isDark ? '#50545c' : '#9ca3af',
  };
  const embeddingLabel = preferences.ragProvider === 'gemini' ? 'Gemini' : 'Cohere';
  const embeddingKey = preferences.apiTokens[preferences.ragProvider];
  const knownChunkCount = indexedFiles.reduce((count, file) => count + (file.chunkCount ?? 0), 0);
  const chunkCountLabel = indexedFiles.length === 0 ? '0' : knownChunkCount > 0 ? String(knownChunkCount) : '—';
  const processing = ragProcessingStep !== 'IDLE';

  const handlePickDocument = async () => {
    try {
      console.info('[RAG upload] Opening document picker');
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        console.info('[RAG upload] Document selection canceled');
        return;
      }
      const selectedAsset = pickerResult.assets[0];
      console.info('[RAG upload] Selected document', {
        name: selectedAsset.name,
        size: selectedAsset.size,
        type: selectedAsset.mimeType,
      });

      await ingestFileWithProgress({
        uri: selectedAsset.uri,
        name: selectedAsset.name,
        type: selectedAsset.mimeType || 'application/pdf',
        blob: selectedAsset.file,
        size: selectedAsset.size,
      });
    } catch (error) {
      console.error('File selection issue:', error);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <HeaderBar
        provider={provider}
        isMobile={isMobile}
        onToggleMenu={onToggleMenu}
        onNewChat={onNewChat}
        theme={preferences.theme}
        activeTab="knowledge"
        onTabChange={onTabChange}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, isMobile && styles.contentMobile, isMobile && styles.contentMobileBottom]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeading}>
          <Text style={styles.eyebrow}>RAG WORKSPACE</Text>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Knowledge base</Text>
          <Text style={[styles.pageSubtitle, { color: colors.muted }]}>
            Add and configure the sources used to ground TraceFlow responses.
          </Text>
        </View>

        <View style={[styles.statsPanel, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>SOURCES</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{indexedFiles.length}</Text>
            <Text style={[styles.statCaption, { color: colors.faint }]}>Indexed documents</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>CHUNKS</Text>
            <Text style={[styles.statValue, { color: colors.text }]}>{chunkCountLabel}</Text>
            <Text style={[styles.statCaption, { color: colors.faint }]}>Available for retrieval</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.stat}>
            <Text style={[styles.statLabel, { color: colors.muted }]}>EMBEDDING</Text>
            <Text style={[styles.embeddingValue, { color: colors.text }]}>{embeddingLabel}</Text>
            <Text style={[styles.statCaption, { color: colors.faint }]}>Active vector model</Text>
          </View>
        </View>

        <View style={[styles.dashboardColumns, isMobile && styles.dashboardColumnsMobile]}>
          <View style={[styles.configPanel, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <RagIndexSettings
              preferences={preferences}
              setPreferences={setPreferences}
              isDark={isDark}
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ disabled: processing }}
              onPress={handlePickDocument}
              disabled={processing}
              style={[styles.uploadButton, isMobile && styles.uploadButtonMobile, processing && styles.disabledUploadButton]}
            >
              {processing && <ActivityIndicator size="small" color="#071b14" style={styles.uploadSpinner} />}
              {!processing && <Text style={styles.uploadIcon}>⇧</Text>}
              <Text style={styles.uploadButtonText}>
                {processing ? 'Indexing document…' : 'Upload & index document'}
              </Text>
            </TouchableOpacity>
            {!embeddingKey && (
              <Text style={[styles.apiKeyNotice, { color: colors.muted }]}>
                An embedding API key may be required by your RAG server.
              </Text>
            )}
            {ragUploadError && (
              <Text accessibilityRole="alert" style={styles.uploadError}>{ragUploadError}</Text>
            )}
          </View>

          <View style={[styles.sourcesPanel, { backgroundColor: colors.panel, borderColor: colors.border }]}>
            <View style={[styles.sourcesHeading, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.sourcesTitle, { color: colors.text }]}>Indexed sources</Text>
                <Text style={[styles.sourcesSubtitle, { color: colors.muted }]}>Documents currently available to retrieval</Text>
              </View>
              <View style={[styles.emptyBadge, { backgroundColor: isDark ? '#191c20' : '#f1f5f9' }]}>
                <Text style={[styles.emptyBadgeText, { color: colors.muted }]}>
                  {indexedFiles.length === 0 ? 'Empty' : indexedFiles.length}
                </Text>
              </View>
            </View>
            {indexedFiles.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: isDark ? '#191c20' : '#f1f5f9' }]}>
                  <Text style={[styles.emptyIconText, { color: colors.muted }]}>⇧</Text>
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No knowledge sources yet</Text>
                <Text style={[styles.emptyDescription, { color: colors.faint }]}>
                  Upload a document to begin building your knowledge base.
                </Text>
              </View>
            ) : (
              <View style={styles.sourceList}>
                {indexedFiles.map((file) => (
                  <View key={file.id} style={[styles.sourceRow, { borderBottomColor: colors.border }]}>
                    <View style={[styles.sourceFileIcon, { backgroundColor: isDark ? '#17211e' : '#ecfdf5' }]}>
                      <Text style={styles.sourceFileIconText}>▤</Text>
                    </View>
                    <View style={styles.sourceFileDetails}>
                      <Text numberOfLines={1} style={[styles.sourceFileName, { color: colors.text }]}>{file.name}</Text>
                      <Text style={[styles.sourceFileMeta, { color: colors.muted }]}>
                        {file.size}{file.chunkCount !== undefined ? ` · ${file.chunkCount} chunks` : ''}
                      </Text>
                    </View>
                    <Text style={styles.indexedStatus}>Indexed</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, width: '100%' },
  scroll: { flex: 1, width: '100%' },
  content: { width: '100%', maxWidth: 990, alignSelf: 'center', paddingTop: 42, paddingBottom: 32 },
  contentMobile: { paddingHorizontal: 14, paddingTop: 20 },
  contentMobileBottom: { paddingBottom: 52 },
  pageHeading: { marginBottom: 22 },
  eyebrow: { color: '#10b981', fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 9 },
  pageTitle: { fontSize: 23, fontWeight: '700', letterSpacing: -0.6 },
  pageSubtitle: { fontSize: 10, marginTop: 7 },
  statsPanel: { minHeight: 91, borderWidth: 1, borderRadius: 11, flexDirection: 'row', alignItems: 'stretch', marginBottom: 14 },
  stat: { flex: 1, justifyContent: 'center', paddingHorizontal: 17, paddingVertical: 12 },
  statDivider: { width: 1, marginVertical: 1 },
  statLabel: { fontSize: 7, fontWeight: '600', letterSpacing: 0.6 },
  statValue: { fontSize: 16, fontWeight: '700', marginTop: 7 },
  embeddingValue: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  statCaption: { fontSize: 7, marginTop: 5 },
  dashboardColumns: { flexDirection: 'row', alignItems: 'stretch', gap: 14 },
  dashboardColumnsMobile: { flexDirection: 'column' },
  configPanel: { flex: 0.9, minWidth: 0, borderWidth: 1, borderRadius: 11, padding: 16 },
  sourcesPanel: { flex: 1.2, minWidth: 0, borderWidth: 1, borderRadius: 11, overflow: 'hidden', minHeight: 340 },
  sourcesHeading: { minHeight: 55, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1 },
  sourcesTitle: { fontSize: 12, fontWeight: '700' },
  sourcesSubtitle: { fontSize: 8, marginTop: 4 },
  emptyBadge: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 5 },
  emptyBadgeText: { fontSize: 7 },
  emptyState: { flex: 1, minHeight: 270, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  emptyIconText: { fontSize: 18 },
  emptyTitle: { fontSize: 9, fontWeight: '700' },
  emptyDescription: { fontSize: 8, textAlign: 'center', marginTop: 7 },
  sourceList: { paddingHorizontal: 14 },
  sourceRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  sourceFileIcon: { width: 31, height: 31, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  sourceFileIconText: { color: '#059669', fontSize: 13 },
  sourceFileDetails: { flex: 1, minWidth: 0 },
  sourceFileName: { fontSize: 10, fontWeight: '600' },
  sourceFileMeta: { fontSize: 8, marginTop: 4 },
  indexedStatus: { color: '#059669', fontSize: 8, fontWeight: '600', marginLeft: 9 },
  uploadButton: { minHeight: 38, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f9f78', borderRadius: 20, marginTop: 18, paddingHorizontal: 10 },
  uploadButtonMobile: { minHeight: 46, width: '100%', alignSelf: 'stretch', marginTop: 16, paddingHorizontal: 14 },
  disabledUploadButton: { backgroundColor: '#0f9f78', opacity: 0.88 },
  uploadSpinner: { marginRight: 7 },
  uploadIcon: { color: '#061b14', fontSize: 13, fontWeight: '700', marginRight: 7 },
  uploadButtonText: { color: '#061b14', fontSize: 9, fontWeight: '700', textAlign: 'center', flexShrink: 1 },
  apiKeyNotice: { fontSize: 8, lineHeight: 12, marginTop: 7 },
  uploadError: { color: '#dc2626', fontSize: 10, lineHeight: 15, marginTop: 10 },
});
