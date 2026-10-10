import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, Animated, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message, SourceMetadata } from '../types/chat';

interface ChatBubbleProps {
  item: Message;
  isTyping: boolean;
  isLast: boolean;
  theme: 'light' | 'dark'; // Dynamic design token interface parameter pass
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ item, isTyping, isLast, theme }) => {
  const isUser = item.sender === 'user';
  const isDark = theme === 'dark';
  const showCursor = isTyping && isLast && !isUser;
  
  const [cursorOpacity] = useState(new Animated.Value(1));

  useEffect(() => {
    if (showCursor) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(cursorOpacity, { toValue: 1, duration: 400, useNativeDriver: true })
        ])
      ).start();
    } else {
      cursorOpacity.setValue(1);
    }
  }, [showCursor, cursorOpacity]);

  // Dynamic Markdown Style Lookup Selector Map Layer
  const activeMarkdownTheme = isUser 
    ? (isDark ? userMarkdownDark : userMarkdownLight) 
    : (isDark ? botMarkdownDark : botMarkdownLight);

  return (
    <View style={styles.rowContainer}>
      <View style={[
        styles.messageContentBlock, 
        isUser ? styles.userDirection : styles.botDirection
      ]}>
        
        {/* AVATAR SYSTEM MODULE */}
        <View style={[
          styles.avatarCircle, 
          isUser ? styles.userAvatar : styles.botAvatar,
          isUser ? styles.userAvatarMargin : styles.botAvatarMargin
        ]}>
          <Text style={styles.avatarText}>{isUser ? 'U' : 'T'}</Text>
        </View>

        {/* ALIGNMENT WORKSPACE CONTAINER */}
        <View style={[styles.textContainer, isUser ? styles.userAlign : styles.botAlign]}>
          {item.activeAgentStep && (
            <Text style={[styles.agentTag, { color: isDark ? '#525252' : '#a3a3a3' }]}>◈ {item.activeAgentStep}</Text>
          )}

          {/* DYNAMIC LOOKUP: Conditional design skin selection logic mapping */}
          <View style={[
            isUser ? (isDark ? styles.userBubbleDark : styles.userBubbleLight) : styles.botBubble
          ]}>
            <View style={styles.markdownWrapper}>
              <Markdown style={activeMarkdownTheme}>
                {item.text}
              </Markdown>

              {item.sources && item.sources.length > 0 && (
                <View style={[styles.sources, { borderTopColor: isDark ? '#2f2f2f' : '#e5e7eb' }]}>
                  <Text style={[styles.sourcesTitle, { color: isDark ? '#a3a3a3' : '#6b7280' }]}>Sources</Text>
                  {item.sources.map((source, index) => (
                    <Text
                      key={`${source.source}-${source.page_number ?? index}`}
                      style={[styles.sourceText, { color: isDark ? '#9ca3af' : '#6b7280' }]}
                    >
                      {formatSourceMetadata(source)}
                    </Text>
                  ))}
                </View>
              )}
              
              {showCursor && (
                <Animated.Text style={[styles.cursor, { color: isDark ? '#ececf1' : '#0d0d0d', opacity: cursorOpacity }]}>
                  ▍
                </Animated.Text>
              )}
            </View>
          </View>
        </View>

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rowContainer: { width: '100%', paddingVertical: 12, flexDirection: 'row', justifyContent: 'center' },
  messageContentBlock: { width: '100%', maxWidth: 720, alignItems: 'flex-start', paddingHorizontal: 16 },
  userDirection: { flexDirection: 'row-reverse' }, 
  botDirection: { flexDirection: 'row' },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  userAvatarMargin: { marginLeft: 14 }, 
  botAvatarMargin: { marginRight: 14 },
  userAvatar: { backgroundColor: '#4b5563' }, 
  botAvatar: { backgroundColor: '#10b981' }, 
  avatarText: { color: '#ececf1', fontSize: 12, fontWeight: '700' },
  textContainer: { flex: 1 },
  userAlign: { alignItems: 'flex-end' },
  botAlign: { alignItems: 'flex-start' },

  // ============================================================
  // BRAND STYLING SUITE: Light Purple Accent Tone Contracts
  // ============================================================
  userBubbleDark: { 
    backgroundColor: '#2e1065',       // Deep Royal Velvet Purple for Dark Mode
    borderRadius: 18, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    maxWidth: Platform.OS === 'web' ? '70%' : '85%',
    borderWidth: 1,
    borderColor: '#4c1d95'            // Rich Purple outline depth line accent
  },
  userBubbleLight: { 
    backgroundColor: '#f3e8ff',      // Soft Pastel Light Lavender Purple for Light Mode
    borderRadius: 18, 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    maxWidth: Platform.OS === 'web' ? '70%' : '85%', 
    borderWidth: 1, 
    borderColor: '#e9d5ff'            // Clean Lavender border edge line accent
  },
  
  // Assistant response track retains flat, zero border minimalist properties
  botBubble: { backgroundColor: 'transparent', width: '100%', paddingTop: 2 },

  markdownWrapper: { flexDirection: 'column', alignItems: 'flex-start', width: '100%' },
  sources: { width: '100%', borderTopWidth: 1, marginTop: 12, paddingTop: 8 },
  sourcesTitle: { fontSize: 11, fontWeight: '700', marginBottom: 4 },
  sourceText: { fontSize: 11, lineHeight: 17 },
  agentTag: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  cursor: { fontSize: 16, fontWeight: 'bold', marginTop: 4, alignSelf: 'flex-start' }
});

const formatSourceMetadata = (source: SourceMetadata) =>
  [
    `Source: ${source.source}`,
    source.session_id && `Session: ${source.session_id}`,
    source.file_type && `Type: ${source.file_type}`,
    source.page_number !== undefined && `Page: ${source.page_number}`,
    source.uploaded_at && `Uploaded: ${source.uploaded_at}`,
    source.chunk_number !== undefined && `Chunk: ${source.chunk_number}`,
  ]
    .filter((detail): detail is string => Boolean(detail))
    .join(' · ');

// Markdown Syntax Styling Maps Rules (Plain JavaScript configurations)
const sharedMarkdownRules = {
  body: { fontSize: 15, lineHeight: 24 },
  strong: { fontWeight: 'bold' as const },
  bullet_list: { marginVertical: 4, paddingLeft: 10 },
  ordered_list: { marginVertical: 4, paddingLeft: 10 },
  list_item: { marginVertical: 2 },
};

// Target font color balances configured to retain strong typography contrast ratios
const userMarkdownDark = { ...sharedMarkdownRules, body: { ...sharedMarkdownRules.body, color: '#f5f3ff' } };
const userMarkdownLight = { ...sharedMarkdownRules, body: { ...sharedMarkdownRules.body, color: '#581c87' } }; // Deep indigo-purple text for crisp text visibility
const botMarkdownDark = { 
  ...sharedMarkdownRules, 
  body: { ...sharedMarkdownRules.body, color: '#d1d5db' }, 
  code_inline: { backgroundColor: '#1e1e1e', color: '#ececf1', padding: 2, borderRadius: 4 } 
};
const botMarkdownLight = { 
  ...sharedMarkdownRules, 
  body: { ...sharedMarkdownRules.body, color: '#1f2937' }, 
  code_inline: { backgroundColor: '#f3f4f6', color: '#1f2937', padding: 2, borderRadius: 4 } 
};
