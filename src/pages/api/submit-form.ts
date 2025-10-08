// src/pages/api/submit-form.ts - WERSJA OSTATECZNA
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const STRAPI_URL = import.meta.env.STRAPI_URL;
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;
const recipientEmail = 'kontakt@koordynuj-zdrowie.pl';

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();

        // Walidacja i zabezpieczenia
        if (data.hp || data.t < 3000 || !data.name || !data.email || !data.message || !data.phone) {
            throw new Error("Invalid form submission.");
        }

        const ipAddress = request.headers.get('x-forwarded-for') || 'Brak';
        const userAgent = request.headers.get('user-agent') || 'Brak';
        
        // 1. Wysyłka emaila przez Resend
        const resend = new Resend(RESEND_API_KEY);
        await resend.emails.send({
            from: 'Formularz WWW <formularz@koordynuj-zdrowie.pl>', // Upewnij się, że ta domena jest zweryfikowana w Resend
            to: recipientEmail,
            subject: `Nowa wiadomość od ${data.name}`,
            reply_to: data.email,
            html: `
                <h3>Wiadomość ze strony Koordynuj Zdrowie:</h3>
                <p><strong>Imię i nazwisko:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Telefon:</strong> ${data.phone}</p>
                <p><strong>Wiadomość:</strong></p>
                <p>${data.message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>IP: ${ipAddress} | Przeglądarka: ${userAgent}</small></p>
            `,
        });

        // 2. Zapis wiadomości do Strapi (bez pola 'telefon')
        const strapiResponse = await fetch(`${STRAPI_URL}/api/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            },
            body: JSON.stringify({
                data: {
                    imie_nazwisko: data.name,
                    email: data.email,
                    // Usunęliśmy pole 'telefon', ponieważ nie istnieje w Strapi
                    wiadomosc: data.message,
                    status_wiadomosci: 'nowa',
                    ip_address: ipAddress,
                    user_agent: userAgent
                }
            })
        });

        if (!strapiResponse.ok) {
            const errorText = await strapiResponse.text();
            throw new Error(`Strapi error: ${errorText}`);
        }

        return new Response(JSON.stringify({ message: "Wiadomość wysłana pomyślnie!" }), { status: 200 });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Contact form error:", errorMessage);
        
        return new Response(JSON.stringify({
            message: "Wystąpił błąd po stronie serwera.",
            error: errorMessage 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};