import axios from 'axios';

// Your OpenAI API key
const OPENAI_API_KEY = process.env.OPEN_AI_KEY; // Store your API key securely in environment variables

// Function to review the pull request using OpenAI's API
interface PR_DATA{
    title?:string,
    body?:string,
    additions?:string,
    deletions?:string
}
export async function reviewPullRequest(prData:PR_DATA) {
    const prompt = `
        You are an AI code reviewer. Review the following pull request and provide feedback.

        Pull Request Details:
        - Title: ${prData.title}
        - Description: ${prData.body}
        - Additions: ${prData.additions}
        - Deletions: ${prData.deletions}

        Provide a summary of the changes, any potential issues, and general feedback on the code quality.
    `;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo', // or gpt-4, depending on your access
            messages: [
                { role: 'user', content: prompt }
            ],
            max_tokens: 300, // Adjust this value based on how long you want the response
        }, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        // Extract and return the AI's response
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("Error calling OpenAI API:", error);
        throw new Error("Failed to get review from AI");
    }
}
