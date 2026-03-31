import Stripe from 'stripe';

// Initialize Stripe with your Secret Key from .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2023-10-16' as any, // Use the latest stable version
});

export const createPaymentIntent = async (amount: number, currency: string = 'usd', metadata: object) => {
    try {
        // Stripe expects amounts in cents (e.g., $10.00 = 1000)
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata: { ...metadata },
            automatic_payment_methods: { enabled: true },
        });

        return {
            clientSecret: paymentIntent.client_secret,
            id: paymentIntent.id,
        };
    } catch (error: any) {
        throw new Error(`Stripe Error: ${error.message}`);
    }
};

export const verifyStripeWebhook = (payload: string | Buffer, signature: string) => {
    return stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
    );
};