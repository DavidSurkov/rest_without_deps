import { RecordType, Store } from './store';

interface ITodo {
  id: number;
  name: string;
  isDone: boolean;
}

interface INote {
  id: number;
  title: string;
  ownerId: number;
  todos: ITodo[];
}
export class Notes extends Store {
  private async getAllNotesInFS() {
    const allNotes = await this.readFileFromRecordType(RecordType.NOTES);
    if (!allNotes) {
      console.log('No notes in db');
      return [];
    }
    const allNotesParsed: INote[] = JSON.parse(allNotes);
    return allNotesParsed;
  }
  public async getNotes(ownerId: number): Promise<INote[]> {
    const allNotes = await this.getAllNotesInFS();
    return allNotes.filter((note) => note.ownerId === ownerId);
  }

  public async getNote(id: number, ownerId: number) {
    const allNotes = await this.getNotes(ownerId);
    return allNotes.find((note) => note.id === id) || null;
  }
  public async deleteNote(id: number, ownerId: number) {
    const allNotesParsed = await this.getAllNotesInFS();
    const foundNote = allNotesParsed.find(
      (note) => note.id === id && note.ownerId === ownerId,
    );
    if (!foundNote) {
      console.log('Note not found');
      return false;
    }
    const updatedRecord = allNotesParsed.filter(
      (note) => note.id !== foundNote.id,
    );
    return await this.writeFileFromRecordType(RecordType.NOTES, updatedRecord);
  }

  public async deleteTodo(noteId: number, todoId: number, ownerId: number) {
    const allNotesParsed = await this.getAllNotesInFS();
    const foundNote = allNotesParsed.find(
      (note) => note.id === noteId && note.ownerId === ownerId,
    );

    if (!foundNote) {
      console.log('Note not found');
      return false;
    }

    const foundTodo = foundNote.todos.find((todo) => todo.id === todoId);
    if (!foundTodo) {
      console.log('Todo not found');
      return false;
    }

    const updatedRecord = allNotesParsed.map((note) => {
      if (note.id === foundNote.id) {
        const updatedTodos = note.todos.filter((todo) => todo.id !== todoId);
        return { ...note, todos: updatedTodos };
      }
      return note;
    });

    return await this.writeFileFromRecordType(RecordType.NOTES, updatedRecord);
  }

  public async addTodo(noteId: number, ownerId: number, todoName: string) {
    const allNotesParsed = await this.getAllNotesInFS();
    const foundNote = allNotesParsed.find(
      (note) => note.id === noteId && note.ownerId === ownerId,
    );

    if (!foundNote) {
      console.log('Note not found');
      return null;
    }

    const todo: ITodo = {
      id: this.generateRandomId(),
      isDone: false,
      name: todoName,
    };

    const updatedNotes = allNotesParsed.map((note) => {
      if (note.id === foundNote.id) {
        return {
          ...note,
          todos: [...note.todos, todo],
        };
      }
      return note;
    });

    const success = await this.writeFileFromRecordType(
      RecordType.NOTES,
      updatedNotes,
    );
    if (!success) {
      return null;
    }
    return todo;
  }

  public async updateNoteTitle(id: number, ownerId: number, title: string) {
    const allNotes = await this.getAllNotesInFS();
    const foundNote = allNotes.find((note) => note.id === id);
    if (!foundNote) {
      return null;
    }

    const updatedNote: INote = { ...foundNote, title };

    const updatedNotes = allNotes.map((note) => {
      if (note.id === updatedNote.id) {
        return updatedNote;
      }
      return note;
    });

    const success = this.writeFileFromRecordType(
      RecordType.NOTES,
      updatedNotes,
    );

    if (!success) {
      return null;
    }

    return updatedNote;
  }
  public async createNote(noteTitle: string, ownerId: number) {
    const allNotes = await this.getAllNotesInFS();
    const newNote: INote = {
      id: this.generateRandomId(),
      ownerId,
      title: noteTitle,
      todos: [],
    };

    const success = await this.writeFileFromRecordType(RecordType.NOTES, [
      ...allNotes,
      newNote,
    ]);

    if (!success) {
      return null;
    }

    return newNote;
  }
}
