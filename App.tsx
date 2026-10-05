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
  Animated,
  Easing,
  Dimensions
} from 'react-native';
import { useChatEngine } from './src/hooks/useChatEngine';
import { ChatBubble } from './src/components/ChatBubble';
import { InputBar } from './src/components/InputBar';
import { HeaderBar } from './src/components/HeaderBar';
import { SidebarOptions } from './src/components/SidebarOptions';
import { UploadedFile } from './src/types/chat';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#0d0d0d' : '#ffffff' }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardContainer}>
        <View style={styles.appLayout}>
          
          {!isMobile && (
            <View style={[styles.desktopSidebar, { backgroundColor: isDark ? '#171717' : '#f9f9f9', borderColor: isDark ? '#222222' : '#e5e5e5' }]}>
              <SidebarOptions preferences={preferences} setPreferences={setPreferences} isDark={isDark} />
            </View>
          )}

          {isMobile && (
            <View style={styles.mobileDrawerOverlay} pointerEvents={isMobileMenuOpen ? 'auto' : 'none'}>
              {isMobileMenuOpen && (
                <TouchableOpacity style={styles.backdropTouch} activeOpacity={1} onPress={() => setIsMobileMenuOpen(false)} />
              )}
              <Animated.View style={[styles.mobileSidebar, { transform: [{ translateX: slideAnim }], backgroundColor: isDark ? '#171717' : '#f9f9f9', borderColor: isDark ? '#222222' : '#e5e5e5' }]}>
                <SidebarOptions preferences={preferences} setPreferences={setPreferences} isDark={isDark} />
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
                  <ChatBubble key={msg.id} item={msg} isTyping={isTyping} isLast={index === messages.length - 1} theme={preferences.theme} />
                ))
              )}
            </ScrollView>

            <InputBar onSubmit={sendMessage} theme={preferences.theme} ragEnabled={preferences.ragEnabled} />
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
   scrollContainer: { 
    flex: 1,
    maxWidth: 720,        // Locks the text conversation streams cleanly to a standard column size
    width: '100%',
    alignSelf: 'center',  // Centers the scrolling chat bubbles horizontally down the vertical spine of the page
  },
  scrollContent: { paddingVertical: 20 },
  scrollContentEmpty: { flexGrow: 1, justifyContent: 'center' },
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', maxWidth: 680, alignSelf: 'center', width: '100%' },
  welcomeTitle: { fontWeight: '700', textAlign: 'center' },
  welcomeSubtitle: { textAlign: 'center', marginTop: 12 }
});
