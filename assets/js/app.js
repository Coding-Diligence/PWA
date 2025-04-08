const app = {
  registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('service-worker.js')
      .catch(err => console.error('SW registration failed:', err));
  },

  isOnline() {
    return navigator.onLine;
  },

  getFromLocalStorage(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (error) {
      return null;
    }
  },

  setInLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  logOperation(operation, isSuccess = true) {
    const container = document.getElementById("logs-container");
    const logEntry = document.createElement("div");
    logEntry.className = `log ${isSuccess ? 'log--success' : 'log--error'}`;
    logEntry.innerHTML = `
      <div><span>${new Date().toLocaleString()}</span></div>
      <p>${operation}</p>
    `;
    container.appendChild(logEntry);
  },

  async handleCreateNote(noteContent) {
    try {
      const savedNotes = this.getFromLocalStorage("savedNotes") || [];
      let newNote;

      if (!this.isOnline()) {
        newNote = {
          id: `offline-${Date.now()}`,
          content: noteContent,
          isNew: true
        };
        this.logOperation('Note créée hors ligne');
      } else {
        newNote = await NoteKeeper.createNote(noteContent);
        if (!newNote) throw new Error('Échec de création');
        this.logOperation('Note créée');
      }

      savedNotes.push(newNote);
      this.setInLocalStorage("savedNotes", savedNotes);
      this.addNoteToUI(newNote);
      return true;
    } catch (error) {
      this.logOperation(error.message, false);
      return false;
    }
  },

  async handleDeleteNote(noteId, noteElement) {
    try {
      const savedNotes = this.getFromLocalStorage("savedNotes") || [];
      const isNew = savedNotes.find(n => n.id === noteId)?.isNew;

      if (!isNew && this.isOnline()) {
        await NoteKeeper.deleteNote(noteId);
      }

      const updatedNotes = savedNotes.filter(n => n.id !== noteId);
      this.setInLocalStorage("savedNotes", updatedNotes);
      noteElement.remove();
      this.logOperation('Note supprimée');
    } catch (error) {
      this.logOperation(error.message, false);
    }
  },

  addNoteToUI(note) {
    const container = document.getElementById("notes-container");
    const noteElement = document.createElement("form");
    noteElement.className = "item";
    noteElement.dataset.noteId = note.id;
    noteElement.innerHTML = `
      <textarea>${note.content}</textarea>
      <button type="button" class="delete-btn">Supprimer</button>
      <button type="submit">Modifier</button>
    `;

    noteElement.querySelector('.delete-btn').addEventListener('click', (e) => {
      e.preventDefault();
      this.handleDeleteNote(note.id, noteElement);
    });

    noteElement.addEventListener("submit", async (e) => {
      e.preventDefault();
      const content = noteElement.querySelector('textarea').value.trim();
      if (!content) return;
      try {
        await NoteKeeper.updateNote({ id: note.id, content });
        this.logOperation('Note mise à jour');
      } catch (error) {
        this.logOperation(error.message, false);
      }
    });

    container.appendChild(noteElement);
  },

  async handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById("message-input");
    const message = input.value.trim();
    if (!message) return;

    try {
      if (!this.isOnline()) {
        throw new Error('Impossible d\'envoyer hors ligne');
      }

      await NoteKeeper.sendMessage(message);

      input.value = '';
      this.logOperation('Message envoyé');
    } catch (error) {
      this.logOperation(error.message, false);
    }
  },

  async displayMessage(message) {
    const container = document.getElementById("messages-container");
    if (!container) return;

    const isCurrentUser = await NoteKeeper.isFromSender(message);
    const messageElement = document.createElement("div");
    messageElement.className = `message ${isCurrentUser ? 'message--own' : ''}`;
    messageElement.innerHTML = `
      <p><strong>${message.identifier}</strong>: ${message.content}</p>
      <small>${new Date(message.timestamp).toLocaleTimeString()}</small>
    `;
    container.appendChild(messageElement);
    container.scrollTop = container.scrollHeight;
  },

  async setupMessaging() {
    try {
      await NoteKeeper.init();
      
      NoteKeeper.onMessage(message => {
        this.displayMessage(message);
        
        if (Notification.permission === 'granted') {
          NoteKeeper.isFromSender(message).then(isFromMe => {
            if (!isFromMe) {
              new Notification(`Message de ${message.identifier}`, {
                body: message.content,
                icon: '/assets/icons/icon-192x192.png'
              });
            }
          });
        }
      });
    } catch (error) {
      console.error('Messaging setup failed:', error);
    }
  },

  async loadInitialData() {
    try {
      let notes = [];
      if (this.isOnline()) {
        notes = await NoteKeeper.getAllNotes();
        this.setInLocalStorage("savedNotes", notes);
        
        const messages = await NoteKeeper.getMessages();
        messages.forEach(msg => this.displayMessage(msg));
      } else {
        notes = this.getFromLocalStorage("savedNotes") || [];
        this.logOperation('Mode hors ligne - Données locales');
      }
      
      notes.forEach(note => this.addNoteToUI(note));
    } catch (error) {
      console.error('Initial load error:', error);
    }
  },

  attachEvents() {
    document.getElementById("note-creator")?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const content = document.getElementById("note-creator-content").value.trim();
      if (content) await this.handleCreateNote(content);
      e.target.reset();
    });

    document.getElementById("message-form")?.addEventListener("submit", (e) => {
      this.handleSendMessage(e);
    });

    window.addEventListener("online", () => {
      this.logOperation('En ligne - Synchronisation...');
      this.loadInitialData();
    });

    window.addEventListener("offline", () => {
      this.logOperation('Hors ligne - Mode local activé');
    });
  },

  init() {
    this.registerServiceWorker();
    this.attachEvents();
    this.setupMessaging();
    this.loadInitialData();
    this.logOperation('Application prête');
  }
};

document.addEventListener("DOMContentLoaded", () => app.init());