import { supabase } from "./supabaseClient";

export interface StartChallengeResponse {
    success: boolean;
    language?: {
        id: string;
        name: string;
        difficulty: string;
    }
}

export async function startChallenge(difficulty: string, usingCopilot: string): Promise<StartChallengeResponse> {
    const { data, error } = await supabase.auth.getSession();

    if (usingCopilot.toLowerCase() !== 'y' && usingCopilot.toLowerCase() !== 'n') {
        alert('are you using copilot? (enter y/n)');
        return { success: false };
    }

    if (error) {
        alert('You must be logged in to start a challenge');
        return { success: false };
    }
    // send a request to /api/start-day
    const res = await fetch('/api/start-day', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${data.session?.access_token}`
        },
        body: JSON.stringify({
            difficulty,
            usingCopilot: usingCopilot.toLowerCase() === 'y' ? true : false
        })
    });

    const json = await res.json();

    if (!res.ok) {
        alert(json.error);
        return { success: false };
    }

    return { success: true, language: json.language };

}