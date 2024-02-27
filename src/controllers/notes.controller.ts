import { HttpRequest, HttpResponseWithUserInLocals } from '../global.interface';
import { Notes } from '../db/notes';

export class NotesController {
  private notesRepository: Notes;
  constructor() {
    this.notesRepository = new Notes();
  }
  public async findOne(
    req: HttpRequest<NonNullable<unknown>, { id: string }>,
    res: HttpResponseWithUserInLocals,
  ) {
    console.log(req.params);
    const id = Number(req.params.id);
    const note = await this.notesRepository.getNote(id, res.locals.user.id);
    if (!note) {
      res.writeHead(404, 'Not found');
      res.end();
      return;
    }
    res.writeHead(200, 'OK');
    res.end(JSON.stringify(note));
  }

  public async findAll(req: HttpRequest, res: HttpResponseWithUserInLocals) {
    const { user } = res.locals;
    const userNotes = await this.notesRepository.getNotes(user.id);
    res.writeHead(200, 'OK');
    res.end(JSON.stringify(userNotes));
  }

  public async createOne(
    req: HttpRequest<{ title: string }>,
    res: HttpResponseWithUserInLocals,
  ) {
    const { user } = res.locals;
    console.log(req.body);
    const createdNote = await this.notesRepository.createNote(
      req.body.title,
      user.id,
    );
    if (!createdNote) {
      res.writeHead(400, 'Bad request');
      res.end();
      return;
    }
    res.writeHead(200, 'OK');
    res.end(JSON.stringify(createdNote));
  }

  public async updateOne(
    req: HttpRequest<{ id: number; title: string }>,
    res: HttpResponseWithUserInLocals,
  ) {
    console.log('update one');
    const { id, title } = req.body;
    const { user } = res.locals;
    const updatedNote = await this.notesRepository.updateNoteTitle(
      id,
      user.id,
      title,
    );
    if (!updatedNote) {
      res.writeHead(400, 'Bad request');
      res.end();
      return;
    }
    res.writeHead(200, 'OK');
    res.end(JSON.stringify(updatedNote));
  }

  public async deleteOne(
    req: HttpRequest<NonNullable<unknown>, { id: string }>,
    res: HttpResponseWithUserInLocals,
  ) {
    const { id } = req.params;
    const { user } = res.locals;
    const deleted = await this.notesRepository.deleteNote(Number(id), user.id);
    if (!deleted) {
      res.writeHead(400, 'Bad request');
      res.end();
      return;
    }
    res.writeHead(200, 'OK');
    res.end();
  }

  public async deleteOneTodo(
    req: HttpRequest<NonNullable<unknown>, { id: string }>,
    res: HttpResponseWithUserInLocals,
  ) {
    console.log(req.params);
    console.log(req.query);
    const { id } = req.params;
    // TODO??

    console.log('delete one todo');
    const deleted = await this.notesRepository.deleteTodo(1, 1, 1);
    res.end();
  }

  public async addTodo(
    req: HttpRequest<{ noteId: number; title: string }>,
    res: HttpResponseWithUserInLocals,
  ) {
    const { user } = res.locals;
    const { noteId, title } = req.body;
    const todo = await this.notesRepository.addTodo(
      Number(noteId),
      user.id,
      title,
    );

    if (!todo) {
      res.writeHead(400, 'Bad request');
      res.end();
      return;
    }
    res.writeHead(200, 'OK');
    res.end(JSON.stringify(todo));
  }
}
