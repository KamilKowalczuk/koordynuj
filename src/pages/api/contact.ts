import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// Twoje zmienne środowiskowe pozostają bez zmian
const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const STRAPI_URL = import.meta.env.STRAPI_URL;
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

// Adres e-mail, na który mają przychodzić wiadomości
const recipientEmail = 'kontakt@koordynuj-zdrowie.pl';

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();
    
    // Walidacja - bez zmian, jest poprawna
    if (data.hp) {
        return new Response(JSON.stringify({ message: "Błąd weryfikacji anty-spam." }), { status: 400 });
    }
    if (data.t < 3000) {
        return new Response(JSON.stringify({ message: "Formularz wypełniono zbyt szybko." }), { status: 400 });
    }
    if (!data.name || !data.email || !data.message || !data.phone) {
        return new Response(JSON.stringify({ message: "Proszę wypełnić wszystkie wymagane pola." }), { status: 400 });
    }

    // Inicjalizacja Resend - bez zmian
    const resend = new Resend(RESEND_API_KEY);
    const ipAddress = request.headers.get('x-forwarded-for') || 'Brak';
    const userAgent = request.headers.get('user-agent') || 'Brak';

    try {
        // --- POPRAWKA #1: Wysyłka emaila przez Resend ---
        await resend.emails.send({
            // POPRAWKA: Adres 'from' musi pochodzić z domeny zweryfikowanej w Resend.
            // Zmień 'formularz@twojadomena.pl' na coś w stylu 'formularz@koordynuj-zdrowie.pl'
            from: 'Formularz WWW <formularz@koordynuj-zdrowie.pl>', 
            
            // POPRAWKA: Adres odbiorcy jest stały, nie powinien pochodzić z formularza.
            to: recipientEmail, 
            
            subject: `Nowa wiadomość od ${data.name}`,
            reply_to: data.email, // Dodajemy 'reply_to', aby można było łatwo odpowiedzieć.
            html: `
                <h3>Nowa wiadomość ze strony Koordynuj Zdrowie:</h3>
                <p><strong>Imię i nazwisko:</strong> ${data.name}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Telefon:</strong> ${data.phone}</p>
                <p><strong>Wiadomość:</strong></p>
                <p>${data.message.replace(/\n/g, '<br>')}</p>
                <hr>
                <p><small>IP: ${ipAddress}</small></p>
                <p><small>Przeglądarka: ${userAgent}</small></p>
            `,
        });

        // --- POPRAWKA #2: Zapis wiadomości do Strapi ---
        const response = await fetch(`${STRAPI_URL}/api/contacts`, { // Endpoint /api/contacts jest poprawny dla kolekcji 'contact'
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            },
            body: JSON.stringify({
                data: {
                    imie_nazwisko: data.name,
                    email: data.email,
                    telefon: data.phone, // POPRAWKA: Odkomentowano, aby zapisywać numer telefonu.
                    wiadomosc: data.message,
                    status_wiadomosci: 'nowa',
                    ip_address: ipAddress,
                    user_agent: userAgent
                }
            })
        });

        // Dodatkowa weryfikacja odpowiedzi ze Strapi
        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Błąd zapisu do Strapi:", errorBody);
            // Mimo błędu w Strapi, email został wysłany, więc zwracamy sukces
        }

        return new Response(JSON.stringify({ message: "Wiadomość wysłana pomyślnie!" }), { status: 200 });

    } catch (error) {
        console.error("Błąd wysyłki formularza:", error);
        return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd serwera." }), { status: 500 });
    }
};