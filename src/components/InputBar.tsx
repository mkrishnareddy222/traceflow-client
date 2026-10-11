import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { UploadedFile } from '../types/chat';

interface InputBarProps {
  onSubmit: (text: string) => void;
  ingestFileWithProgress: (fileObj: any) => Promise<void>;
  theme: 'light' | 'dark';
  ragEnabled: boolean;
  isFileUploading: boolean;
  indexedFiles: UploadedFile[];
  clearActiveFilesContext: () => void;
  provider: string;
  maxTokens: number;
}

export const InputBar: React.FC<InputBarProps> = ({ 
  onSubmit, ingestFileWithProgress, theme, ragEnabled, isFileUploading, indexedFiles, clearActiveFilesContext,
  provider, maxTokens
}) => {
  const [localQuery, setLocalQuery] = useState('');
  const isDark = theme === 'dark';
  const providerLabel = provider === 'openai'
    ? 'OpenAI'
    : provider.charAt(0).toUpperCase() + provider.slice(1);

  const handleDocumentSelectionTrigger = async () => {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) return;
      const selectedAsset = pickerResult.assets[0];

      await ingestFileWithProgress({
        uri: selectedAsset.uri,
        name: selectedAsset.name,
        type: selectedAsset.mimeType || 'application/pdf',
        blob: (selectedAsset as any).output?.[0] || selectedAsset
      });
    } catch (err) {
      console.error('Document selection exception:', err);
    }
  };

  const handleTriggerSubmit = () => {
    if (!localQuery.trim()) return;
    onSubmit(localQuery.trim());
    setLocalQuery('');
  };

  return (
    <View style={styles.masterWrapper}>
      <View style={[
        styles.inputCapsuleContainer,
        { backgroundColor: isDark ? '#101114' : '#f9fafb', borderColor: isDark ? '#24262b' : '#e5e7eb' }
      ]}>
        
        {/* FILE PILLS INLINE INSIDE CONTAINER TRACE */}
        {ragEnabled && indexedFiles.length > 0 && (
          <View style={styles.inlineFilesArea}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filesScrollContainer}>
              {indexedFiles.map(file => (
                <View key={file.id} style={[styles.filePill, { backgroundColor: isDark ? '#222222' : '#e5e5e5' }]}>
                  <Text style={[styles.fileNameText, { color: isDark ? '#ececf1' : '#0d0d0d' }]} numberOfLines={1}>
                    📎 {file.name}
                  </Text>
                  <TouchableOpacity onPress={clearActiveFilesContext} style={styles.removeFileBtn}>
                    <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 11 }}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <TextInput
          style={[styles.inputField, { color: isDark ? '#ececf1' : '#0d0d0d' }]}
          placeholder={isFileUploading ? 'Structuring text indices...' : 'Message TraceFlow...'}
          placeholderTextColor={isDark ? '#71717a' : '#a1a1aa'}
          value={localQuery}
          onChangeText={setLocalQuery}
          onSubmitEditing={handleTriggerSubmit}
          editable={!isFileUploading}
        />

        <View style={styles.interactiveSubRow}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={ragEnabled ? 'Attach document' : 'Enable RAG to attach a document'}
            style={[styles.attachButton, (!ragEnabled || isFileUploading) && styles.disabledAttachButton]}
            onPress={handleDocumentSelectionTrigger}
            disabled={!ragEnabled || isFileUploading}
          >
            <Text style={{ color: isDark ? '#a1a1aa' : '#52525b', fontSize: 24, fontWeight: '300', lineHeight: 26 }}>
              {isFileUploading ? '⌛' : '+'}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.requestSettings, { color: isDark ? '#71717a' : '#71717a' }]}>
            {providerLabel} · {maxTokens} tokens
          </Text>
          <View style={styles.submitSpacer} />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: isDark ? '#15171b' : '#ffffff', borderColor: isDark ? '#292c32' : '#d4d4d8' },
              !localQuery.trim() && styles.disabledSendButton,
            ]}
            onPress={handleTriggerSubmit}
            disabled={!localQuery.trim() || isFileUploading}
          >
            <Text style={[styles.sendButtonText, { color: isDark ? '#9ca3af' : '#52525b' }]}>➤</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  masterWrapper: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 2, paddingBottom: 10 },
  inputCapsuleContainer: { width: '100%', minHeight: 84, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingTop: 7, paddingBottom: 7, flexDirection: 'column' },
  inlineFilesArea: { width: '100%', marginBottom: 6, paddingHorizontal: 4 },
  filesScrollContainer: { flexDirection: 'row', gap: 6 },
  filePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  fileNameText: { fontSize: 11, maxWidth: 140, fontWeight: '600' },
  removeFileBtn: { marginLeft: 6, justifyContent: 'center' },
  inputField: { width: '100%', height: 27, paddingHorizontal: 1, fontSize: 11 },
  interactiveSubRow: { flexDirection: 'row', width: '100%', alignItems: 'center', marginTop: 2 },
  attachButton: { width: 27, height: 27, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },
  disabledAttachButton: { opacity: 0.75 },
  requestSettings: { fontSize: 7, marginLeft: 6 },
  submitSpacer: { flex: 1 },
  sendButton: { width: 28, height: 28, borderRadius: 7, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  disabledSendButton: { opacity: 0.78 },
  sendButtonText: { fontSize: 13, fontWeight: '500' }
});
