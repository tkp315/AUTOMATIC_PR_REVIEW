import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { owner, repo, webhookUrl, accessToken } = await req.json();
    console.log("Parsed Data:", { owner, repo, webhookUrl, accessToken });

    // Validate required fields
    if (!owner || !repo || !webhookUrl) {
      return NextResponse.json({ message: 'Missing required fields: owner, repo, or webhookUrl' }, { status: 400 });
    }

    // Define the GitHub API URL for checking repository existence
    const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
    console.log("GitHub Repository URL:", repoUrl);

    // Check if the repository exists
    try {
      await axios.get(repoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Use the provided access token for authentication
          Accept: 'application/vnd.github+json',
        },
      });
    } catch (repoError) {
      console.error("Repository check error:", repoError);
      if (axios.isAxiosError(repoError) && repoError.response) {
        return NextResponse.json({ message: 'Repository not found', error: repoError.response.data }, { status: 404 });
      }
      return NextResponse.json({ message: 'Failed to check repository existence', error: String(repoError) }, { status: 500 });
    }

    // Define the GitHub API URL for creating a webhook
    const url = `${repoUrl}/hooks`;
    console.log("GitHub API URL for Webhook:", url);

    // Prepare the webhook data
    const webhookData = {
      name: 'web',
      active: true,
      events: ["pull_request"],
      config: {
        url: webhookUrl,
        content_type: 'json',
      },
    };

    // Send a POST request to GitHub API to create the webhook
    const response = await axios.post(url, webhookData, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Use the retrieved token
        Accept: 'application/vnd.github+json',
      },
    });
    console.log(response)

    // Return a success response with the data
    return NextResponse.json({ message: 'Webhook created successfully', data: response.data }, { status: 200 });

  } catch (error: unknown) {
    console.error('Error creating webhook:', error);

    // Return a structured error response
    if (axios.isAxiosError(error) && error.response) {
      // Log the response from GitHub API if available
      console.error("GitHub API Error:", error.response.data);
      return NextResponse.json({ message: 'Failed to create webhook', error: error.response.data }, { status: error.response.status });
    } else {
      return NextResponse.json({ message: 'Failed to create webhook', error: String(error) }, { status: 500 });
    }
  }
}
