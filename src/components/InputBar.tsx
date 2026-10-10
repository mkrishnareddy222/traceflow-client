import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker'; 
import { UploadedFile } from '../types/chat';

interface InputBarProps {
  onSubmit: (text: string) => void;
  // FIXED: Renamed contract token prop to match your updated hook signature
  ingestFileWithProgress: (fileObj: { uri: string; name: string; type: string, blob?: any }) => Promise<void>;
  theme: 'light' | 'dark';
  ragEnabled: boolean;
  isFileUploading: boolean;
}

export const InputBar: React.FC<InputBarProps> = ({ 
  onSubmit, 
  ingestFileWithProgress, 
  theme, 
  ragEnabled, 
  isFileUploading 
}) => {
  const [localQuery, setLocalQuery] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<UploadedFile[]>([]);
  const isDark = theme === 'dark';

  const handleDocumentSelectionTrigger = async () => {
    try {
      const pickerResult = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (pickerResult.canceled || !pickerResult.assets || pickerResult.assets.length === 0) {
        return;
      }

      const selectedAsset = pickerResult.assets[0];

      const targetFilePayload = {
        uri: selectedAsset.uri,
        name: selectedAsset.name,
        type: selectedAsset.mimeType || 'application/pdf',
        blob: (selectedAsset as any).output?.[0] || selectedAsset
      };

      // Call the newly named async orchestration method
      await ingestFileWithProgress(targetFilePayload);
      
      // Mirror successful synchronization inside localized UI list state tracks
      const clientSideFileBubble: UploadedFile = {
        id: Date.now().toString(),
        name: selectedAsset.name,
        size: 'Synced'
      };
      setAttachedFiles(prev => [...prev, clientSideFileBubble]);

    } catch (err) {
      console.error('Document picking error event sequence:', err);
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleTriggerSubmit = () => {
    if (!localQuery.trim()) return;
    onSubmit(localQuery.trim());
    setLocalQuery('');
    setAttachedFiles([]);
  };

  return (
    <View style={[styles.masterWrapper, { backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }]}>
      
      {attachedFiles.length > 0 && ragEnabled && (
        <View style={styles.filesRowOuter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filesScrollContainer}>
            {attachedFiles.map(file => (
              <View key={file.id} style={[styles.filePill, { backgroundColor: isDark ? '#222222' : '#f0f0f0' }]}>
                <Text style={[styles.fileNameText, { color: isDark ? '#ececf1' : '#0d0d0d' }]} numberOfLines={1}>
                  🟢 {file.name} (Indexed)
                </Text>
                <TouchableOpacity onPress={() => handleRemoveFile(file.id)} style={styles.removeFileBtn}>
                  <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={[styles.inputBoxShell, { backgroundColor: isDark ? '#171717' : '#f4f4f4', borderColor: isDark ? '#262626' : '#e5e5e5' }]}>
        
        {ragEnabled && (
          <TouchableOpacity 
            style={[styles.attachButton, isFileUploading && { opacity: 0.4 }]} 
            onPress={handleDocumentSelectionTrigger}
            disabled={isFileUploading}
          >
            <Text style={{ color: isDark ? '#b4b4b4' : '#000000', fontSize: 18, fontWeight: '600' }}>
              {isFileUploading ? '⌛' : '+'}
            </Text>
          </TouchableOpacity>
        )}

        <TextInput
          style={[styles.inputField, { color: isDark ? '#ececf1' : '#0d0d0d' }]}
          placeholder={isFileUploading ? "Indexing database asset onto disk storage..." : "Message TraceFlow..."}
          placeholderTextColor={isDark ? '#525252' : '#a3a3a3'}
          value={localQuery}
          onChangeText={setLocalQuery}
          onSubmitEditing={handleTriggerSubmit}
          editable={!isFileUploading}
        />

        <TouchableOpacity 
          style={[styles.sendButton, { backgroundColor: isDark ? '#b4b4b4' : '#000000' }, isFileUploading && { opacity: 0.5 }]} 
          onPress={handleTriggerSubmit}
          disabled={isFileUploading}
        >
          <Text style={[styles.sendButtonText, { color: isDark ? '#0d0d0d' : '#ffffff' }]}>➔</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  masterWrapper: { maxWidth: 720, width: '100%', alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'column' },
  filesRowOuter: { width: '100%', marginBottom: 8 },
  filesScrollContainer: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  filePill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
  fileNameText: { fontSize: 12, maxWidth: 160 },
  removeFileBtn: { marginLeft: 8, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center' },
  inputBoxShell: { flexDirection: 'row', width: '100%', height: 48, borderRadius: 24, borderWidth: 1, alignItems: 'center', paddingHorizontal: 8 },
  attachButton: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  inputField: { flex: 1, height: '100%', paddingHorizontal: 10, fontSize: 15 },
  sendButton: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  sendButtonText: { fontSize: 14, fontWeight: 'bold' }
});
