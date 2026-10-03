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
  Easing // ADDED: Core physics easing curve component module
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

  const slideAnim = useRef(new Animated.Value(-260)).current;

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowWidth(window.width);
    });
    return () => subscription.remove();
  }, []);

  // CINEMATIC CURVE CONFIGURATION: Drastically slowed down transitions
  useEffect(() => {
    if (isMobile) {
      Animated.timing(slideAnim, {
        toValue: isMobileMenuOpen ? 0 : -260,
        duration: 1100, // MODIFIED: Set to 1.1 seconds for an explicit luxury slow-motion effect
        easing: Easing.bezier(0.25, 1, 0.5, 1), // Injects a premium ease-out velocity decelerator curve
        useNativeDriver: Platform.OS !== 'web',
      }).start();
    }
  }, [isMobileMenuOpen, isMobile]);

  const providers: Array<'groq' | 'openai' | 'gemini'> = ['groq', 'openai', 'gemini'];

  const handleTokenChange = (text: string) => {
    setPreferences(prev => ({
      ...prev,
      apiTokens: { ...prev.apiTokens, [prev.provider]: text }
    }));
  };

  const renderSidebarContent = () => (
    <View style={styles.sidebarInner}>
      <Text style={styles.sidebarTitle}>Workspace Options</Text>
      <View style={styles.divider} />
      
      <Text style={styles.inputLabel}>AI Provider</Text>
      <View style={styles.compactRow}>
        {providers.map((p) => (
          <TouchableOpacity 
            key={p} 
            style={[styles.pillButton, preferences.provider === p && styles.pillActive]}
            onPress={() => setPreferences(prev => ({ ...prev, provider: p }))}
          >
            <Text style={[styles.pillText, preferences.provider === p && styles.pillTextActive]}>
              {p === 'openai' ? 'OpenAI' : p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.tokenInput}
        placeholder={`${preferences.provider.toUpperCase()} Override Token`}
        placeholderTextColor="#444444"
        secureTextEntry={true}
        value={preferences.apiTokens[preferences.provider]}
        onChangeText={handleTokenChange}
      />

      <View style={styles.sliderLabelRow}>
        <Text style={styles.inputLabel}>Temperature</Text>
        <Text style={styles.sliderValueText}>{preferences.temperature.toFixed(1)}</Text>
      </View>
      <Slider
        style={styles.sliderBar}
        minimumValue={0.0}
        maximumValue={2.0}
        step={0.1}
        value={preferences.temperature}
        onValueChange={(val) => setPreferences(prev => ({ ...prev, temperature: val }))}
        minimumTrackTintColor="#e5e5e5"
        maximumTrackTintColor="#2d2d2d"
        thumbTintColor="#e5e5e5"
      />

      <View style={styles.sliderLabelRow}>
        <Text style={styles.inputLabel}>Max Tokens</Text>
        <Text style={styles.sliderValueText}>{preferences.maxTokens}</Text>
      </View>
      <Slider
        style={styles.sliderBar}
        minimumValue={128}
        maximumValue={4096}
        step={128}
        value={preferences.maxTokens}
        onValueChange={(val) => setPreferences(prev => ({ ...prev, maxTokens: Math.round(val) }))}
        minimumTrackTintColor="#e5e5e5"
        maximumTrackTintColor="#2d2d2d"
        thumbTintColor="#e5e5e5"
      />

      <View style={styles.toggleRow}>
        <View style={styles.toggleTextContainer}>
          <Text style={styles.toggleLabel}>Remember Context</Text>
          <Text style={styles.toggleSubtitle}>Includes history logs inside data parameters</Text>
        </View>
        <Switch
          trackColor={{ false: '#2d2d2d', true: '#525252' }}
          thumbColor={preferences.rememberConversation ? '#ececf1' : '#a3a3a3'}
          value={preferences.rememberConversation}
          onValueChange={(val) => setPreferences(prev => ({ ...prev, rememberConversation: val }))}
        />
      </View>

      <View style={styles.divider} />
      <Text style={styles.sidebarCaption}>Engine v1.0.0 · Core Dark</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardContainer}
      >
        <View style={styles.appLayout}>
          
          {!isMobile && (
            <View style={styles.desktopSidebar}>
              {renderSidebarContent()}
            </View>
          )}

          {isMobile && (
            <View 
              style={[
                styles.mobileDrawerOverlay, 
                { pointerEvents: isMobileMenuOpen ? 'auto' : 'none' } as any
              ]}
            >
              {isMobileMenuOpen && (
                <TouchableOpacity 
                  style={styles.backdropTouch} 
                  activeOpacity={1} 
                  onPress={() => setIsMobileMenuOpen(false)} 
                />
              )}
              
              <Animated.View 
                style={[
                  styles.mobileSidebar, 
                  { transform: [{ translateX: slideAnim }] }
                ]}
              >
                {renderSidebarContent()}
              </Animated.View>
            </View>
          )}

          <View style={styles.chatArea}>
            <HeaderBar 
              provider={preferences.provider} 
              isMobile={isMobile} 
              onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            />

            <ScrollView 
              ref={scrollViewRef}
              style={styles.scrollContainer}
              contentContainerStyle={[styles.scrollContent, messages.length === 0 && styles.scrollContentEmpty]}
              onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            >
              {messages.length === 0 ? (
                <View style={styles.welcomeContainer}>
                  <Text style={[styles.welcomeTitle, { fontSize: windowWidth < 450 ? 24 : 32 }]}>
                    What’s on your mind?
                  </Text>
                  <Text style={[styles.welcomeSubtitle, { fontSize: windowWidth < 450 ? 14 : 15 }]}>
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
                  />
                ))
              )}
            </ScrollView>

            <InputBar onSubmit={(text) => sendMessage(text)} />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0d0d' }, 
  keyboardContainer: { flex: 1 },
  appLayout: { flex: 1, flexDirection: 'row' },
  
  desktopSidebar: { width: 260, backgroundColor: '#171717', borderRightWidth: 1, borderRightColor: '#222222' },
  mobileDrawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, flexDirection: 'row' },
  backdropTouch: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)' },
  mobileSidebar: { width: 260, height: '100%', backgroundColor: '#171717', borderRightWidth: 1, borderRightColor: '#222222', position: 'absolute', left: 0 },
  sidebarInner: { flex: 1, padding: 16 },

  sidebarTitle: { color: '#737373', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  inputLabel: { color: '#a3a3a3', fontSize: 12, fontWeight: '600', marginBottom: 4 },
  sidebarCaption: { color: '#404040', fontSize: 11, marginTop: 'auto' },
  divider: { height: 1, backgroundColor: '#222222', marginVertical: 12 },

  compactRow: { flexDirection: 'row', gap: 6, width: '100%', marginBottom: 12 },
  pillButton: { flex: 1, paddingVertical: 8, backgroundColor: '#1a1a1a', borderRadius: 6, borderWidth: 1, borderColor: '#2d2d2d', alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: '#e5e5e5', borderColor: '#e5e5e5' },
  pillText: { color: '#a3a3a3', fontSize: 11, fontWeight: '600' },
  pillTextActive: { color: '#0d0d0d' },

  tokenInput: { width: '100%', height: 36, backgroundColor: '#1a1a1a', borderRadius: 6, borderWidth: 1, borderColor: '#2d2d2d', paddingHorizontal: 10, color: '#ececf1', fontSize: 12, marginBottom: 16 },

  sliderLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  sliderValueText: { color: '#ececf1', fontSize: 12, fontWeight: '700' },
  sliderBar: { width: '100%', height: 30, marginBottom: 4 },

  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 4, width: '100%' },
  toggleTextContainer: { flex: 1, paddingRight: 8 },
  toggleLabel: { color: '#a3a3a3', fontSize: 12, fontWeight: '600' },
toggleSubtitle: { color: '#525252', fontSize: 10, marginTop: 2 },
chatArea: { flex: 1, backgroundColor: '#0d0d0d', paddingHorizontal: 16, paddingTop: 10 },
scrollContainer: { flex: 1 },
scrollContent: { paddingVertical: 20 },
scrollContentEmpty: { flexGrow: 1, justifyContent: 'center' },
welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', maxWidth: 680, alignSelf: 'center', width: '100%' },
welcomeTitle: { color: '#ececf1', fontWeight: '700', textAlign: 'center' },
welcomeSubtitle: { color: '#a3a3a3', textAlign: 'center', marginTop: 12 }
});