// src/pages/api/contact.ts - WERSJA DIAGNOSTYCZNA "HELLO WORLD"
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    // Spróbujemy odczytać dane, żeby upewnić się, że request jest poprawny
    const data = await request.json();
    
    // Zwracamy prosty, gwarantowany sukces w formacie JSON
    return new Response(
      JSON.stringify({ 
        message: "SUCCESS: Minimal API endpoint is working!",
        receivedData: data 
      }), 
      { status: 200 }
    );

  } catch (e) {
    // Jeśli nawet odczyt danych się nie powiedzie, zwracamy błąd w JSON
    return new Response(
      JSON.stringify({ 
        message: "ERROR: Could not parse incoming data."
      }), 
      { status: 400 }
    );
  }
};