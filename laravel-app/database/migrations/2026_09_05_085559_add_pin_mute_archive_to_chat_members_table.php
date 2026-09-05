<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('chat_members', function (Blueprint $table) {
            $table->timestamp('pinned_at')->nullable()->after('joined_at');
            $table->timestamp('muted_at')->nullable()->after('pinned_at');
            $table->timestamp('archived_at')->nullable()->after('muted_at');
        });
    }

    public function down(): void
    {
        Schema::table('chat_members', function (Blueprint $table) {
            $table->dropColumn(['pinned_at', 'muted_at', 'archived_at']);
        });
    }
};
