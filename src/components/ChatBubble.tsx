import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, Animated, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '../types/chat';

interface ChatBubbleProps {
  item: Message;
  isTyping: boolean;
  isLast: boolean;
  theme: 'light' | 'dark'; // Instantly reads state transformations mapping down
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
  }, [showCursor]);

  // Construct functional dynamic markdown color token maps variables inline
  const activeMarkdownTheme = isUser 
    ? (isDark ? userMarkdownDark : userMarkdownLight) 
    : (isDark ? botMarkdownDark : botMarkdownLight);

  return (
    <View style={styles.rowContainer}>
      <View style={[styles.messageContentBlock, isUser ? styles.userDirection : styles.botDirection]}>
        
        <View style={[
          styles.avatarCircle, 
          isUser ? styles.userAvatar : styles.botAvatar,
          isUser ? styles.userAvatarMargin : styles.botAvatarMargin
        ]}>
          <Text style={styles.avatarText}>{isUser ? 'U' : 'T'}</Text>
        </View>

        <View style={[styles.textContainer, isUser ? styles.userAlign : styles.botAlign]}>
          {item.activeAgentStep && (
            <Text style={[styles.agentTag, { color: isDark ? '#525252' : '#a3a3a3' }]}>◈ {item.activeAgentStep}</Text>
          )}

          {/* DYNAMIC LOOKUP: Swaps text bubble containers dynamically depending on active state settings */}
          <View style={[
            isUser ? (isDark ? styles.userBubbleDark : styles.userBubbleLight) : styles.botBubble
          ]}>
            <View style={styles.markdownWrapper}>
              <Markdown style={activeMarkdownTheme}>
                {item.text}
              </Markdown>
              
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

  // Theme Specific Dynamic Bubble Shell Maps
  userBubbleDark: { backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '85%' },
  userBubbleLight: { backgroundColor: '#f4f4f4', borderRadius: 18, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '85%', borderWidth: 1, borderColor: '#e5e5e5' },
  botBubble: { backgroundColor: 'transparent', width: '100%', paddingTop: 2 },

  markdownWrapper: { flexDirection: 'column', alignItems: 'flex-start', width: '100%' },
  agentTag: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  cursor: { fontSize: 16, fontWeight: 'bold', marginTop: 4, alignSelf: 'flex-start' }
});

// Markdown Syntax Maps Layout Configs
const sharedMarkdownRules = {
  body: { fontSize: 15, lineHeight: 24 },
  strong: { fontWeight: 'bold' as const },
  bullet_list: { marginVertical: 4, paddingLeft: 10 },
  ordered_list: { marginVertical: 4, paddingLeft: 10 },
};

const userMarkdownDark = { ...sharedMarkdownRules, body: { ...sharedMarkdownRules.body, color: '#f3f4f6' } };
const userMarkdownLight = { ...sharedMarkdownRules, body: { ...sharedMarkdownRules.body, color: '#0d0d0d' } };
const botMarkdownDark = { ...sharedMarkdownRules, body: { ...sharedMarkdownRules.body, color: '#d1d5db' }, code_inline: { backgroundColor: '#1e1e1e', color: '#ececf1', padding: 2, borderRadius: 4 } };
const botMarkdownLight = { ...sharedMarkdownRules, body: { ...sharedMarkdownRules.body, color: '#1f2937' }, code_inline: { backgroundColor: '#f3f4f6', color: '#1f2937', padding: 2, borderRadius: 4 } };
