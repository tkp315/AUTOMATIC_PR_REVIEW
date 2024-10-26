import axios from 'axios';
import { CohereClient } from 'cohere-ai';

// Function to review the pull request using Cohere's API
interface PR_DATA {
    title?: string;
    body?: string; 
    additions?: string;
    deletions?: string;
    prNumber: number;
    owner: string;
    repo: string;
}

const cohere = new CohereClient({
    token: process.env.OPEN_AI_KEY
});

export async function reviewPullRequest(prData: PR_DATA) {
    const { 
        title = "No title provided", 
        body = "No body provided", 
        additions = "No additions provided", 
        deletions = "No deletions provided" 
    } = prData;

    const prompt = `
        You are an AI code reviewer. Review the following pull request and provide feedback.

        Pull Request Details:
        - Title: ${title}
        - Description: ${body}
        - Additions: ${additions}
        - Deletions: ${deletions}

        Provide a summary of the changes, any potential issues, and general feedback on the code quality.
    `;

    try {
        const response = await cohere.generate({
            model: "command",
            prompt: prompt,
            maxTokens: 50,
        });

        console.log("Cohere Response:", response.generations[0].text);

        const reviewComment = response.generations[0]?.text || "No feedback provided by AI";

        await postCommentToPR(reviewComment, prData.prNumber, prData.owner, prData.repo);
        return reviewComment;

    } catch (error: any) {
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);
        console.error("Error message:", error.message);

        throw new Error("Failed to get review from AI. Check console for details.");
    }
}

async function postCommentToPR(comment: string, prNumber: number, owner: string, repo: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`;

    const headers = {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
    };
    
    const data = {
        body: comment,
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log("Comment posted successfully:", response.data);
        return response.data;
    } catch (error: any) {
        console.error("Error posting comment:", error.response?.data || error.message);
        throw new Error("Failed to post comment on PR.");
    }
}
