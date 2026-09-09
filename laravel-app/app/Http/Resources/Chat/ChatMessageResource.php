<?php

namespace App\Http\Resources\Chat;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $currentUserId = $request->user()?->id;

        return [
            'id' => $this->id,
            'type' => $this->type,
            'content' => $this->content,
            'file_name' => $this->file_name,
            'file_path' => $this->file_path,
            'mime_type' => $this->mime_type,
            'seen_at' => $this->seen_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'creator' => $this->whenLoaded('creator', fn() => new ChatUserResource($this->creator)),
            'reactions' => $this->whenLoaded('reactions', function () use ($currentUserId) {
                return $this->reactions
                    ->groupBy('emoji')
                    ->map(function ($group) use ($currentUserId) {
                        return [
                            'emoji' => $group->first()->emoji,
                            'count' => $group->count(),
                            'reacted_by_me' => $group->contains('user_id', $currentUserId),
                            'user_names' => $group->pluck('user.name')->filter()->values(),
                        ];
                    })
                    ->values();
            }),
        ];
    }
}
