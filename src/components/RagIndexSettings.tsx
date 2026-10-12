import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { ChatPreferences } from '../types/chat';

interface RagIndexSettingsProps {
  preferences: ChatPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<ChatPreferences>>;
  isDark: boolean;
}

const embeddingProviders: ChatPreferences['ragProvider'][] = ['cohere', 'gemini'];

export const RagIndexSettings: React.FC<RagIndexSettingsProps> = ({
  preferences,
  setPreferences,
  isDark,
}) => {
  const colors = {
    text: isDark ? '#f4f4f5' : '#18181b',
    muted: isDark ? '#858991' : '#71717a',
    panel: isDark ? '#090b0d' : '#ffffff',
    border: isDark ? '#25282d' : '#e4e4e7',
    activeText: isDark ? '#111315' : '#ffffff',
    activeBackground: isDark ? '#f0f1f1' : '#18181b',
  };
  const apiKey = preferences.apiTokens[preferences.ragProvider];
  const providerLabel = preferences.ragProvider === 'gemini' ? 'Gemini' : 'Cohere';

  const updateSettings = (updates: Partial<ChatPreferences>) => {
    setPreferences((current) => ({ ...current, ...updates }));
  };

  const updateApiKey = (value: string) => {
    setPreferences((current) => ({
      ...current,
      apiTokens: { ...current.apiTokens, [current.ragProvider]: value },
    }));
  };

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>RAG Search Configuration</Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>Configure segmentation before index execution.</Text>

      <Text style={[styles.fieldLabel, { color: colors.text }]}>Embedder Model</Text>
      <View style={styles.providerRow}>
        {embeddingProviders.map((provider) => {
          const selected = preferences.ragProvider === provider;
          return (
            <TouchableOpacity
              key={provider}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => updateSettings({ ragProvider: provider })}
              style={[
                styles.providerButton,
                { backgroundColor: selected ? colors.activeBackground : colors.panel, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.providerText, { color: selected ? colors.activeText : colors.muted }]}>
                {provider.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.apiLabelRow}>
        <Text style={[styles.fieldLabel, styles.apiLabel, { color: colors.text }]}>{providerLabel} embedding API key</Text>
        <Text style={[styles.apiHint, { color: colors.muted }]}>For vector embeddings</Text>
      </View>
      <TextInput
        style={[styles.apiInput, { backgroundColor: colors.panel, borderColor: colors.border, color: colors.text }]}
        placeholder={`Enter ${providerLabel} API key`}
        placeholderTextColor={colors.muted}
        secureTextEntry
        value={apiKey}
        onChangeText={updateApiKey}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Text style={[styles.apiNote, { color: colors.muted }]}>The key is kept in this session and used for vector embedding requests.</Text>

      <View style={styles.sliderSection}>
        <Text style={[styles.sliderLabel, { color: colors.text }]}>
          Chunk Size: <Text style={styles.sliderValue}>{preferences.chunkSize}</Text>
        </Text>
        <Slider
          minimumValue={100}
          maximumValue={1400}
          step={50}
          value={preferences.chunkSize}
          onValueChange={(chunkSize) => updateSettings({ chunkSize: Math.round(chunkSize) })}
          minimumTrackTintColor="#10b981"
          maximumTrackTintColor={colors.border}
          thumbTintColor="#10b981"
        />
      </View>

      <View style={styles.sliderSection}>
        <Text style={[styles.sliderLabel, { color: colors.text }]}>
          Chunk Overlap: <Text style={styles.sliderValue}>{preferences.chunkOverlap}</Text>
        </Text>
        <Slider
          minimumValue={0}
          maximumValue={200}
          step={5}
          value={preferences.chunkOverlap}
          onValueChange={(chunkOverlap) => updateSettings({ chunkOverlap: Math.round(chunkOverlap) })}
          minimumTrackTintColor="#10b981"
          maximumTrackTintColor={colors.border}
          thumbTintColor="#10b981"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: { width: '100%' },
  title: { fontSize: 13, fontWeight: '700' },
  subtitle: { fontSize: 9, marginTop: 6, marginBottom: 19 },
  fieldLabel: { fontSize: 9, fontWeight: '600', marginBottom: 8 },
  providerRow: { flexDirection: 'row', gap: 7 },
  providerButton: { flex: 1, height: 33, alignItems: 'center', justifyContent: 'center', borderRadius: 7, borderWidth: 1 },
  providerText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.4 },
  apiLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  apiLabel: { marginBottom: 8 },
  apiHint: { fontSize: 7, marginBottom: 8 },
  apiInput: { height: 34, borderRadius: 7, borderWidth: 1, paddingHorizontal: 9, fontSize: 10 },
  apiNote: { fontSize: 7, marginTop: 5 },
  sliderSection: { marginTop: 14 },
  sliderLabel: { fontSize: 9, fontWeight: '600' },
  sliderValue: { color: '#10b981', fontWeight: '700' },
});
