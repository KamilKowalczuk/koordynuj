import type { APIRoute } from 'astro';
import { Resend } from 'resend';

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const STRAPI_URL = import.meta.env.STRAPI_URL;
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

export const POST: APIRoute = async ({ request }) => {
    const data = await request.json();
    
    // 1. Walidacja i zabezpieczenia (przeniesione z Pana kodu)
    if (data.hp) { // Honeypot
        return new Response(JSON.stringify({ message: "Błąd weryfikacji anty-spam." }), { status: 400 });
    }
    if (data.t < 3000) { // Zbyt szybkie wypełnienie
        return new Response(JSON.stringify({ message: "Formularz wypełniono zbyt szybko." }), { status: 400 });
    }
    if (!data.name || !data.email || !data.message || !data.phone) {
        return new Response(JSON.stringify({ message: "Proszę wypełnić wszystkie wymagane pola." }), { status: 400 });
    }

    const resend = new Resend(RESEND_API_KEY);
    const ipAddress = request.headers.get('x-forwarded-for') || 'Brak';
    const userAgent = request.headers.get('user-agent') || 'Brak';

    try {
        // 2. Wysyłka emaila przez Resend.com
        await resend.emails.send({
            from: 'Formularz Kontaktowy <formularz@twojadomena.pl>', // Ważne: domena musi być zweryfikowana w Resend
            to: data.recipient,
            subject: `Nowa wiadomość od ${data.name}`,
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

        // 3. Zapis wiadomości do Strapi
        await fetch(`${STRAPI_URL}/api/contacts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${STRAPI_TOKEN}`
            },
            body: JSON.stringify({
                data: {
                    imie_nazwisko: data.name,
                    email: data.email,
                    // Zakładamy, że pole `phone` istnieje w formularzu
                    // telefon: data.phone,
                    wiadomosc: data.message,
                    status_wiadomosci: 'nowa',
                    ip_address: ipAddress,
                    user_agent: userAgent
                }
            })
        });

        return new Response(JSON.stringify({ message: "Wiadomość wysłana pomyślnie!" }), { status: 200 });

    } catch (error) {
        console.error("Błąd wysyłki formularza:", error);
        return new Response(JSON.stringify({ message: "Wystąpił nieoczekiwany błąd serwera." }), { status: 500 });
    }
};