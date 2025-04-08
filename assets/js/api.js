class NoteKeeper {
  static BASE_URL = "https://notekeeper.memento-dev.fr/api";
  static SOCKET_URL = "wss://notekeeper.memento-dev.fr/ws";
  static #isInitialized = false;
  static #vapidKey = null;
  static #identifier = null;
  static #ws = null;
  static #onMessageCallback = null;
  static #reconnectAttempts = 0;
  static MAX_RECONNECT_ATTEMPTS = 5;
  static RECONNECT_DELAY = 3000;

  static get vapidKey() {
    return this.#vapidKey;
  }

  static async init() {
    if (this.#isInitialized) return;
    
    try {
      const response = await this.fetchApi('auth/login');
      if (!response.ok) throw new Error('Authentication failed');
      
      const data = await response.json();
      this.#identifier = data.identifier;
      this.#vapidKey = data.vapidKey;
      this.#isInitialized = true;
      
      this.#initWebSocket();
    } catch (error) {
      console.error('Initialization error:', error);
      throw error;
    }
  }

  static fetchApi(endpoint, options = {}) {
    const url = `${this.BASE_URL}/${endpoint}`.replace(/\/+/g, '/');
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  }

  static #initWebSocket() {
    if (this.#ws && [WebSocket.OPEN, WebSocket.CONNECTING].includes(this.#ws.readyState)) {
      return;
    }

    this.#ws = new WebSocket(this.SOCKET_URL);

    this.#ws.onopen = () => {
      this.#reconnectAttempts = 0;
      console.log('WebSocket connected');
      if (this.#vapidKey) {
        this.socketEmit('connect-notification', { vapidKey: this.#vapidKey });
      }
    };

    this.#ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.event === 'message' && this.#onMessageCallback) {
          this.#onMessageCallback(data.data);
        }
      } catch (e) {
        console.error('Message processing error:', e);
      }
    };

    this.#ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.#reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
        this.#reconnectAttempts++;
        setTimeout(() => this.#initWebSocket(), this.RECONNECT_DELAY);
      }
    };

    this.#ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  static socketEmit(event, data) {
    if (this.#ws?.readyState === WebSocket.OPEN) {
      this.#ws.send(JSON.stringify({ event, data }));
    }
  }

  static async sendMessage(content) {
    await this.init();
    
    if (!this.#ws || this.#ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    const messageData = {
      identifier: this.#identifier,
      content,
      timestamp: new Date().toISOString()
    };
    
    this.socketEmit('message', messageData.content);
  }

  static onMessage(callback) {
    this.#onMessageCallback = callback;
  }

  static async isFromSender(message) {
    await this.init();
    return message.identifier === this.#identifier;
  }

  static async getIdentifier() {
    await this.init();
    return this.#identifier;
  }

  static async getAllNotes() {
    const response = await this.fetchApi('notes');
    if (!response.ok) throw new Error('Failed to get notes');
    const data = await response.json();
    return data.notes || [];
  }

  static async createNote(content) {
    const response = await this.fetchApi('notes', {
      method: 'POST',
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to create note');
    const data = await response.json();
    return data.note;
  }

  static async updateNote(note) {
    const response = await this.fetchApi(`notes/${note.id}`, {
      method: 'PUT',
      body: JSON.stringify({ content: note.content })
    });
    if (!response.ok) throw new Error('Failed to update note');
    return true;
  }

  static async deleteNote(id) {
    const response = await this.fetchApi(`notes/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete note');
    return true;
  }

  static async getMessages() {
    const response = await this.fetchApi('messages');
    if (!response.ok) throw new Error('Failed to get messages');
    const data = await response.json();
    return data.messages || [];
  }

  static connectToNotificationServer(subscription) {
    this.socketEmit('connect-notification', subscription);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  NoteKeeper.init().catch(e => console.error('Initialization failed:', e));
});