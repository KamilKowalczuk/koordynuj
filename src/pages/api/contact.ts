// WERSJA DIAGNOSTYCZNA - src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
    // --- KROK 1: NATYCHMIASTOWE LOGOWANIE ZMIENNYCH ---
    // Sprawdzamy, co funkcja WIDZI, a nie co myślimy, że widzi.
    console.log("Function invoked. Checking environment variables...");
    const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
    const STRAPI_URL = import.meta.env.STRAPI_URL;
    const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

    console.log("RESEND_API_KEY available:", !!RESEND_API_KEY);
    console.log("STRAPI_URL available:", !!STRAPI_URL);
    console.log("STRAPI_TOKEN available:", !!STRAPI_TOKEN);

    // BARDZO ROZBUDOWANY BLOK TRY...CATCH, ABY ZŁAPAĆ WSZYSTKO
    try {
        const data = await request.json();
        console.log("Received data:", JSON.stringify(data, null, 2));

        // Walidacja - bez zmian
        if (data.hp) throw new Error("Honeypot triggered.");
        if (data.t < 3000) throw new Error("Form submitted too quickly.");
        if (!data.name || !data.email || !data.message || !data.phone) {
            throw new Error("Missing required fields.");
        }

        const ipAddress = request.headers.get('x-forwarded-for') || 'Brak';
        const userAgent = request.headers.get('user-agent') || 'Brak';
        
        // --- Wysyłka przez Resend ---
        console.log("Attempting to send email via Resend...");
        const resend = new Resend(RESEND_API_KEY);
        await resend.emails.send({
            from: 'Formularz WWW <formularz@koordynuj-zdrowie.pl>',
            to: 'kontakt@koordynuj-zdrowie.pl',
            subject: `Nowa wiadomość od ${data.name}`,
            reply_to: data.email,
            html: `<p>Wiadomość od: ${data.name} (${data.email}, ${data.phone})</p><p>${data.message}</p>`,
        });
        console.log("Email sent successfully.");

        // --- Zapis do Strapi ---
        console.log("Attempting to save data to Strapi...");
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
                    telefon: data.phone,
                    wiadomosc: data.message,
                    status_wiadomosci: 'nowa',
                    ip_address: ipAddress,
                    user_agent: userAgent
                }
            })
        });

        if (!strapiResponse.ok) {
            const errorText = await strapiResponse.text();
            throw new Error(`Strapi responded with status ${strapiResponse.status}: ${errorText}`);
        }
        console.log("Data saved to Strapi successfully.");

        // Jeśli wszystko się udało, zwracamy sukces
        return new Response(JSON.stringify({ message: "Wiadomość wysłana pomyślnie!" }), { status: 200 });

    } catch (error) {
        // --- NAJWAŻNIEJSZA CZĘŚĆ ---
        // Jeśli cokolwiek się nie uda, logujemy błąd i ZWRACAMY POPRAWNY JSON
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("CRITICAL ERROR in contact form function:", errorMessage);
        
        return new Response(JSON.stringify({
            message: "Wystąpił błąd po stronie serwera.",
            error: errorMessage 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};