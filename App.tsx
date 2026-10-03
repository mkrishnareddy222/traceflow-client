import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Switch,
  Animated,
  Easing
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useChatEngine } from './src/hooks/useChatEngine';
import { ChatBubble } from './src/components/ChatBubble';
import { InputBar } from './src/components/InputBar';
import { HeaderBar } from './src/components/HeaderBar';

export default function App() {
  const { messages, isTyping, preferences, setPreferences, sendMessage } = useChatEngine();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = windowWidth < 768;

  const isDark = preferences.theme === 'dark';
  const slideAnim = useRef(new Animated.Value(-260)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (isMobile) {
      Animated.timing(slideAnim, {
        toValue: isMobileMenuOpen ? 0 : -260,
        duration: 1100,
        easing: Easing.bezier(0.25, 1, 0.5, 1),
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [isMobileMenuOpen, isMobile, slideAnim]);

  const providers: Array<'groq' | 'openai' | 'gemini'> = ['groq', 'openai', 'gemini'];

  const handleTokenChange = (text: string) => {
    setPreferences(prev => ({
      ...prev,
      apiTokens: { ...prev.apiTokens, [prev.provider]: text }
    }));
  };

  const renderSidebarContent = () => (
    <View style={[styles.sidebarInner, { backgroundColor: isDark ? '#171717' : '#f9f9f9' }]}>
      <Text style={[styles.sidebarTitle, { color: isDark ? '#737373' : '#a3a3a3' }]}>WORKSPACE OPTIONS</Text>
      <View style={[styles.divider, { backgroundColor: isDark ? '#222222' : '#e5e5e5' }]} />
      
      <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Interface Mode</Text>
      <View style={styles.compactRow}>
        {[
          { key: 'light', label: '☀️ Light' },
          { key: 'dark', label: '🌙 Dark' }
        ].map((t) => (
          <TouchableOpacity 
            key={t.key} 
            style={[
              styles.pillButton, 
              { backgroundColor: isDark ? '#1a1a1a' : '#eaeaea', borderColor: isDark ? '#2d2d2d' : '#d5d5d5' },
              preferences.theme === t.key && (isDark ? styles.pillActiveDark : styles.pillActiveLight)
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, theme: t.key as 'light' | 'dark' }))}
          >
            <Text style={[
              styles.pillText, 
              { color: isDark ? '#a3a3a3' : '#4b5563' },
              preferences.theme === t.key && { color: isDark ? '#0d0d0d' : '#ffffff', fontWeight: 'bold' }
            ]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.inputLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>AI Provider</Text>
      <View style={styles.compactRow}>
        {providers.map((p) => (
          <TouchableOpacity 
            key={p} 
            style={[
              styles.pillButton, 
              { backgroundColor: isDark ? '#1a1a1a' : '#eaeaea', borderColor: isDark ? '#2d2d2d' : '#d5d5d5' },
              preferences.provider === p && (isDark ? styles.pillActiveDark : styles.pillActiveLight)
            ]}
            onPress={() => setPreferences(prev => ({ ...prev, provider: p }))}
          >
            <Text style={[
              styles.pillText, 
              { color: isDark ? '#a3a3a3' : '#4b5563' },
              preferences.provider === p && { color: isDark ? '#0d0d0d' : '#ffffff' }
            ]}>
              {p === 'openai' ? 'OpenAI' : p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={[
          styles.tokenInput, 
          { backgroundColor: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#2d2d2d' : '#d5d5d5', color: isDark ? '#ececf1' : '#0d0d0d' }
        ]}
        placeholder={`${preferences.provider.toUpperCase()} Override Token`}
        placeholderTextColor={isDark ? '#444444' : '#b4b4b4'}
        secureTextEntry={true}
        value={preferences.apiTokens[preferences.provider]}
        onChangeText={handleTokenChange}
      />

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
        onValueChange={(val: number) => setPreferences(prev => ({ ...prev, temperature: val }))}
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
        onValueChange={(val: number) => setPreferences(prev => ({ ...prev, maxTokens: Math.round(val) }))}
        minimumTrackTintColor={isDark ? '#e5e5e5' : '#000000'}
        maximumTrackTintColor={isDark ? '#2d2d2d' : '#e5e5e5'}
        thumbTintColor={isDark ? '#e5e5e5' : '#000000'}
      />

      <View style={styles.toggleRow}>
        <View style={styles.toggleTextContainer}>
          <Text style={[styles.toggleLabel, { color: isDark ? '#a3a3a3' : '#4b5563' }]}>Remember Context</Text>
          <Text style={[styles.toggleSubtitle, { color: isDark ? '#525252' : '#a3a3a3' }]}>Includes data traces inside history context arrays</Text>
        </View>
        <Switch
          trackColor={{ false: '#2d2d2d', true: '#525252' }}
          thumbColor={preferences.rememberConversation ? (isDark ? '#ececf1' : '#000000') : '#a3a3a3'}
          value={preferences.rememberConversation}
          onValueChange={(val: boolean) => setPreferences(prev => ({ ...prev, rememberConversation: val }))}
        />
      </View>

      <View style={[styles.divider, { backgroundColor: isDark ? '#222222' : '#e5e5e5' }]} />
      <Text style={[styles.sidebarCaption, { color: isDark ? '#404040' : '#b4b4b4' }]}>Engine v1.0.0 · Dual Dynamic</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardContainer}
      >
        <View style={styles.appLayout}>
          
          {!isMobile && (
            <View style={[styles.desktopSidebar, { backgroundColor: isDark ? '#171717' : '#f9f9f9', borderColor: isDark ? '#222222' : '#e5e5e5' }]}>
              {renderSidebarContent()}
            </View>
          )}

          {isMobile && (
            <View 
              style={styles.mobileDrawerOverlay}
              pointerEvents={isMobileMenuOpen ? 'auto' : 'none'}
            >
              {isMobileMenuOpen && (
                <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={() => setIsMobileMenuOpen(false)} />
              )}
              <Animated.View style={[styles.mobileSidebar, { transform: [{ translateX: slideAnim }], backgroundColor: isDark ? '#171717' : '#f9f9f9', borderColor: isDark ? '#222222' : '#e5e5e5' }]}>
                {renderSidebarContent()}
              </Animated.View>
            </View>
          )}

          <View style={[styles.chatArea, { backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }]}>
            <HeaderBar provider={preferences.provider} isMobile={isMobile} onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

            <ScrollView 
              ref={scrollViewRef}
              style={styles.scrollContainer}
              contentContainerStyle={[styles.scrollContent, messages.length === 0 && styles.scrollContentEmpty]}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.length === 0 ? (
                <View style={styles.welcomeContainer}>
                  <Text style={[styles.welcomeTitle, { fontSize: windowWidth < 450 ? 24 : 32, color: isDark ? '#ececf1' : '#0d0d0d' }]}>
                    What’s on your mind?
                  </Text>
                  <Text style={[styles.welcomeSubtitle, { fontSize: windowWidth < 450 ? 14 : 15, color: isDark ? '#a3a3a3' : '#4b5563' }]}>
                    Bring a question, a rough idea, or something you want to work through.
                  </Text>
                </View>
              ) : (
                messages.map((msg, index) => (
                  <ChatBubble 
                    key={msg.id} 
                    item={msg} 
                    isTyping={isTyping} 
                    isLast={index === messages.length - 1}
                    theme={preferences.theme}
                  />
                ))
              )}
            </ScrollView>

            <InputBar 
              onSubmit={(text) => sendMessage(text)} 
              theme={preferences.theme} 
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
container: { flex: 1 },
keyboardContainer: { flex: 1 },
appLayout: { flex: 1, flexDirection: 'row' },
desktopSidebar: { width: 260, borderRightWidth: 1 },
mobileDrawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, flexDirection: 'row' },
backdropTouch: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' },
mobileSidebar: { width: 260, height: '100%', borderRightWidth: 1, position: 'absolute', left: 0 },
sidebarInner: { flex: 1, padding: 16 },
sidebarTitle: { fontWeight: '700', fontSize: 11, letterSpacing: 0.8 },
inputLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
sidebarCaption: { fontSize: 11, marginTop: 'auto' },
divider: { height: 1, marginVertical: 12 },
compactRow: { flexDirection: 'row', gap: 6, width: '100%', marginBottom: 12 },
pillButton: { flex: 1, paddingVertical: 8, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
pillActiveDark: { backgroundColor: '#e5e5e5', borderColor: '#e5e5e5' },
pillActiveLight: { backgroundColor: '#000000', borderColor: '#000000' },
pillText: { fontSize: 11 },
tokenInput: { width: '100%', height: 36, borderRadius: 6, borderWidth: 1, paddingHorizontal: 10, fontSize: 12, marginBottom: 16 },
sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
sliderValueText: { fontSize: 12, fontWeight: '700' },
sliderBar: { width: '100%', height: 30, marginBottom: 4 },
toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 4, width: '100%' },
toggleTextContainer: { flex: 1, paddingRight: 8 },
toggleLabel: { fontSize: 12, fontWeight: '600' },
toggleSubtitle: { fontSize: 10, marginTop: 2 },
chatArea: { flex: 1, paddingHorizontal: 16, paddingTop: 10 },
scrollContainer: { flex: 1 },
scrollContent: { paddingVertical: 20 },
scrollContentEmpty: { flexGrow: 1, justifyContent: 'center' },
welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', maxWidth: 680, alignSelf: 'center', width: '100%' },
welcomeTitle: { fontWeight: '700', textAlign: 'center' },
welcomeSubtitle: { textAlign: 'center', marginTop: 12 }
});