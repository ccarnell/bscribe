'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { toast } from '@/components/ui/Toasts/use-toast';

interface EditableTitleProps {
  bookId: string;
  title: string;
  subtitle: string;
  canEdit: boolean;
  onUpdate: (title: string, subtitle: string) => void;
}

export default function EditableTitle({ 
  bookId, 
  title, 
  subtitle, 
  canEdit, 
  onUpdate 
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editSubtitle, setEditSubtitle] = useState(subtitle);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!editTitle.trim() || !editSubtitle.trim()) {
      toast({
        title: "Error",
        description: "Title and subtitle cannot be empty",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/edit/title', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookId,
          title: editTitle.trim(),
          subtitle: editSubtitle.trim()
        })
      });

      const data = await response.json();

      if (data.success) {
        onUpdate(editTitle.trim(), editSubtitle.trim());
        setIsEditing(false);
        toast({
          title: "Success",
          description: "Title updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update title",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update title",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(title);
    setEditSubtitle(subtitle);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-lg text-gray-300 italic">{subtitle}</p>
          </div>
          {canEdit && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="slim"
              className="ml-4"
            >
              Edit
            </Button>
          )}
        </div>
        {!canEdit && (
          <p className="text-sm text-yellow-400">
            ⚠️ Title cannot be edited after chapters are generated
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Title
        </label>
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Enter book title..."
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Subtitle
        </label>
        <input
          type="text"
          value={editSubtitle}
          onChange={(e) => setEditSubtitle(e.target.value)}
          className="w-full p-3 bg-zinc-700 border border-zinc-600 rounded-md text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          placeholder="Enter book subtitle..."
        />
      </div>

      <div className="flex space-x-3">
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
