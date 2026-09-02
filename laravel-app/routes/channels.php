<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('ChatEvent.{userId}', function ($user, $userId) {
    // Check if the user is a participant of the chat
    return (int) $user->id === (int) $userId;
});

Broadcast::channel('MessageEvent.{chatId}', function ($user, $chatId) {
    // Check if the user is a participant of the chat
    return $user->chats()->where('chats.id', $chatId)->exists();
});

Broadcast::channel('Presence.Online', function ($user) {
    // Any authenticated, enabled user may join the online presence channel
    return [
        'id' => $user->id,
        'name' => $user->name,
    ];
});
