import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Platform, Animated, Text } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '../types/chat';

interface ChatBubbleProps {
  item: Message;
  isTyping: boolean;
  isLast: boolean;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ item, isTyping, isLast }) => {
  const isUser = item.sender === 'user';
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

  return (
    <View style={styles.rowContainer}>
      <View style={[
        styles.messageContentBlock, 
        isUser ? styles.userDirection : styles.botDirection
      ]}>
        
        {/* AVATAR SYSTEM */}
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
            <Text style={styles.agentTag}>◈ {item.activeAgentStep}</Text>
          )}

          {/* CHAT CONTAINER: Upgraded to Premium ChatGPT Dark Tint Capsule */}
          <View style={[isUser ? styles.userTextBubble : styles.botTextBubble]}>
            <View style={styles.markdownWrapper}>
              <Markdown style={isUser ? userMarkdownStyles : botMarkdownStyles}>
                {item.text}
              </Markdown>
              
              {showCursor && (
                <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
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
  rowContainer: {
    width: '100%',
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  messageContentBlock: {
    width: '100%',
    maxWidth: 720, 
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  userDirection: { flexDirection: 'row-reverse' }, 
  botDirection: { flexDirection: 'row' },

  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  userAvatarMargin: { marginLeft: 14 }, 
  botAvatarMargin: { marginRight: 14 },
  
  userAvatar: { backgroundColor: '#374151' }, // Premium Slate Charcoal
  botAvatar: { backgroundColor: '#10b981' }, // Vibrant Emerald Green 
  avatarText: { color: '#ececf1', fontSize: 12, fontWeight: '700' },

  textContainer: {
    flex: 1,
  },
  userAlign: { alignItems: 'flex-end' },
  botAlign: { alignItems: 'flex-start' },

  // ============================================================
  // UPGRADED DESIGN LAYER: Matches official ChatGPT parameters
  // ============================================================
  userTextBubble: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Translucent anti-glare mask tint
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: Platform.OS === 'web' ? '70%' : '85%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)', // Invisible micro-border line for crisp depth
  },
  botTextBubble: {
    backgroundColor: 'transparent', 
    width: '100%',
    paddingTop: 2, // Slight vertical balancing shift
  },

  markdownWrapper: { 
    flexDirection: 'column', 
    alignItems: 'flex-start',
    width: '100%'
  },
  agentTag: { color: '#525252', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  cursor: { color: '#ececf1', fontSize: 16, fontWeight: 'bold', marginTop: 4, alignSelf: 'flex-start' }
});

const sharedMarkdownRules: Record<string, any> = {
  body: { fontSize: 15, lineHeight: 24 }, // Clean anti-fatigue sizing metric
  strong: { fontWeight: 'bold' },
  bullet_list: { marginVertical: 4, paddingLeft: 10 },
  ordered_list: { marginVertical: 4, paddingLeft: 10 },
  list_item: { marginVertical: 2 },
  code_inline: { 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    backgroundColor: '#1e1e1e', 
    paddingHorizontal: 5, 
    paddingVertical: 2,
    borderRadius: 4 
  },
  code_block: { 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    backgroundColor: '#171717', 
    borderLeftWidth: 1,
    borderRightWidth: 1, 
    borderColor: '#262626', 
    padding: 14, 
    borderRadius: 8, 
    marginVertical: 8, 
    width: '100%' 
  },
  fence: { 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    backgroundColor: '#171717', 
    borderLeftWidth: 1,
    borderRightWidth: 1, 
    borderColor: '#262626', 
    padding: 14, 
    borderRadius: 8, 
    marginVertical: 8, 
    width: '100%' 
  }
};

const userMarkdownStyles: Record<string, any> = {
  ...sharedMarkdownRules,
  body: { ...sharedMarkdownRules.body, color: '#f3f4f6', textAlign: 'left' }, // Left-justified text inside capsule layout
  strong: { ...sharedMarkdownRules.strong, color: '#ffffff' },
};

const botMarkdownStyles: Record<string, any> = {
  ...sharedMarkdownRules,
  body: { ...sharedMarkdownRules.body, color: '#d1d5db', textAlign: 'left' },
  strong: { ...sharedMarkdownRules.strong, color: '#ffffff' },
};
