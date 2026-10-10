import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import * as DocumentPicker from 'expo-document-picker';
import { ChatPreferences, ProcessingStep } from '../types/chat';

interface UploadStageProps {
  preferences: ChatPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<ChatPreferences>>;
  ragProcessingStep: ProcessingStep;
  ingestFileWithProgress: (fileObj: any) => Promise<void>;
  isDark: boolean;
}

export const DocumentUploadStage: React.FC<UploadStageProps> = ({
  preferences,
  setPreferences,
  ragProcessingStep,
  ingestFileWithProgress,
  isDark
}) => {
  const ragProviders: Array<'cohere' | 'gemini'> = ['cohere', 'gemini'];

  const stepLabels = {
    TRANSMITTING: 'Uploading payload packet safely to server endpoints...',
    SPLITTING_CHUNKS: `Splitting text structures (Size: ${preferences.chunkSize} / Overlap: ${preferences.chunkOverlap})...`,
    EMBEDDING: `Serializing chunks onto Chroma vector databases via ${preferences.ragProvider.toUpperCase()}...`,
    SUCCESS: 'Ingestion pipeline execution verified successfully! Opening chat...'
  };

  const handlePickDocument = async () => {
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
      console.error('File selection issue:', err);
    }
  };

  // 1. IN-PROGRESS LIFE-CYCLE SCREEN
  if (ragProcessingStep !== 'IDLE') {
    return (
      <View style={styles.wizardInner}>
        <ActivityIndicator size="large" color="#10b981" style={{ marginBottom: 20 }} />
        <Text style={[styles.wizardHeader, { color: isDark ? '#ececf1' : '#0d0d0d' }]}>PROCESSING KNOWLEDGE STREAM</Text>
        <Text style={[styles.wizardSubtitle, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>
          {stepLabels[ragProcessingStep as keyof typeof stepLabels] || 'Processing file context...'}
        </Text>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? '#1a1a1a' : '#eaeaea' }]}>
          <View style={[
            styles.progressBar, 
            { 
              width: ragProcessingStep === 'TRANSMITTING' ? '25%' : ragProcessingStep === 'SPLITTING_CHUNKS' ? '55%' : ragProcessingStep === 'EMBEDDING' ? '85%' : '100%',
              backgroundColor: ragProcessingStep === 'SUCCESS' ? '#10b981' : '#6366f1' 
            }
          ]} />
        </View>
      </View>
    );
  }

  // 2. ULTRA COMPACT CONFIGURATION CONTROL SHEET
  return (
    <View style={[styles.setupCard, { backgroundColor: isDark ? '#171717' : '#f9f9f9', borderColor: isDark ? '#262626' : '#e5e5e5' }]}>
      <Text style={[styles.mainTitle, { color: isDark ? '#ececf1' : '#0d0d0d' }]}>RAG Search Configuration</Text>
      <Text style={styles.subtitle}>Specify vector segmentation boundaries and keys directly on-stage before index execution.</Text>
      
      {/* Grouped Parameters Layout Matrix */}
      <View style={styles.parameterRow}>
        <View style={styles.splitInputContainer}>
          <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Embedder Model</Text>
          <View style={styles.compactRow}>
            {ragProviders.map((rp) => (
              <TouchableOpacity 
                key={rp} 
                style={[styles.pillButton, preferences.ragProvider === rp && (isDark ? styles.pillActiveDark : styles.pillActiveLight)]}
                onPress={() => setPreferences(prev => ({ ...prev, ragProvider: rp }))}
              >
                <Text style={[styles.pillText, { color: isDark ? '#a3a3a3' : '#4b5563' }, preferences.ragProvider === rp && { color: isDark ? '#0d0d0d' : '#ffffff', fontWeight: 'bold' }]}>
                  {rp.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dynamic Key Fields encapsulated cleanly inside core layout card */}
        {preferences.ragProvider === 'cohere' && (
          <View style={styles.splitInputContainer}>
            <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Cohere Security Key</Text>
            <TextInput
              style={[styles.tokenInput, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#2d2d2d' : '#d5d5d5', color: isDark ? '#ececf1' : '#0d0d0d' }]}
              placeholder="Enter Cohere Token"
              placeholderTextColor={isDark ? '#444444' : '#b4b4b4'}
              secureTextEntry={true}
              value={preferences.apiTokens.cohere}
              onChangeText={(txt) => setPreferences(prev => ({ ...prev, apiTokens: { ...prev.apiTokens, cohere: txt } }))}
            />
          </View>
        )}
      </View>

      {/* Compact Horizontal Slider Controls Grid Row */}
      <View style={styles.slidersGrid}>
        <View style={styles.sliderItem}>
          <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Chunk Size: <Text style={styles.boldVal}>{preferences.chunkSize}</Text></Text>
          <Slider
            minimumValue={100}
            maximumValue={1000}
            step={50}
            value={preferences.chunkSize}
            onValueChange={(val) => setPreferences(prev => ({ ...prev, chunkSize: Math.round(val) }))}
            minimumTrackTintColor="#10b981"
            thumbTintColor="#10b981"
          />
        </View>

        <View style={styles.sliderItem}>
          <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Chunk Overlap: <Text style={styles.boldVal}>{preferences.chunkOverlap}</Text></Text>
          <Slider
            minimumValue={50}
            maximumValue={100}
            step={5}
            value={preferences.chunkOverlap}
            onValueChange={(val) => setPreferences(prev => ({ ...prev, chunkOverlap: Math.round(val) }))}
            minimumTrackTintColor="#10b981"
            thumbTintColor="#10b981"
          />
        </View>
      </View>

      <TouchableOpacity style={styles.uploadButton} onPress={handlePickDocument}>
        <Text style={styles.uploadButtonText}>➕ Select & Inject Documents</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  setupCard: { width: '100%', maxWidth: 580, padding: 20, borderRadius: 12, borderWidth: 1 },
  mainTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4, textAlign: 'center' },
  subtitle: { color: '#737373', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 18 },
  parameterRow: { flexDirection: 'row', gap: 12, width: '100%', marginBottom: 12 },
  splitInputContainer: { flex: 1 },
  inputLabel: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  boldVal: { color: '#10b981', fontWeight: '800' },
  compactRow: { flexDirection: 'row', gap: 6, width: '100%' },
  pillButton: { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, borderColor: '#2d2d2d', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1a' },
  pillActiveDark: { backgroundColor: '#e5e5e5', borderColor: '#e5e5e5' },
  pillActiveLight: { backgroundColor: '#000000', borderColor: '#000000' },
  pillText: { fontSize: 11 },
  tokenInput: { width: '100%', height: 34, borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, fontSize: 12 },
  slidersGrid: { flexDirection: 'column', gap: 10, width: '100%', marginTop: 6 },
  sliderItem: { width: '100%' },
  uploadButton: { marginTop: 20, width: '100%', height: 44, backgroundColor: '#10b981', borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  uploadButtonText: { color: '#ffffff', fontSize: 14, fontWeight: '700' },
  wizardInner: { width: '100%', maxWidth: 460, alignItems: 'center', alignSelf: 'center' },
  wizardHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, marginBottom: 6 },
  wizardSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  progressTrack: { width: '100%', height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 3 }
});
