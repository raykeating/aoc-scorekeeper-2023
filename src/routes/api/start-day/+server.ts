import { json } from '@sveltejs/kit';

export async function POST({ request }) {
    const { usingCopilot, difficulty } = await request.json();

    console.log(usingCopilot, difficulty);

    return json({
        success: true
    })
}