import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
export async function POST(req: NextRequest) {
    const {owner,repo,webhookUrl,accessToken}=await req.json()
    console.log(`owner:${owner},repo:${repo}, webhookUrl:${webhookUrl},accessToken:${accessToken}`)

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


    const url = `${repoUrl}/hooks`;
    console.log("GitHub API URL for Webhook:", url);

    const webhookData = {
        name: 'web',
        active: true,
        events: ["pull_request"],
        config: {
          url: webhookUrl,
          content_type: 'json',
        },
      };
      const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/hooks`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      });
      
      // Check if a webhook with the same URL already exists
      const existingWebhook = response.data.find(hook => hook.config.url === webhookUrl);
      if (existingWebhook) {
        console.log("Webhook already exists:", existingWebhook);
        // You can skip creating a new webhook or update the existing one
      }
      else{
        const response = await axios.post(url, webhookData, {
            headers: {
              Authorization: `Bearer ${accessToken}`, 
              Accept: 'application/vnd.github+json',
            },
          });
       }
      try {
        const response = await axios.get('https://api.github.com/', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      
        console.log('Scopes assigned to this token:', response.headers['x-oauth-scopes']);
      } catch (error) {
        console.error('Failed to check token scopes:', error.response?.data || error.message);
      }

 
    //   console.log(response.data)
    

    // Respond with a JSON message
    return NextResponse.json({ message: "Request fulfilled" });
}
