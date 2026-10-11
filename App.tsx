import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView,
  TouchableOpacity,
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Text,
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { useChatEngine } from './src/hooks/useChatEngine';
import { SidebarOptions } from './src/components/SidebarOptions';
import { DocumentUploadStage } from './src/components/DocumentUploadStage';
import { ChatWorkspaceStage } from './src/components/ChatWorkspaceStage';

export default function App() {
  const { 
    messages, isTyping, ragProcessingStep, indexedFiles, 
    preferences, setPreferences, sendMessage, ingestFileWithProgress, clearActiveFilesContext, clearMessages
  } = useChatEngine();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = windowWidth < 768;

  const isDark = preferences.theme === 'dark';
  const slideAnim = useRef(new Animated.Value(-280)).current;

  const isShowUploadWizard = preferences.ragEnabled && indexedFiles.length === 0 && ragProcessingStep !== 'SUCCESS';

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setWindowWidth(window.width));
    return () => sub.remove();
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isMobileMenuOpen ? 0 : -280,
      duration: 260,
      easing: Easing.bezier(0.25, 1, 0.5, 1),
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [isMobileMenuOpen, slideAnim]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const styleId = 'traceflow-global-scroll-fix';
      let tag = document.getElementById(styleId) as HTMLStyleElement;
      if (!tag) {
        tag = document.createElement('style');
        tag.id = styleId;
        document.head.appendChild(tag);
      }
      tag.innerHTML = `
        * { scrollbar-width: thin !important; scrollbar-color: ${isDark ? '#26262a transparent' : '#d5d5d5 transparent'} !important; }
        ::-webkit-scrollbar { width: 6px !important; height: 6px !important; }
        ::-webkit-scrollbar-thumb { background-color: ${isDark ? '#26262a' : '#cbd5e1'} !important; border-radius: 99px !important; }
      `;
    }
  }, [isDark]);

  const handleThemeMutation = (theme: 'light' | 'dark') => {
    setPreferences(prev => ({ ...prev, theme }));
  };

  const handleProviderMutation = (provider: 'groq' | 'openai' | 'gemini') => {
    setPreferences(prev => ({ ...prev, provider }));
  };

  const handleTokenMutation = (text: string) => {
    setPreferences(prev => ({
      ...prev,
      apiTokens: { ...prev.apiTokens, [prev.provider]: text }
    }));
  };

  const renderSidebar = () => (
    <SidebarOptions
      preferences={preferences}
      onThemeChange={handleThemeMutation}
      onProviderChange={handleProviderMutation}
      onTokenChange={handleTokenMutation}
      onTemperatureChange={(val) => setPreferences(prev => ({ ...prev, temperature: val }))}
      onMaxTokensChange={(val) => setPreferences(prev => ({ ...prev, maxTokens: val }))}
      onRememberToggle={(val) => setPreferences(prev => ({ ...prev, rememberConversation: val }))}
      onRagToggle={(val) => setPreferences(prev => ({ ...prev, ragEnabled: val }))}
      isDark={isDark}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#09090b' : '#ffffff' }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardContainer}>
        <View style={styles.appLayout}>
          {!isMobile && (
            <View style={[styles.desktopSidebar, { backgroundColor: isDark ? '#101215' : '#f4f4f5', borderColor: isDark ? '#202226' : '#e4e4e7' }]}>
              {renderSidebar()}
            </View>
          )}

          <View style={[styles.chatArea, isShowUploadWizard && styles.centerStage, { backgroundColor: isDark ? '#09090b' : '#ffffff' }]}>
            {isShowUploadWizard ? (
              <DocumentUploadStage 
                preferences={preferences} setPreferences={setPreferences} 
                ragProcessingStep={ragProcessingStep} ingestFileWithProgress={ingestFileWithProgress} isDark={isDark} 
              />
            ) : (
              <ChatWorkspaceStage 
                messages={messages} isTyping={isTyping} indexedFiles={indexedFiles} clearActiveFilesContext={clearActiveFilesContext}
                sendMessage={sendMessage} onNewChat={clearMessages} ingestFileWithProgress={ingestFileWithProgress} isFileUploading={ragProcessingStep !== 'IDLE'}
                provider={preferences.provider} theme={preferences.theme} ragEnabled={preferences.ragEnabled}
                maxTokens={preferences.maxTokens} isMobile={isMobile} onToggleMenu={() => setIsMobileMenuOpen(open => !open)}
                windowWidth={windowWidth} scrollViewRef={scrollViewRef as any}
              />
            )}
          </View>

          {isMobile && (
            <View style={[styles.mobileDrawerOverlay, { pointerEvents: isMobileMenuOpen ? 'auto' : 'none' }]}>
              {isMobileMenuOpen && (
                <TouchableOpacity
                  style={styles.backdropTouch}
                  activeOpacity={1}
                  onPress={() => setIsMobileMenuOpen(false)}
                  accessibilityLabel="Close settings"
                />
              )}
              <Animated.View style={[
                styles.mobileSidebar,
                { transform: [{ translateX: slideAnim }], backgroundColor: isDark ? '#101215' : '#f4f4f5', borderColor: isDark ? '#202226' : '#e4e4e7' }
              ]}>
                {renderSidebar()}
              </Animated.View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardContainer: { flex: 1 },
  appLayout: { flex: 1, flexDirection: 'row' },
  desktopSidebar: { width: 270, borderRightWidth: 1 },
  mobileDrawerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999, flexDirection: 'row' },
  backdropTouch: { position: 'absolute', width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)' },
  mobileSidebar: { width: 280, maxWidth: '85%', height: '100%', borderRightWidth: 1, position: 'absolute', left: 0 },
  chatArea: { flex: 1, paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0, width: '100%' },
  centerStage: { justifyContent: 'center', alignItems: 'center' }
});
