import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import Slider from '@react-native-community/slider';
import { ChatPreferences } from '../types/chat';

interface SidebarProps {
  preferences: ChatPreferences;
  onThemeChange: (theme: 'light' | 'dark') => void;
  onProviderChange: (provider: 'groq' | 'openai' | 'gemini') => void;
  onTokenChange: (text: string) => void;
  onTemperatureChange: (val: number) => void;
  onMaxTokensChange: (val: number) => void;
  onRememberToggle: (val: boolean) => void;
  onRagToggle: (val: boolean) => void;
  isDark: boolean;
}

const providers: ('groq' | 'openai' | 'gemini')[] = ['groq', 'openai', 'gemini'];

export const SidebarOptions: React.FC<SidebarProps> = ({
  preferences,
  onThemeChange,
  onProviderChange,
  onTokenChange,
  onTemperatureChange,
  onMaxTokensChange,
  onRememberToggle,
  onRagToggle,
  isDark,
}) => {
  const colors = {
    background: isDark ? '#101215' : '#f4f4f5',
    panel: isDark ? '#0b0d0f' : '#ffffff',
    border: isDark ? '#24272b' : '#e4e4e7',
    text: isDark ? '#d4d4d8' : '#18181b',
    muted: isDark ? '#7c8189' : '#71717a',
  };

  return (
    <View style={[styles.sidebar, { backgroundColor: colors.background }]}>
      <View style={[styles.brandHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.brandMark}>
          <Text style={styles.brandMarkText}>T</Text>
        </View>
        <View>
          <Text style={[styles.brandName, { color: colors.text }]}>TraceFlow</Text>
          <Text style={[styles.brandSubtitle, { color: colors.muted }]}>AI workspace</Text>
        </View>
      </View>

      <ScrollView style={styles.optionsScroll} contentContainerStyle={styles.optionsContent} showsVerticalScrollIndicator>
        <Text style={[styles.sectionTitle, { color: colors.muted, marginBottom: 12 }]}>APPEARANCE</Text>
        <Text style={[styles.inputLabel, { color: colors.muted }]}>Interface Mode</Text>
        <View style={[styles.themeSwitch, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          {([
            { key: 'light', label: '☼  Light' },
            { key: 'dark', label: '☾  Dark' },
          ] as const).map((theme) => {
            const active = preferences.theme === theme.key;
            return (
              <TouchableOpacity
                key={theme.key}
                onPress={() => onThemeChange(theme.key)}
                style={[
                  styles.themeButton,
                  active && { backgroundColor: isDark ? '#202329' : '#e7e7e9' },
                ]}
              >
                <Text style={[styles.themeButtonText, { color: active ? colors.text : colors.muted }]}>
                  {theme.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.muted }]}>MODEL</Text>
          <Text style={[styles.infoIcon, { color: colors.muted }]}>ⓘ</Text>
        </View>

        <Text style={[styles.inputLabel, { color: colors.muted }]}>AI provider</Text>
        <View style={[styles.providerSwitch, { backgroundColor: colors.panel, borderColor: colors.border }]}>
          {providers.map((provider) => {
            const active = preferences.provider === provider;
            return (
              <TouchableOpacity
                key={provider}
                onPress={() => onProviderChange(provider)}
                style={[
                  styles.providerButton,
                  active && { backgroundColor: isDark ? '#202329' : '#e7e7e9' },
                ]}
              >
                <Text style={[styles.providerText, { color: active ? colors.text : colors.muted }]}>
                  {provider === 'openai' ? 'OpenAI' : provider.charAt(0).toUpperCase() + provider.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TextInput
          style={[styles.tokenInput, { backgroundColor: colors.panel, borderColor: colors.border, color: colors.text }]}
          placeholder={`${preferences.provider.toUpperCase()} API key`}
          placeholderTextColor={colors.muted}
          secureTextEntry
          value={preferences.apiTokens[preferences.provider]}
          onChangeText={onTokenChange}
        />

        <View style={styles.sliderLabelRow}>
          <Text style={[styles.controlLabel, { color: colors.muted }]}>Temperature</Text>
          <Text style={[styles.valueBadge, { backgroundColor: isDark ? '#202329' : '#e7e7e9', color: colors.text }]}>
            {preferences.temperature.toFixed(1)}
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          step={0.1}
          value={preferences.temperature}
          onValueChange={onTemperatureChange}
          minimumTrackTintColor="#10b981"
          maximumTrackTintColor={colors.border}
          thumbTintColor="#10b981"
        />
        <View style={styles.sliderCaptions}>
          <Text style={[styles.sliderCaption, { color: colors.muted }]}>Precise</Text>
          <Text style={[styles.sliderCaption, { color: colors.muted }]}>Creative</Text>
        </View>

        <View style={[styles.sliderLabelRow, styles.secondSliderLabel]}>
          <Text style={[styles.controlLabel, { color: colors.muted }]}>Max tokens</Text>
          <Text style={[styles.valueBadge, { backgroundColor: isDark ? '#202329' : '#e7e7e9', color: colors.text }]}>
            {preferences.maxTokens}
          </Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={128}
          maximumValue={4096}
          step={128}
          value={preferences.maxTokens}
          onValueChange={onMaxTokensChange}
          minimumTrackTintColor="#10b981"
          maximumTrackTintColor={colors.border}
          thumbTintColor="#10b981"
        />
        <View style={styles.sliderCaptions}>
          <Text style={[styles.sliderCaption, { color: colors.muted }]}>Short</Text>
          <Text style={[styles.sliderCaption, { color: colors.muted }]}>Detailed</Text>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextContainer}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>Remember context</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.muted }]}>Keep conversation history</Text>
          </View>
          <Switch
            trackColor={{ false: colors.border, true: '#10b981' }}
            thumbColor={preferences.rememberConversation ? '#ffffff' : '#a1a1aa'}
            value={preferences.rememberConversation}
            onValueChange={onRememberToggle}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleTextContainer}>
            <Text style={[styles.toggleLabel, { color: colors.text }]}>RAG search engine</Text>
            <Text style={[styles.toggleSubtitle, { color: colors.muted }]}>Ground answers in your files</Text>
          </View>
          <Switch
            trackColor={{ false: colors.border, true: '#10b981' }}
            thumbColor={preferences.ragEnabled ? '#ffffff' : '#a1a1aa'}
            value={preferences.ragEnabled}
            onValueChange={onRagToggle}
          />
        </View>
      </ScrollView>

      <View style={[styles.sidebarFooter, { borderTopColor: colors.border }]}>
        <View style={styles.footerStatusDot} />
        <View>
          <Text style={[styles.footerTitle, { color: colors.muted }]}>SYSTEM OPERATIONAL</Text>
          <Text style={[styles.footerSubtitle, { color: colors.muted }]}>TraceFlow Engine · v1.3.0</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: { flex: 1, width: '100%' },
  brandHeader: { height: 68, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, borderBottomWidth: 1 },
  brandMark: { width: 30, height: 30, borderRadius: 8, backgroundColor: '#e4e4e7', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  brandMarkText: { color: '#18181b', fontSize: 14, fontWeight: '700' },
  brandName: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  brandSubtitle: { fontSize: 10, marginTop: 2 },
  optionsScroll: { flex: 1 },
  optionsContent: { paddingHorizontal: 17, paddingTop: 2, paddingBottom: 18 },
  inputLabel: { fontSize: 10, fontWeight: '500', marginBottom: 7 },
  themeSwitch: { height: 34, flexDirection: 'row', borderWidth: 1, borderRadius: 8, padding: 2, marginBottom: 20 },
  themeButton: { flex: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  themeButtonText: { fontSize: 10, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2 },
  infoIcon: { fontSize: 12 },
  providerSwitch: { height: 37, flexDirection: 'row', borderWidth: 1, borderRadius: 8, padding: 3, marginBottom: 14 },
  providerButton: { flex: 1, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  providerText: { fontSize: 10, fontWeight: '500' },
  tokenInput: { width: '100%', height: 35, borderRadius: 8, borderWidth: 1, paddingHorizontal: 10, fontSize: 10, marginBottom: 8 },
  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 9 },
  controlLabel: { fontSize: 10, fontWeight: '500' },
  valueBadge: { fontSize: 9, fontWeight: '600', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 3 },
  slider: { width: '100%', height: 24, marginTop: 1 },
  sliderCaptions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: -2 },
  sliderCaption: { fontSize: 8 },
  secondSliderLabel: { marginTop: 16 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 19, width: '100%' },
  toggleTextContainer: { flex: 1, paddingRight: 8 },
  toggleLabel: { fontSize: 11, fontWeight: '600' },
  toggleSubtitle: { fontSize: 9, marginTop: 3 },
  divider: { height: 1, marginTop: 19 },
  sidebarFooter: { minHeight: 58, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18 },
  footerStatusDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10b981', marginRight: 10 },
  footerTitle: { fontSize: 8, letterSpacing: 0.3 },
  footerSubtitle: { fontSize: 8, marginTop: 3 },
});
