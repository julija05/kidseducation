<?php

use App\Constants\PaymentMethod;
use App\Constants\PaymentStatus;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the payments table used for the manual (offline) payment flow.
     */
    public function up(): void
    {
        if (! Schema::hasTable('payments')) {
            Schema::create('payments', function (Blueprint $table) {
                $table->id();

                // The enrollment this payment pays for.
                $table->foreignId('enrollment_id')
                    ->constrained('enrollments')
                    ->cascadeOnDelete();

                // Amount and currency of the payment.
                $table->decimal('amount', 10, 2);
                $table->string('currency', 10)->default('MKD');

                // Billing period this payment covers, e.g. "2026-11".
                $table->string('period', 7);

                // Lifecycle status (pending / confirmed / rejected).
                $table->string('status', 20)->default(PaymentStatus::PENDING);

                // How the money was paid (bank_transfer / cash / other).
                $table->string('method', 30)->default(PaymentMethod::BANK_TRANSFER);

                // Free-text reference supplied by the payer (e.g. bank ref).
                $table->string('reference', 191)->nullable();

                // Optional admin note (e.g. reason for rejection).
                $table->text('note')->nullable();

                // Admin who confirmed/rejected and when.
                $table->foreignId('confirmed_by')
                    ->nullable()
                    ->constrained('users')
                    ->nullOnDelete();
                $table->timestamp('confirmed_at')->nullable();

                $table->timestamps();

                // One payment per enrollment per billing period.
                $table->unique(['enrollment_id', 'period']);
                $table->index('status');
            });
        }
    }

    /**
     * Drop the payments table.
     */
    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
