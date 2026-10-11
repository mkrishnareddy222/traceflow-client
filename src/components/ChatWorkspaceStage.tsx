import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { ChatBubble } from './ChatBubble';
import { InputBar } from './InputBar';
import { HeaderBar } from './HeaderBar';
import { Message, UploadedFile } from '../types/chat';

interface ChatStageProps {
  messages: Message[];
  isTyping: boolean;
  indexedFiles: UploadedFile[];
  clearActiveFilesContext: () => void;
  sendMessage: (text: string) => Promise<void>;
  onNewChat: () => void;
  ingestFileWithProgress: (fileObj: any) => Promise<void>;
  isFileUploading: boolean;
  provider: string;
  maxTokens: number;
  theme: 'light' | 'dark';
  ragEnabled: boolean;
  isMobile: boolean;
  onToggleMenu: () => void;
  windowWidth: number;
  scrollViewRef: React.RefObject<ScrollView>;
}

export const ChatWorkspaceStage: React.FC<ChatStageProps> = ({
  messages, isTyping, indexedFiles, clearActiveFilesContext, sendMessage, onNewChat, ingestFileWithProgress, isFileUploading,
  provider, maxTokens, theme, ragEnabled, isMobile, onToggleMenu, windowWidth, scrollViewRef
}) => {
  const isDark = theme === 'dark';

  return (
    <View style={styles.chatAreaInner}>
      <HeaderBar provider={provider} isMobile={isMobile} onToggleMenu={onToggleMenu} onNewChat={onNewChat} theme={theme} />

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          windowWidth < 768 && styles.scrollContentMobile,
          messages.length === 0 && styles.scrollContentEmpty,
          messages.length === 0 && windowWidth < 768 && styles.scrollContentEmptyMobile,
        ]}
        onContentSizeChange={() => {
          if (messages.length > 0) scrollViewRef.current?.scrollToEnd({ animated: true });
        }}
      >
        {messages.length === 0 ? (
          <View style={[styles.welcomeContainer, windowWidth < 768 && styles.welcomeContainerMobile]}>
            <View style={[styles.sparkIconCircle, windowWidth < 768 && styles.sparkIconCircleMobile]}>
              <Text style={styles.sparkIconText}>✦</Text>
              <Text style={styles.sparkIconSmall}>✦</Text>
            </View>
            <Text style={[styles.eyebrowTag, windowWidth < 768 && styles.eyebrowTagMobile]}>AI THINKING PARTNER</Text>

            <Text style={[styles.welcomeTitle, windowWidth < 768 && styles.welcomeTitleMobile, { color: isDark ? '#ffffff' : '#09090b' }]}>
              What are you working on?
            </Text>

            <Text style={[styles.welcomeSubtitle, windowWidth < 768 && styles.welcomeSubtitleMobile, { color: isDark ? '#71717a' : '#4b5563' }]}>
              Ask a question, explore an idea, or turn on RAG to chat with your documents.
            </Text>

            <View style={[
              styles.suggestionsRow,
              windowWidth < 520 ? styles.suggestionsRowMobile : undefined,
              { flexDirection: windowWidth < 768 ? 'column' : 'row' },
            ]}>
              <TouchableOpacity
                style={[styles.suggestionCard, { backgroundColor: isDark ? '#111316' : '#f9fafb', borderColor: isDark ? '#22252a' : '#e5e7eb' }]}
                onPress={() => sendMessage('Analyze a topic and break down something complex')}
              >
                <View style={styles.suggestionIcon}>
                  <Text style={styles.suggestionIconText}>⌕</Text>
                </View>
                <View style={styles.suggestionCopy}>
                  <Text style={[styles.suggestionTitle, { color: isDark ? '#e4e4e7' : '#18181b' }]}>Analyze a topic</Text>
                  <Text style={[styles.suggestionDescription, { color: isDark ? '#71717a' : '#71717a' }]}>Break down something complex</Text>
                </View>
                <Text style={[styles.suggestionArrow, { color: isDark ? '#71717a' : '#71717a' }]}>›</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.suggestionCard, { backgroundColor: isDark ? '#111316' : '#f9fafb', borderColor: isDark ? '#22252a' : '#e5e7eb' }]}
                onPress={() => sendMessage('Help me draft content starting from a rough outline')}
              >
                <View style={styles.suggestionIcon}>
                  <Text style={styles.suggestionIconText}>▤</Text>
                </View>
                <View style={styles.suggestionCopy}>
                  <Text style={[styles.suggestionTitle, { color: isDark ? '#e4e4e7' : '#18181b' }]}>Draft content</Text>
                  <Text style={[styles.suggestionDescription, { color: isDark ? '#71717a' : '#71717a' }]}>Start from an idea or outline</Text>
                </View>
                <Text style={[styles.suggestionArrow, { color: isDark ? '#71717a' : '#71717a' }]}>›</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          messages.map((msg, index) => (
            <ChatBubble key={msg.id} item={msg} isTyping={isTyping} isLast={index === messages.length - 1} theme={theme} />
          ))
        )}
      </ScrollView>

      <InputBar
        onSubmit={sendMessage}
        ingestFileWithProgress={ingestFileWithProgress}
        theme={theme}
        ragEnabled={ragEnabled}
        isFileUploading={isFileUploading}
        indexedFiles={indexedFiles}
        clearActiveFilesContext={clearActiveFilesContext}
        provider={provider}
        maxTokens={maxTokens}
      />
      <Text style={[styles.disclaimer, { color: isDark ? '#52525b' : '#9ca3af' }]}>
        TraceFlow can make mistakes. Check important information.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  chatAreaInner: { flex: 1, width: '100%' },
  scrollContainer: { flex: 1, width: '100%', alignSelf: 'center' },
  scrollContent: { paddingTop: 48, paddingBottom: 20 },
  scrollContentMobile: { paddingTop: 8 },
  scrollContentEmpty: { flexGrow: 1, justifyContent: 'flex-start' },
  scrollContentEmptyMobile: { justifyContent: 'flex-start' },
  welcomeContainer: { width: '100%', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 24 },
  welcomeContainerMobile: { paddingVertical: 6 },
  sparkIconCircle: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#0c1715', borderWidth: 1, borderColor: '#153b32', justifyContent: 'center', alignItems: 'center', marginBottom: 22 },
  sparkIconCircleMobile: { width: 42, height: 42, marginBottom: 12 },
  sparkIconText: { color: '#10b981', fontSize: 22, fontWeight: '700', lineHeight: 24 },
  sparkIconSmall: { position: 'absolute', color: '#10b981', fontSize: 9, top: 27, left: 18 },
  eyebrowTag: { color: '#10b981', fontSize: 10, fontWeight: '700', letterSpacing: 1.1, marginBottom: 10 },
  eyebrowTagMobile: { marginBottom: 7 },
  welcomeTitle: { fontSize: 32, fontWeight: '600', textAlign: 'center', letterSpacing: -0.8 },
  welcomeTitleMobile: { fontSize: 26, letterSpacing: -0.5 },
  welcomeSubtitle: { fontSize: 12, textAlign: 'center', marginTop: 11, maxWidth: 520, lineHeight: 18 },
  welcomeSubtitleMobile: { marginTop: 8 },
  suggestionsRow: { flexDirection: 'row', gap: 10, width: '100%', maxWidth: 490, marginTop: 26 },
  suggestionsRowMobile: { marginTop: 12 },
  suggestionCard: { flex: 1, minHeight: 54, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center' },
  suggestionIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: 'rgba(16,185,129,0.09)', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  suggestionIconText: { color: '#10b981', fontSize: 17 },
  suggestionCopy: { flex: 1 },
  suggestionTitle: { fontSize: 10, fontWeight: '600', marginBottom: 3 },
  suggestionDescription: { fontSize: 8 },
  suggestionArrow: { fontSize: 18, marginLeft: 5 },
  disclaimer: { width: '100%', textAlign: 'center', fontSize: 9, paddingBottom: 4 }
});
