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
        
        {/* AVATAR ELEMENT */}
        <View style={[
          styles.avatarCircle, 
          isUser ? styles.userAvatar : styles.botAvatar,
          isUser ? styles.userAvatarMargin : styles.botAvatarMargin
        ]}>
          <Text style={styles.avatarText}>{isUser ? 'U' : 'T'}</Text>
        </View>

        {/* TEXT TRACK BLOCK */}
        <View style={[styles.textContainer, isUser ? styles.userAlign : styles.botAlign]}>
          {item.activeAgentStep && (
            <Text style={styles.agentTag}>◈ {item.activeAgentStep}</Text>
          )}

          {/* CHAT BUBBLE PILL: Soft padding container matching ChatGPT parameters */}
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
    paddingVertical: 10,
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
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  userAvatarMargin: { marginLeft: 16 }, 
  botAvatarMargin: { marginRight: 16 },
  
  userAvatar: { backgroundColor: '#4b5563' }, 
  botAvatar: { backgroundColor: '#10b981' },  
  avatarText: { color: '#ececf1', fontSize: 13, fontWeight: '700' },

  textContainer: {
    flex: 1,
  },
  userAlign: { alignItems: 'flex-end' },
  botAlign: { alignItems: 'flex-start' },

  // ChatGPT modern bubble specifications
  userTextBubble: {
    backgroundColor: '#2f2f2f', // Soft background shape block for user prompt
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '85%',
  },
  botTextBubble: {
    backgroundColor: 'transparent', // Assistant text flows completely un-bordered
    width: '100%',
  },

  // CRITICAL FIX: Changed to column flow layout to let content break downward perfectly
  markdownWrapper: { 
    flexDirection: 'column', 
    alignItems: 'flex-start',
    width: '100%'
  },
  agentTag: { color: '#525252', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  cursor: { color: '#ececf1', fontSize: 16, fontWeight: 'bold', marginTop: 4, alignSelf: 'flex-start' }
});

// Explicit plain-object markdown styling rules to override core package layouts safely
const sharedMarkdownRules: Record<string, any> = {
  body: { fontSize: 16, lineHeight: 26 },
  strong: { fontWeight: 'bold' },
  bullet_list: { marginVertical: 4, paddingLeft: 10 },
  ordered_list: { marginVertical: 4, paddingLeft: 10 },
  list_item: { marginVertical: 2 },
  code_inline: { 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    backgroundColor: '#1c1c1c', 
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
  body: { ...sharedMarkdownRules.body, color: '#ececf1', textAlign: 'left' }, 
  strong: { ...sharedMarkdownRules.strong, color: '#ececf1' },
};

const botMarkdownStyles: Record<string, any> = {
  ...sharedMarkdownRules,
  body: { ...sharedMarkdownRules.body, color: '#d4d4d4', textAlign: 'left' },
  strong: { ...sharedMarkdownRules.strong, color: '#ececf1' },
};
