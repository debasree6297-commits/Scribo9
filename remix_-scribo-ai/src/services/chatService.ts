export interface Message {
  role: 'user' | 'assistant' | 'model';
  content?: string;
  text?: string;
  timestamp?: number;
  images?: string[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'scribo_chats';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

export const chatService = {
  // SAVE CHAT
  saveCurrentChat(messages: Message[], currentChatId: string | null): string {
    if (!messages || messages.length === 0) return currentChatId || '';
    
    const chats: Chat[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    );
    
    const existingIndex = chats.findIndex(
      c => c.id === currentChatId
    );
    
    const id = currentChatId || Date.now().toString();
    const firstMsg = messages[0];
    const content = firstMsg.content || firstMsg.text || 'New Chat';
    
    const chatData: Chat = {
      id: id,
      title: content.substring(0, 35),
      messages: messages,
      updatedAt: Date.now(),
      createdAt: existingIndex >= 0 ? chats[existingIndex].createdAt : Date.now()
    };
    
    if (existingIndex >= 0) {
      chats[existingIndex] = chatData;
    } else {
      chats.unshift(chatData);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    return id;
  },

  // LOAD CHAT HISTORY
  loadChatHistory(): Chat[] {
    const chats: Chat[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || '[]'
    );
    
    const now = Date.now();
    const valid = chats.filter(
      c => now - c.createdAt < SEVEN_DAYS
    );
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    return valid;
  },

  // Compatibility methods for existing code
  async getUserChats(userId: string): Promise<Chat[]> {
    return this.loadChatHistory();
  },

  async createChat(userId: string, title: string, initialMessages: Message[] = []): Promise<Chat> {
    const id = this.saveCurrentChat(initialMessages, null);
    const chats = this.loadChatHistory();
    return chats.find(c => c.id === id)!;
  },

  async addMessage(userId: string, chatId: string, message: Message) {
    const chats = this.loadChatHistory();
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      chat.messages.push(message);
      this.saveCurrentChat(chat.messages, chatId);
    }
  },

  async cleanupOldChats(userId: string) {
    this.loadChatHistory();
  },

  deleteChat(userId: string, chatId: string) {
    const chats = this.loadChatHistory();
    const filtered = chats.filter(c => c.id !== chatId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  clearAllChats() {
    localStorage.removeItem(STORAGE_KEY);
  }
};

