<?php

namespace App\Http\Controllers\Front;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Http\Requests\StoreContactRequest;
use App\Mail\ContactMessage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function index()
    {
        return $this->createView('Front/Contact/Contact');
    }

    public function create(StoreContactRequest $request)
    {
        try {
            $data = $request->only('name', 'email', 'message');

            // Send email
            Mail::to('abacoding@abacoding.com')->send(new ContactMessage($data));

            return response()->json([
                'message' => 'Your message was sent successfully! We\'ll get back to you within 24 hours.',
                'success' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Contact form error: ' . $e->getMessage());

            return response()->json([
                'message' => 'Sorry, there was an error sending your message. Please try again or contact us directly.',
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
