"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FilePenIcon, TrashIcon, NotebookPen } from "lucide-react";

type Note = {
    id: number;
    title: string;
    content: string;
};

const defaultNotes: Note[] = [
    {
        id: 1,
        title: "Grocery List",
        content: "Milk, Eggs, Bread, Apples",
    },
    {
        id: 2,
        title: "Meeting Notes",
        content: "Discuss new project, assign tasks to team",
    },
    {
        id: 3,
        title: "Idea of App",
        content: "Develop a note-taking app woth a clean and minimalist design",
    },
];

function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const item = window.localStorage.getItem(key);
        if (item) {
          setStoredValue(JSON.parse(item));
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, [key]);

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = 
        value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
    } catch (error) {
      console.error(error);
    }
  }

  return [storedValue, setValue] as const;
}

export default function NotesApp() {
  const [notes, setNotes] = useLocalStorage<Note[]>("notes", defaultNotes);
  const [newNote, setNewNote] = useState<{ title: string; content: string }>({
    title: "",
    content: "",
  });
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAddNote = (): void => {
    if (newNote.title.trim() && newNote.content.trim()) {
      const newNotewithId = { id: Date.now(), ...newNote };
      setNotes([...notes, newNotewithId]);
      setNewNote({ title: "", content: "" });
    }
  };

  const handleEditNote = (id: number): void => {
    const noteToEdit = notes.find((note) => note.id === id);
    if (noteToEdit) {
      setNewNote({ title: noteToEdit.title, content: noteToEdit.content });
      setEditingNoteId(id);
    }
  };

  const handleUpdateNote = (): void => {
    if (newNote.title.trim() && newNote.content.trim()) {
      setNotes(
        notes.map((note) => 
          note.id === editingNoteId
          ? { id: note.id, title: newNote.title, content: newNote.content }
          : note
        )
      );
      setNewNote({ title: "", content: "" });
      setEditingNoteId(null);
    }
  };

  const handleDeleteNote = (id: number): void => {
    setNotes(notes.filter((note) => note.id !== id));
  };

  if (!isMounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-slate-200 text-foreground"
    style={{
      backgroundImage: `url('/paper1.jpg')`,
      backgroundPosition: 'center',
      backgroundSize: 'cover'
    }}
    >
      <header className="bg-gradient-to-br from-amber-600 via-amber-500 to-black p-4 shadow">
        <h1 className="text-2xl font-bold flex gap-1">
        <NotebookPen className="mt-1" fill="white" />Note Taker
        </h1>
      </header>
      <main className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          {/* Input for note title */}
          <input
          type="text"
          placeholder="Title"
          value={newNote.title || ""}
          onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
          className="w-full rounded-2xl border-2 border-input bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {/* Textarea for note content */}
          <textarea
          placeholder="Content"
          value={newNote.content || ""}
          onChange={(e) => 
            setNewNote({ ...newNote, content: e.target.value })
          }
          className="mt-2 w-full rounded-2xl border-2 border-input bg-background p-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          rows={3}
          />
          {/* Button to add or update note */}
          {editingNoteId === null ? (
            <Button onClick={handleAddNote} 
            className="mt-2 bg-amber-500 hover:bg-amber-400 rounded-full active:scale-90 transition-transform duration-300 hover:scale-105">
              Add Note
            </Button>
          ) : (
            <Button onClick={handleUpdateNote} 
            className="mt-2 bg-amber-500 hover:bg-amber-400 rounded-full active:scale-90 transition-transform duration-300 hover:scale-105">
              Update Note
            </Button>
          )}
        </div>
        {/* Display list of notes */}
        <div className="grid gap-4">
          {notes.map((note) => (
            <Card key={note.id} className="p-4 border-2 border-gray-300 rounded-2xl shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium">{note.title}</h2>
                <div className="flex gap-2">
                  <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEditNote(note.id)}
                  className="hover:bg-transparent hover:scale-125 active:scale-100 transition-transform transform duration-300"
                  >
                    <FilePenIcon className="h-4 w-4" />
                  </Button>
                  <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNote(note.id)}
                  className="hover:bg-transparent hover:scale-125 active:scale-100 transition-transform transform duration-300"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="mt-2 text-muted-foreground">{note.content}</p>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}