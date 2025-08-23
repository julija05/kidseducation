<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NewsletterController extends Controller
{
    /**
     * Subscribe to newsletter
     */
    public function subscribe(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email address'
            ], 422);
        }

        $email = $request->email;

        // For now, just log the subscription
        // In the future, you can integrate with services like Mailchimp, ConvertKit, etc.
        \Log::info('Newsletter subscription', ['email' => $email]);

        // You could also store in database:
        // NewsletterSubscription::firstOrCreate(['email' => $email]);

        return response()->json([
            'success' => true,
            'message' => 'Successfully subscribed to newsletter!'
        ]);
    }
}
