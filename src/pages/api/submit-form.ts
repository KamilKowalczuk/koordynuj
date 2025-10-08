// src/pages/api/contact.ts
import type { APIRoute } from 'astro';
import { Resend } from 'resend';

// ⚡ KRYTYCZNE: To sprawia, że endpoint działa jako serverless function na Netlify
export const prerender = false;

const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;
const STRAPI_URL = import.meta.env.STRAPI_URL;
const STRAPI_TOKEN = import.meta.env.STRAPI_TOKEN;

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        
        // 1. WALIDACJA I ZABEZPIECZENIA
        if (data.hp) { 
            return new Response(JSON.stringify({ 
                message: "Błąd weryfikacji anty-spam." 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (data.t < 3000) { 
            return new Response(JSON.stringify({ 
                message: "Formularz wypełniono zbyt szybko." 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }
        
        if (!data.name || !data.email || !data.message || !data.phone) {
            return new Response(JSON.stringify({ 
                message: "Proszę wypełnić wszystkie wymagane pola." 
            }), { 
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // 2. PRZYGOTOWANIE DANYCH
        const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 'Brak';
        const userAgent = request.headers.get('user-agent') || 'Brak';
        const resend = new Resend(RESEND_API_KEY);

        // 3. WYSYŁKA EMAILA PRZEZ RESEND
        await resend.emails.send({
            from: 'Formularz Kontaktowy <formularz@koordynujzdrowie.pl>',
            to: data.recipient,
            subject: `Nowa wiadomość od ${data.name}`,
            html: `
                <h2>Nowa wiadomość z formularza kontaktowego</h2>
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">Imię i nazwisko:</td>
                            <td style="padding: 10px;">${data.name}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">Email:</td>
                            <td style="padding: 10px;"><a href="mailto:${data.email}">${data.email}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold;">Telefon:</td>
                            <td style="padding: 10px;"><a href="tel:${data.phone}">${data.phone}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; background: #f5f5f5; font-weight: bold; vertical-align: top;">Wiadomość:</td>
                            <td style="padding: 10px;">${data.message.replace(/\n/g, '<br>')}</td>
                        </tr>
                    </table>
                    <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="font-size: 12px; color: #666;">
                        <strong>Metadata:</strong><br>
                        IP: ${ipAddress}<br>
                        Przeglądarka: ${userAgent}
                    </p>
                </div>
            `,
        });

        // 4. ZAPIS DO STRAPI
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
                    // telefon: data.phone,
                    wiadomosc: data.message,
                    status_wiadomosci: 'nowa',
                    ip_address: ipAddress,
                    user_agent: userAgent
                }
            })
        });

        if (!strapiResponse.ok) {
            console.error('Błąd zapisu do Strapi:', await strapiResponse.text());
            // Nie przerywamy - email został wysłany
        }

        return new Response(JSON.stringify({ 
            message: "Wiadomość wysłana pomyślnie!" 
        }), { 
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("❌ Błąd wysyłki formularza:", error);
        return new Response(JSON.stringify({ 
            message: "Wystąpił nieoczekiwany błąd serwera." 
        }), { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};