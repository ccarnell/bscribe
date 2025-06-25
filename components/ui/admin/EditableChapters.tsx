'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toasts/use-toast';

interface EditableChaptersProps {
  bookId: string;
  chapters: string[];
  canEdit: boolean;
  onUpdate: (chapters: string[]) => void;
}

export default function EditableChapters({ 
  bookId, 
  chapters, 
  canEdit, 
  onUpdate 
}: EditableChaptersProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editChapters, setEditChapters] = useState([...chapters]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const validChapters = editChapters.filter(ch => ch.trim());
    
    if (validChapters.length === 0) {
      toast({
        title: "Error",
        description: "At least one chapter is required",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/edit/chapters', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          chapters: validChapters
        })
      });

      const data = await response.json();

      if (data.success) {
        onUpdate(validChapters);
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Chapters updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update chapters",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update chapters",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditChapters([...chapters]);
    setIsEditing(false);
  };

  const updateChapter = (index: number, value: string) => {
    const newChapters = [...editChapters];
    newChapters[index] = value;
    setEditChapters(newChapters);
  };

  const addChapter = () => {
    setEditChapters([...editChapters, '']);
  };

  const removeChapter = (index: number) => {
    if (editChapters.length > 1) {
      const newChapters = editChapters.filter((_, i) => i !== index);
      setEditChapters(newChapters);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">
            Chapters ({chapters.length})
          </h3>
          {canEdit && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="slim"
            >
              Edit
            </Button>
          )}
        </div>
        
        <div className="space-y-2">
          {chapters.map((chapter, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 bg-zinc-800 rounded-md border border-zinc-700">
              <span className="text-sm font-medium text-gray-400 mt-1 min-w-[2rem]">
                {index + 1}.
              </span>
              <p className="text-white flex-1">{chapter}</p>
            </div>
          ))}
        </div>

        {!canEdit && (
          <p className="text-sm text-yellow-400">
            ⚠️ Chapters cannot be edited after content is generated
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white">
        Edit Chapters
      </h3>
      
      <div className="space-y-3">
        {editChapters.map((chapter, index) => (
          <div key={index} className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-400 min-w-[2rem]">
              {index + 1}.
            </span>
            <input
              type="text"
              value={chapter}
              onChange={(e) => updateChapter(index, e.target.value)}
              className="flex-1 p-2 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder={`Chapter ${index + 1} title...`}
            />
            {editChapters.length > 1 && (
              <Button
                onClick={() => removeChapter(index)}
                variant="slim"
                className="px-3 py-2 text-red-400 hover:text-red-300"
              >
                ×
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex space-x-3">
        <Button
          onClick={addChapter}
          variant="slim"
        >
          Add Chapter
        </Button>
        <Button
          onClick={handleSave}
          loading={saving}
          variant="emerald"
        >
          Save Changes
        </Button>
        <Button
          onClick={handleCancel}
          variant="slim"
          disabled={saving}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
