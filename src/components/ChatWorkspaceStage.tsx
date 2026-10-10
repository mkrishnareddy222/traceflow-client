import React from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Platform } from 'react-native';
import { ChatBubble } from './ChatBubble';
import { InputBar } from './InputBar';
import { HeaderBar } from './HeaderBar';
import { Message, UploadedFile } from '../types/chat';
import * as DocumentPicker from 'expo-document-picker'; // Injected picker component for dynamic on-the-fly selections

interface ChatStageProps {
  messages: Message[];
  isTyping: boolean;
  indexedFiles: UploadedFile[];
  clearActiveFilesContext: () => void;
  sendMessage: (text: string) => Promise<void>;
  ingestFileWithProgress: (fileObj: any) => Promise<void>; // Added contract to hook straight into wizard loaders
  provider: string;
  theme: 'light' | 'dark';
  ragEnabled: boolean;
  isMobile: boolean;
  onToggleMenu: () => void;
  windowWidth: number;
  scrollViewRef: React.RefObject<ScrollView>;
}

export const ChatWorkspaceStage: React.FC<ChatStageProps> = ({
  messages, isTyping, indexedFiles, clearActiveFilesContext, sendMessage, ingestFileWithProgress,
  provider, theme, ragEnabled, isMobile, onToggleMenu, windowWidth, scrollViewRef
}) => {
  const isDark = theme === 'dark';

  // ON-THE-FLY TRIGGER: Captures attachments inside chat and pipes them directly to /api/rag/upload
  const handleOnTheFlyPick = async () => {
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
      console.error('On-the-fly selection failed:', err);
    }
  };

  return (
    <View style={styles.chatAreaInner}>
      <HeaderBar provider={provider} isMobile={isMobile} onToggleMenu={onToggleMenu} />

      {ragEnabled && indexedFiles.length > 0 && (
        <View style={[styles.contextBanner, { backgroundColor: isDark ? '#171717' : '#f3e8ff', borderColor: isDark ? '#222222' : '#e9d5ff' }]}>
          <Text style={{ color: isDark ? '#10b981' : '#581c87', fontSize: 12, fontWeight: '700', flex: 1 }} numberOfLines={1}>
            ⚡ SOURCE KNOWLEDGE LAYER ({indexedFiles.length} Docs Indexed): {indexedFiles.map(f => f.name).join(', ')}
          </Text>
          <View style={styles.bannerActionRow}>
            {/* NEW ACTION: Click this to append new text chunks mid-conversation */}
            <TouchableOpacity onPress={handleOnTheFlyPick} style={styles.appendBtn}>
              <Text style={{ color: '#10b981', fontSize: 11, fontWeight: 'bold' }}>➕ APPEND FILE</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={clearActiveFilesContext}>
              <Text style={{ color: '#ef4444', fontSize: 11, fontWeight: 'bold', marginLeft: 12 }}>WIPE</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

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
            <ChatBubble key={msg.id} item={msg} isTyping={isTyping} isLast={index === messages.length - 1} theme={theme} />
          ))
        )}
      </ScrollView>

      {/* Kept minimal without duplicate icon layers inside the main input line text tray */}
      <InputBar onSubmit={sendMessage} theme={theme} ragEnabled={false} isFileUploading={false} ingestFileWithProgress={async () => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  chatAreaInner: { flex: 1, width: '100%' },
  scrollContainer: { flex: 1, maxWidth: 720, width: '100%', alignSelf: 'center' },
  scrollContent: { paddingVertical: 20 },
  scrollContentEmpty: { flexGrow: 1, justifyContent: 'center' },
  welcomeContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', maxWidth: 680, alignSelf: 'center', width: '100%' },
  welcomeTitle: { fontWeight: '700', textAlign: 'center' },
  welcomeSubtitle: { textAlign: 'center', marginTop: 12 },
  contextBanner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, marginVertical: 6, borderRadius: 10, borderWidth: 1, maxWidth: 720, width: '100%', alignSelf: 'center' },
  bannerActionRow: { flexDirection: 'row', alignItems: 'center' },
  appendBtn: { paddingHorizontal: 8, paddingVertical: 4, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 6, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' }
});
