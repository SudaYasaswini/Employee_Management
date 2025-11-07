import React from "react";
import { UserPlus } from "lucide-react";

export default function StoryCard({ story, onAssign }) {
  return (
    <div className="border rounded-lg p-4 bg-white hover:shadow-sm transition">
      <h3 className="font-semibold text-gray-900 mb-1">{story.title}</h3>
      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{story.description}</p>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>
          {story.assigneeName ? `👤 ${story.assigneeName}` : "Unassigned"}
        </span>
        <span>Status: {story.status}</span>
      </div>
      {onAssign && !story.assigneeId && (
        <button
          onClick={onAssign}
          className="mt-3 flex items-center gap-1 text-sm px-2 py-1 rounded-md border hover:bg-gray-100"
        >
          <UserPlus className="w-4 h-4" /> Assign
        </button>
      )}
    </div>
  );
}
