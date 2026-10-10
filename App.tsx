import React, { useRef, useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView,        // FIXED: Added missing ScrollView import
  TouchableOpacity,  // FIXED: Added missing TouchableOpacity import
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
    preferences, setPreferences, sendMessage, ingestFileWithProgress, clearActiveFilesContext 
  } = useChatEngine();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [windowWidth, setWindowWidth] = useState(Dimensions.get('window').width);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isMobile = windowWidth < 768;

  const isDark = preferences.theme === 'dark';
  const slideAnim = useRef(new Animated.Value(-260)).current;

  // ROUTING EVALUATION: If RAG is on but no files are loaded, go to document setup screen
  const isShowUploadWizard = preferences.ragEnabled && indexedFiles.length === 0 && ragProcessingStep !== 'SUCCESS';

  useEffect(() => {
    const sub = Dimensions.addEventListener('change', ({ window }) => setWindowWidth(window.width));
    return () => sub.remove();
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
        * { scrollbar-width: thin !important; scrollbar-color: ${isDark ? '#2f2f2f transparent' : '#d5d5d5 transparent'} !important; }
        ::-webkit-scrollbar { width: 8px !important; height: 8px !important; }
        ::-webkit-scrollbar-thumb { background-color: ${isDark ? '#2f2f2f' : '#cbd5e1'} !important; border-radius: 99px !important; }
      `;
    }
  }, [isDark]);

  const renderSidebar = () => (
    <SidebarOptions preferences={preferences} setPreferences={setPreferences} isDark={isDark} />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardContainer}>
        <View style={styles.appLayout}>
          
          {!isMobile && <View style={[styles.desktopSidebar, { backgroundColor: isDark ? '#171717' : '#f9f9f9', borderColor: isDark ? '#222222' : '#e5e5e5' }]}>{renderSidebar()}</View>}

          {isMobile && (
            <View style={styles.mobileDrawerOverlay} pointerEvents={isMobileMenuOpen ? 'auto' : 'none'}>
              {isMobileMenuOpen && <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={() => setIsMobileMenuOpen(false)} />}
              <Animated.View style={[styles.mobileSidebar, { transform: [{ translateX: slideAnim }], backgroundColor: isDark ? '#171717' : '#f9f9f9', borderColor: isDark ? '#222222' : '#e5e5e5' }]}>{renderSidebar()}</Animated.View>
            </View>
          )}

          <View style={[styles.chatArea, isShowUploadWizard && styles.centerStage, { backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }]}>
            {/* DYNAMIC SCREEN ROUTER INTERACTION LAYER */}
            {isShowUploadWizard ? (
              <DocumentUploadStage 
                preferences={preferences} setPreferences={setPreferences} 
                ragProcessingStep={ragProcessingStep} ingestFileWithProgress={ingestFileWithProgress} isDark={isDark} 
              />
            ) : (
              <ChatWorkspaceStage 
                messages={messages} 
  isTyping={isTyping} 
  indexedFiles={indexedFiles} 
  clearActiveFilesContext={clearActiveFilesContext}
  sendMessage={sendMessage} 
  ingestFileWithProgress={ingestFileWithProgress} // LINKED: Maps the on-the-fly method trigger cleanly
  provider={preferences.provider} 
  theme={preferences.theme} 
  ragEnabled={preferences.ragEnabled}
  isMobile={isMobile} 
  onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
  windowWidth={windowWidth} 
  scrollViewRef={scrollViewRef as any}
                />
            )}
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
  chatArea: { flex: 1, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 8, width: '100%' },
  centerStage: { justifyContent: 'center', alignItems: 'center' }
});
