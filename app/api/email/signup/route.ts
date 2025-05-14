import { Resend } from 'resend';
import { WeclomeTemplate } from '@/components/email/welcome-template';

const resend = new Resend(process.env.RESEND_API_KEY!);

async function addToAudience({
    email,
    firstName,
    lastName,
    audienceId,
}: {
    email: string;
    firstName: string;
    lastName?: string;
    audienceId: string;
}) {
    const { data, error } = await resend.contacts.create({
        email,
        firstName,
        lastName,
        unsubscribed: false,
        audienceId,
    });

    if (error) {
        throw new Error(`Failed to add contact to audience: ${error.message}`);
    }

    return data;
}

async function sendWelcomeEmail({
    email,
    firstName,
}: {
    email: string;
    firstName: string;
}) {
    const { data, error } = await resend.emails.send({
        from: 'Acme <jamesdawsonwd@gmail.com>',
        to: [email],
        subject: 'Welcome to Modern Web Dev!',
        react: WeclomeTemplate({ firstName }),
    });

    if (error) {
        throw new Error(`Failed to send welcome email: ${error.message}`);
    }

    return data;
}

export async function POST(req: Request) {
    try {
        const { email, firstName, lastName } = await req.json();

        if (!email || !firstName) {
            return Response.json({ error: 'Missing email or first name' }, { status: 400 });
        }

        const audienceId = process.env.RESEND_AUDIENCE_ID!;
        await addToAudience({ email, firstName, lastName, audienceId });

        const result = await sendWelcomeEmail({ email, firstName });

        return Response.json({ success: true, emailId: result?.id });
    } catch (error) {
        return Response.json({ error: (error as Error).message }, { status: 500 });
    }
}
