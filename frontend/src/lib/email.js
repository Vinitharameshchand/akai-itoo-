import emailjs from '@emailjs/browser'

const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

export const sendWaitlistEmail = async (userData) => {
    if (!serviceId || !templateId || !publicKey) {
        console.error('EmailJS credentials missing.')
        return { success: false, error: 'Config missing' }
    }

    try {
        const response = await emailjs.send(
            serviceId,
            templateId,
            {
                to_name: userData.name,
                to_email: userData.email,
                reply_to: 'no-reply@vibeaura.com', // Customize as needed
            },
            publicKey
        )
        return { success: true, response }
    } catch (error) {
        console.error('EmailJS Error:', error)
        return { success: false, error }
    }
}
