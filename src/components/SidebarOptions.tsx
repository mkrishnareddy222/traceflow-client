import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, Switch } from 'react-native';
import Slider from '@react-native-community/slider';
import { ChatPreferences } from '../types/chat';

interface SidebarProps {
  preferences: ChatPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<ChatPreferences>>;
  isDark: boolean;
}

export const SidebarOptions: React.FC<SidebarProps> = ({ preferences, setPreferences, isDark }) => {
  const providers: Array<'groq' | 'openai' | 'gemini'> = ['groq', 'openai', 'gemini'];

  return (
    <View style={[styles.sidebarInner, { backgroundColor: isDark ? '#171717' : '#f9f9f9' }]}>
      <Text style={[styles.sidebarTitle, { color: isDark ? '#737373' : '#a3a3a3' }]}>WORKSPACE OPTIONS</Text>
      <View style={[styles.divider, { backgroundColor: isDark ? '#222222' : '#e5e5e5' }]} />
      
      {/* 1. Interface Toggle Mode */}
      <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Interface Mode</Text>
      <View style={styles.compactRow}>
        {[
          { key: 'light', label: '☀️ Light' },
          { key: 'dark', label: '🌙 Dark' }
        ].map((t) => (
          <TouchableOpacity 
            key={t.key} 
            style={[styles.pillButton, { backgroundColor: isDark ? '#1a1a1a' : '#eaeaea', borderColor: isDark ? '#2d2d2d' : '#d5d5d5' }, preferences.theme === t.key && (isDark ? styles.pillActiveDark : styles.pillActiveLight)]}
            onPress={() => setPreferences(prev => ({ ...prev, theme: t.key as 'light' | 'dark' }))}
          >
            <Text style={[styles.pillText, { color: isDark ? '#a3a3a3' : '#4b5563' }, preferences.theme === t.key && { color: isDark ? '#0d0d0d' : '#ffffff', fontWeight: 'bold' }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 2. Base Core AI Settings */}
      <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563', marginTop: 12 }]}>AI Provider</Text>
      <View style={styles.compactRow}>
        {providers.map((p) => (
          <TouchableOpacity 
            key={p} 
            style={[styles.pillButton, { backgroundColor: isDark ? '#1a1a1a' : '#eaeaea', borderColor: isDark ? '#2d2d2d' : '#d5d5d5' }, preferences.provider === p && (isDark ? styles.pillActiveDark : styles.pillActiveLight)]}
            onPress={() => setPreferences(prev => ({ ...prev, provider: p }))}
          >
            <Text style={[styles.pillText, { color: isDark ? '#a3a3a3' : '#4b5563' }, preferences.provider === p && { color: isDark ? '#0d0d0d' : '#ffffff' }]}>
              {p === 'openai' ? 'OpenAI' : p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[styles.tokenInput, { backgroundColor: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#2d2d2d' : '#d5d5d5', color: isDark ? '#ececf1' : '#0d0d0d' }]}
        placeholder={`${preferences.provider.toUpperCase()} Override Token`}
        placeholderTextColor={isDark ? '#444444' : '#b4b4b4'}
        secureTextEntry={true}
        value={preferences.apiTokens[preferences.provider]}
        onChangeText={(txt) => setPreferences(prev => ({ ...prev, apiTokens: { ...prev.apiTokens, [prev.provider]: txt } }))}
      />

      {/* 3. Base Core Parameters Sliders */}
      <View style={styles.sliderLabelRow}>
        <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Temperature</Text>
        <Text style={[styles.sliderValueText, { color: isDark ? '#ececf1' : '#0d0d0d' }]}>{preferences.temperature.toFixed(1)}</Text>
      </View>
      <Slider
        style={styles.sliderBar}
        minimumValue={0.0}
        maximumValue={2.0}
        step={0.1}
        value={preferences.temperature}
        onValueChange={(val) => setPreferences(prev => ({ ...prev, temperature: val }))}
        minimumTrackTintColor={isDark ? '#e5e5e5' : '#000000'}
        maximumTrackTintColor={isDark ? '#2d2d2d' : '#e5e5e5'}
        thumbTintColor={isDark ? '#e5e5e5' : '#000000'}
      />

      <View style={styles.sliderLabelRow}>
        <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Max Tokens</Text>
        <Text style={[styles.sliderValueText, { color: isDark ? '#ececf1' : '#0d0d0d' }]}>{preferences.maxTokens}</Text>
      </View>
      <Slider
        style={styles.sliderBar}
        minimumValue={128}
        maximumValue={4096}
        step={128}
        value={preferences.maxTokens}
        onValueChange={(val) => setPreferences(prev => ({ ...prev, maxTokens: Math.round(val) }))}
        minimumTrackTintColor={isDark ? '#e5e5e5' : '#000000'}
        maximumTrackTintColor={isDark ? '#2d2d2d' : '#e5e5e5'}
        thumbTintColor={isDark ? '#e5e5e5' : '#000000'}
      />

      {/* 4. Remember Context Toggle */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleTextContainer}>
          <Text style={[styles.toggleLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Remember Context</Text>
        </View>
        <Switch
          trackColor={{ false: '#2d2d2d', true: '#525252' }}
          thumbColor={preferences.rememberConversation ? (isDark ? '#ececf1' : '#000000') : '#a3a3a3'}
          value={preferences.rememberConversation}
          onValueChange={(val) => setPreferences(prev => ({ ...prev, rememberConversation: val }))}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: isDark ? '#222222' : '#e5e5e5' }]} />

      {/* 5. Minimal RAG Activation Switch Trigger */}
      <View style={styles.toggleRow}>
        <View style={styles.toggleTextContainer}>
          <Text style={[styles.toggleLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>RAG Search Engine</Text>
          <Text style={[styles.toggleSubtitle, { color: isDark ? '#525252' : '#a3a3a3' }]}>Inject private files into prompts</Text>
        </View>
        <Switch
          trackColor={{ false: '#2d2d2d', true: '#10b981' }}
          thumbColor={preferences.ragEnabled ? '#ffffff' : '#a3a3a3'}
          value={preferences.ragEnabled}
          onValueChange={(val) => setPreferences(prev => ({ ...prev, ragEnabled: val }))}
        />
      </View>

      <Text style={[styles.sidebarCaption, { color: isDark ? '#404040' : '#b4b4b4' }]}>TraceFlow Engine · v1.3.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebarInner: { flex: 1, padding: 16 },
  sidebarTitle: { fontWeight: '700', fontSize: 11, letterSpacing: 0.8 },
  inputLabel: { fontSize: 11, fontWeight: '700', marginBottom: 4, marginTop: 12 },
  sidebarCaption: { fontSize: 11, marginTop: 'auto' },
  divider: { height: 1, marginVertical: 12 },
  compactRow: { flexDirection: 'row', gap: 6, width: '100%', marginBottom: 4 },
  pillButton: { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillActiveDark: { backgroundColor: '#e5e5e5', borderColor: '#e5e5e5' },
  pillActiveLight: { backgroundColor: '#000000', borderColor: '#000000' },
  pillText: { fontSize: 11 },
  tokenInput: { width: '100%', height: 36, borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, fontSize: 12, marginTop: 4 },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  sliderValueText: { fontSize: 12, fontWeight: '700' },
  sliderBar: { width: '100%', height: 30, marginBottom: 4 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, width: '100%' },
  toggleTextContainer: { flex: 1, paddingRight: 8 },
  toggleLabel: { fontSize: 12, fontWeight: '600' },
  toggleSubtitle: { color: '#737373', fontSize: 10, marginTop: 2 }
});
