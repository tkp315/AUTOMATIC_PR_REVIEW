import { NextRequest, NextResponse } from "next/server";
import { reviewPullRequest } from '@/lib/openAi'; // Ensure your OpenAI function is correctly imported

export async function POST(req: NextRequest) {
    const payload = await req.json();
    console.log(payload);
    const eventType = req.headers.get('x-github-event');

    if (eventType === 'pull_request') {
        const prData = payload.pull_request;
        console.log("Pull request Data", prData);

        // Create a PR object with relevant data
        const pr_obj = {
            title: prData.title,
            body: prData.body,
            additions: prData.additions,
            deletions: prData.deletions,
        };

        // Call the OpenAI function with the PR data
        try {
            const aiReview = await reviewPullRequest(pr_obj); // Assuming openAi function takes the PR object
            console.log("AI Review:", aiReview);

            // You might want to post this review back to the PR as a comment
            // This part of the code will depend on how you handle comments in your GitHub repo
            // await postCommentToPR(prData.number, aiReview);
            if(!aiReview){
                console.log("it is not received")
            }

            return NextResponse.json({ message: "Pull request processed successfully", aiReview });
        } catch (error) {
            console.error("Error getting AI review:", error);
            return NextResponse.json({ message: "Failed to get review from AI", error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ message: 'Not a pull request event' }, { status: 400 });
}
